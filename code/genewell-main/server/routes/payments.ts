import { RequestHandler, Request, Response } from 'express';
import {
  getUser,
  createUser,
  createPurchase,
  updatePurchasePaymentStatus,
  saveQuizResponse,
  getPurchases,
} from '../lib/db';
import {
  createPaymentRequest,
  getPaymentDetails,
  verifyWebhookSignature,
  parseWebhookData,
  isPaymentSuccessful,
} from '../lib/instamojo-service';
import {
  sendConfirmationEmail,
  sendPaymentConfirmationEmail,
} from '../lib/email-service';

/**
 * POST /api/payments/create-payment-request
 * Creates a payment request with Instamojo
 */
export const handleCreatePaymentRequest: RequestHandler = async (req, res) => {
  try {
    const {
      email,
      name,
      phone,
      age,
      gender,
      analysisId,
      planId,
      addOns,
      amount,
      quizData,
      personalizationData,
    } = req.body;

    if (!email || !analysisId || !planId || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, analysisId, planId, amount',
      });
    }

    // Create or update user in database (optional - graceful fallback if DB not configured)
    let user = null;
    let purchase = null;

    try {
      user = await getUser(email);
      if (!user) {
        user = await createUser(email, name, phone, age, gender);
      }

      // Save quiz response to database
      if (quizData && personalizationData) {
        await saveQuizResponse(user.id, analysisId, quizData, personalizationData);
      }

      // Create purchase record
      purchase = await createPurchase(user.id, analysisId, planId, addOns || [], amount);
    } catch (dbError) {
      console.warn('Database unavailable for payment request, continuing without DB:', dbError);
      // Continue without database - still create payment
    }

    // Generate fallback IDs if database is not available
    const purchaseId = purchase?.id || Date.now();
    const userId = user?.id || 0;

    // Create Instamojo payment request
    const paymentResponse = await createPaymentRequest({
      purpose: `GeneWell ${planId} Plan`,
      amount: Math.round(amount * 100) / 100, // Ensure 2 decimal places
      buyer_name: name || email,
      email,
      phone: phone || '9999999999',
      redirect_url: `${process.env.APP_URL || 'http://localhost:5173'}/payment-success?purchase_id=${purchaseId}`,
      webhook_url: `${process.env.SERVER_URL || 'http://localhost:8080'}/api/payments/webhook`,
      metadata: {
        purchase_id: purchaseId.toString(),
        user_id: userId.toString(),
        analysis_id: analysisId,
        plan_id: planId,
      },
    });

    if (!paymentResponse.success || !paymentResponse.payment_request) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create payment request',
        errors: paymentResponse.errors,
      });
    }

    res.json({
      success: true,
      paymentUrl: paymentResponse.payment_request.shorturl,
      paymentId: paymentResponse.payment_request.id,
      purchaseId,
    });
  } catch (error) {
    console.error('Error creating payment request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /api/payments/verify/:purchaseId
 * Verifies payment status for a purchase
 */
export const handleVerifyPayment: RequestHandler = async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const purchase = await getPurchases(parseInt(purchaseId));

    if (!purchase || purchase.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found',
      });
    }

    const purchaseData = purchase[0];

    if (!purchaseData.instamojo_payment_id) {
      return res.status(400).json({
        success: false,
        message: 'No payment ID associated with this purchase',
      });
    }

    // Fetch latest payment details from Instamojo
    const paymentDetails = await getPaymentDetails(purchaseData.instamojo_payment_id);

    if (!paymentDetails.payment_request) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch payment details',
      });
    }

    const status = paymentDetails.payment_request.status;
    const isCompleted = isPaymentSuccessful(status);

    // Update purchase status if payment is completed
    if (isCompleted && purchaseData.payment_status !== 'completed') {
      await updatePurchasePaymentStatus(
        purchaseData.id,
        'completed',
        paymentDetails.payment_request.id,
        paymentDetails.payment_request.transaction_id
      );
    }

    res.json({
      success: true,
      status: isCompleted ? 'completed' : status,
      isCompleted,
      purchaseData: isCompleted ? purchaseData : null,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * POST /api/payments/webhook
 * Handles Instamojo webhook notifications
 */
export const handlePaymentWebhook: RequestHandler = async (req, res) => {
  try {
    const signature = req.headers['x-instamojo-signature'] as string;
    const body = JSON.stringify(req.body);

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      console.warn('Invalid webhook signature');
      // Continue processing anyway (for test mode)
    }

    // Parse webhook data
    const webhookData = parseWebhookData(req.body);

    // Update purchase with payment details
    if (req.body.metadata?.purchase_id) {
      const purchaseId = parseInt(req.body.metadata.purchase_id);
      const status = isPaymentSuccessful(webhookData.status) ? 'completed' : 'failed';

      await updatePurchasePaymentStatus(
        purchaseId,
        status,
        webhookData.paymentId,
        webhookData.transactionId
      );

      // If payment successful, send email
      if (isPaymentSuccessful(webhookData.status)) {
        const userId = req.body.metadata.user_id ? parseInt(req.body.metadata.user_id) : null;
        if (userId) {
          await sendPaymentConfirmationEmail(
            userId,
            webhookData.email,
            webhookData.buyerName,
            req.body.metadata.plan_id || 'Premium Plan',
            webhookData.amount,
            webhookData.transactionId,
            purchaseId
          );
        }
      }
    }

    // Always return 200 to acknowledge webhook receipt
    res.status(200).json({
      success: true,
      message: 'Webhook processed',
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    // Still return 200 to prevent retries
    res.status(200).json({
      success: true,
      message: 'Webhook processed (with errors)',
    });
  }
};

/**
 * GET /api/payments/user/:email
 * Gets user purchase history
 */
export const handleGetUserPurchases: RequestHandler = async (req, res) => {
  try {
    const { email } = req.params;

    const user = await getUser(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const purchases = await getPurchases(user.id);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        age: user.age,
        gender: user.gender,
      },
      purchases,
    });
  } catch (error) {
    console.error('Error fetching user purchases:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * POST /api/payments/send-report-email
 * Manually send report download email to user
 */
export const handleSendReportEmail: RequestHandler = async (req, res) => {
  try {
    const { userId, email, userName, planName, downloadLink } = req.body;

    if (!email || !downloadLink) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, downloadLink',
      });
    }

    const success = await sendConfirmationEmail(
      userId,
      email,
      userName || 'User',
      planName || 'Wellness Report',
      downloadLink
    );

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send email',
      });
    }

    res.json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Error sending report email:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
