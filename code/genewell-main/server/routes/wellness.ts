import { RequestHandler } from "express";
import {
  WellnessQuizSchema,
  WellnessBlueprint,
  QuizSubmissionResponse,
  PaymentResponse,
  DownloadResponse,
} from "../../shared/api";
import {
  analyzeQuizData,
  PersonalizationData,
} from "../lib/personalization-engine";
import { generatePersonalizedPDF } from "../lib/pdf-generator";
import {
  createOrGetUser,
  storeQuizResponse,
  createOrder,
  storePDFFile,
  getPDFRecord,
  getPDFBuffer,
  STORAGE,
  getStorageStats,
  getUserDashboard,
  getPDFRecordsByUserId,
} from "../lib/storage";
import { getProductById } from "../../client/lib/products";

// Helper to generate analysis ID
function generateAnalysisId(): string {
  return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper to determine tier price
function getTierPrice(tier: string): number {
  const priceMap: Record<string, number> = {
    free: 0,
    essential: 599,
    premium: 1499,
    coaching: 9999,
  };
  return priceMap[tier] || 0;
}

/**
 * POST /api/wellness/quiz
 * Handles quiz submission with personalized analysis
 */
export const handleWellnessQuizSubmission: RequestHandler = async (
  req,
  res,
) => {
  try {
    // Validate quiz data
    const validatedData = WellnessQuizSchema.parse(req.body);

    // Extract user info
    const { userName, userEmail, ...quizAnswers } = req.body;

    // Generate IDs
    const analysisId = generateAnalysisId();

    // Create or get user
    const user = createOrGetUser(
      userEmail || `user_${analysisId}@genewell.local`,
      userName || "User",
      validatedData.age,
      validatedData.gender,
    );

    // Store quiz response
    const quizResponse = storeQuizResponse(user.id, validatedData, analysisId);

    // Generate personalized analysis
    const personalizationData: PersonalizationData = analyzeQuizData(
      validatedData,
      userName,
      userEmail,
    );

    // Store personalization data in memory for later PDF generation
    STORAGE.personalizationDataCache =
      STORAGE.personalizationDataCache || new Map();
    (STORAGE.personalizationDataCache as any).set(
      analysisId,
      personalizationData,
    );

    const response: QuizSubmissionResponse = {
      success: true,
      analysisId,
      blueprint: createBlueprintFromPersonalization(personalizationData),
      paymentRequired: false,
      message: "Wellness analysis generated successfully!",
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Quiz submission error:", error);
    res.status(400).json({
      success: false,
      message: "Invalid quiz data",
    });
  }
};

/**
 * POST /api/wellness/purchase
 * Handles plan purchase and PDF generation
 */
export const handleWellnessPurchase: RequestHandler = async (req, res) => {
  try {
    const { analysisId, planTier, addOns = [], quizData, language = "en" } = req.body;

    if (!analysisId || !planTier) {
      return res.status(400).json({
        success: false,
        message: "Missing analysisId or planTier",
      });
    }

    // Get personalization data from cache, or regenerate if not found
    const personalizationDataCache = (STORAGE.personalizationDataCache ||
      new Map()) as any;
    let personalizationData = personalizationDataCache.get(analysisId);

    // If personalization data is not in cache but quiz data is provided, regenerate it
    if (!personalizationData && quizData) {
      console.log(
        `Regenerating personalization data for analysisId: ${analysisId}`,
      );
      personalizationData = analyzeQuizData(
        quizData,
        quizData.userName,
        quizData.userEmail,
      );
      // Store it in cache for future use
      personalizationDataCache.set(analysisId, personalizationData);
    }

    if (!personalizationData) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found. Please complete the quiz first.",
      });
    }

    // Create order
    const order = createOrder(
      analysisId,
      planTier as any,
      addOns,
      getTierPrice(planTier),
    );

    // Generate personalized PDF
    const pdfChunks = await generatePersonalizedPDF(personalizationData, {
      tier: planTier as any,
      addOns,
      orderId: order.orderId,
      timestamp: new Date().toISOString(),
    });

    // Store PDF file
    const pdfRecord = storePDFFile(
      pdfChunks.buffer,
      pdfChunks.filename,
      order.orderId,
      analysisId,
      planTier,
      addOns,
      personalizationData.profile.name,
    );

    res.status(200).json({
      success: true,
      orderId: order.orderId,
      pdfRecordId: pdfRecord.pdfRecordId,
      downloadUrl: `/api/wellness/download-pdf/${pdfRecord.pdfRecordId}`,
      message: "PDF generated successfully!",
    });
  } catch (error) {
    console.error("Purchase error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process purchase",
    });
  }
};

/**
 * GET /api/wellness/download-pdf/:pdfRecordId
 * Downloads the personalized PDF
 */
export const handlePDFDownload: RequestHandler = async (req, res) => {
  try {
    const { pdfRecordId } = req.params;
    console.log(`PDF Download requested for: ${pdfRecordId}`);

    const pdfRecord = getPDFRecord(pdfRecordId);
    if (!pdfRecord) {
      console.error(`PDF record not found: ${pdfRecordId}`);
      console.log(
        `Available PDF records: ${Array.from((STORAGE.pdfRecords || new Map()).keys()).join(", ")}`,
      );
      return res.status(404).json({
        success: false,
        message: "PDF not found",
      });
    }

    console.log(`PDF record found:`, pdfRecord);
    const buffer = getPDFBuffer(pdfRecordId);
    if (!buffer) {
      console.error(`PDF buffer not accessible: ${pdfRecord.filepath}`);
      return res.status(404).json({
        success: false,
        message: "PDF file not accessible",
      });
    }

    console.log(
      `Sending PDF: ${pdfRecord.filename}, size: ${buffer.length} bytes`,
    );

    // Send as download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${pdfRecord.filename}"`,
    );
    res.setHeader("Content-Length", buffer.length);
    res.send(buffer);
  } catch (error) {
    console.error("PDF download error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download PDF",
    });
  }
};

/**
 * GET /api/wellness/download-pdf-base64/:pdfRecordId
 * Returns PDF as base64 data URL for inline viewing
 */
export const handlePDFDownloadBase64: RequestHandler = async (req, res) => {
  try {
    const { pdfRecordId } = req.params;

    const pdfRecord = getPDFRecord(pdfRecordId);
    if (!pdfRecord) {
      return res.status(404).json({
        success: false,
        message: "PDF not found",
      });
    }

    const buffer = getPDFBuffer(pdfRecordId);
    if (!buffer) {
      return res.status(404).json({
        success: false,
        message: "PDF file not accessible",
      });
    }

    const base64 = buffer.toString("base64");
    const dataUrl = `data:application/pdf;base64,${base64}`;

    const response: DownloadResponse = {
      success: true,
      pdfUrl: dataUrl,
      filename: pdfRecord.filename,
      expiresAt: pdfRecord.expiresAt,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("PDF base64 download error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download PDF",
    });
  }
};

/**
 * GET /api/wellness/pdfs
 * Lists all PDFs for a user (requires email or userId in query)
 */
export const handleListUserPDFs: RequestHandler = async (req, res) => {
  try {
    const { email, userId } = req.query;

    // Find user
    let userPdfs: any[] = [];

    if (userId) {
      userPdfs = getPDFRecordsByUserId(userId as string);
    } else if (email) {
      // Find user by email and get their PDFs
      const users = Array.from(STORAGE.users.values());
      const user = users.find((u) => u.email === email);
      if (user) {
        userPdfs = getPDFRecordsByUserId(user.id);
      }
    }

    const pdfs = userPdfs.map((p) => ({
      pdfRecordId: p.pdfRecordId,
      orderId: p.orderId,
      planTier: p.planTier,
      addOns: p.addOns,
      userName: p.userName,
      generatedAt: p.generatedAt,
      expiresAt: p.expiresAt,
      downloadUrl: `/api/wellness/download-pdf/${p.pdfRecordId}`,
    }));

    res.status(200).json({
      success: true,
      count: pdfs.length,
      pdfs,
    });
  } catch (error) {
    console.error("List PDFs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to list PDFs",
    });
  }
};

/**
 * GET /api/wellness/dashboard/:userId
 * Returns user dashboard with all their data
 */
export const handleUserDashboard: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    const dashboard = getUserDashboard(userId);
    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      ...dashboard,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
    });
  }
};

/**
 * GET /api/wellness/stats
 * Returns storage and system statistics
 */
export const handleStorageStats: RequestHandler = async (req, res) => {
  try {
    const stats = getStorageStats();
    res.status(200).json({
      success: true,
      ...stats,
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve stats",
    });
  }
};

// ============================================
// LEGACY ENDPOINTS (for backward compatibility)
// ============================================

export const handleWellnessPayment: RequestHandler = async (req, res) => {
  // Deprecated - use handleWellnessPurchase instead
  try {
    const { analysisId, email, planType, amount } = req.body;

    if (!analysisId || !email || !planType) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment information",
      });
    }

    const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const response: PaymentResponse = {
      success: true,
      paymentId,
      downloadUrl: `/api/wellness/download/${analysisId}`,
      message: "Payment successful! Your blueprint is ready for download.",
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Payment processing error:", error);
    res.status(500).json({
      success: false,
      message: "Payment processing failed",
    });
  }
};

export const handleWellnessDownload: RequestHandler = async (req, res) => {
  // Legacy endpoint - try to find and return a PDF
  try {
    const { analysisId } = req.params;

    // Try to find a PDF for this analysis
    const pdfs = Array.from(STORAGE.pdfRecords.values()).filter(
      (p) => p.analysisId === analysisId,
    );

    if (pdfs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No PDF found for this analysis",
      });
    }

    const pdfRecord = pdfs[0];
    const buffer = getPDFBuffer(pdfRecord.pdfRecordId);

    if (!buffer) {
      return res.status(404).json({
        success: false,
        message: "PDF file not accessible",
      });
    }

    const base64 = buffer.toString("base64");

    const response: DownloadResponse = {
      success: true,
      pdfUrl: `data:application/pdf;base64,${base64}`,
      filename: pdfRecord.filename,
      expiresAt: pdfRecord.expiresAt,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate download",
    });
  }
};

export const handleProductDownload: RequestHandler = async (req, res) => {
  // Legacy endpoint for product templates
  try {
    const { productId } = req.params;

    const product = getProductById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Create a generic PDF from product template
    const PDFDocument = require("pdfkit");
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on("data", (d: any) => chunks.push(d as Buffer));

    doc.fontSize(24).text(product.name);
    doc.moveDown();
    doc.fontSize(12).text(product.description);
    doc.moveDown();
    doc.text("Features:");
    product.details.forEach((detail: string) => {
      doc.text(`• ${detail}`);
    });

    doc.end();

    const buffer: Buffer = await new Promise((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });

    const base64 = buffer.toString("base64");

    res.status(200).json({
      success: true,
      pdfUrl: `data:application/pdf;base64,${base64}`,
      filename: `${product.name.toLowerCase().replace(/\s+/g, "-")}.pdf`,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error("Product download error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate product download",
    });
  }
};

// ============================================
// HELPER FUNCTION
// ============================================

function createBlueprintFromPersonalization(
  data: PersonalizationData,
): WellnessBlueprint {
  const { profile, insights } = data;

  return {
    metabolismType: {
      type: "moderate",
      description: insights.metabolicInsight,
      characteristics: [
        `BMR: ${profile.estimatedBMR} calories`,
        `TDEE: ${profile.estimatedTDEE} calories`,
        `Daily calorie range: ${insights.calorieRange.min} - ${insights.calorieRange.max}`,
      ],
    },

    nutritionPlan: {
      bestFoods: [
        "Lean proteins",
        "Whole grains",
        "Fresh vegetables",
        "Healthy fats",
      ],
      worstFoods: ["Processed foods", "Refined sugars", "Trans fats"],
      mealTiming: {
        breakfast: insights.recommendedMealTimes[0],
        lunch: insights.recommendedMealTimes[1],
        dinner: insights.recommendedMealTimes[2],
        snacks: ["Mid-morning", "Mid-afternoon"],
      },
      fastingWindow: {
        startTime: "8:00 PM",
        endTime: "8:00 AM",
        duration: "12 hours",
        benefits: ["Improved digestion", "Better energy", "Weight management"],
      },
      hydrationSchedule: [
        "Upon waking: 500ml water",
        "With meals: 250ml water",
        "Throughout day: Regular sipping",
      ],
      portions: {
        protein: "Palm-sized",
        carbs: "Cupped hand",
        fats: "Thumb-sized",
        vegetables: "2 cupped hands",
      },
    },

    fitnessRoutine: {
      workoutType: profile.exercisePreference,
      frequency: profile.mealFrequency,
      duration: profile.exerciseIntensity === "low" ? 20 : 30,
      weeklyPlan: [
        {
          day: "Monday",
          activity: "Strength Training",
          duration: "30 min",
          intensity: profile.exerciseIntensity,
        },
        {
          day: "Wednesday",
          activity: "Cardio",
          duration: "25 min",
          intensity: profile.exerciseIntensity,
        },
        {
          day: "Friday",
          activity: "Flexibility",
          duration: "20 min",
          intensity: "low",
        },
      ],
      homeExercises: [
        {
          name: "Push-ups",
          sets: "3 sets",
          reps: "10-15 reps",
          description: "Upper body strength",
        },
        {
          name: "Squats",
          sets: "3 sets",
          reps: "15-20 reps",
          description: "Lower body strength",
        },
      ],
    },

    stressManagement: {
      techniques: [
        "Deep breathing",
        "Meditation",
        "Yoga",
        "Walking",
        "Journaling",
      ],
      dailyRoutine: [
        {
          time: "Morning",
          activity: "5-min breathing",
          duration: "5 min",
        },
        {
          time: "Evening",
          activity: "Meditation",
          duration: "15 min",
        },
      ],
      emergencyProtocols: [
        "4-7-8 breathing",
        "Cold water on wrists",
        "Step outside",
      ],
      breathingExercises: [
        {
          name: "Box Breathing",
          technique: "4-4-4-4 count",
          duration: "5 minutes",
        },
      ],
    },

    sleepOptimization: {
      bedtime: "10:30 PM",
      wakeTime: "6:30 AM",
      sleepHygiene: [
        "Dark room",
        "Cool temperature",
        "No screens 60 min before bed",
        "Consistent schedule",
      ],
      environmentTips: [
        "Blackout curtains",
        "White noise machine",
        "Comfortable bedding",
      ],
      supplementSuggestions: ["Magnesium", "Melatonin", "Chamomile tea"],
    },

    supplementPlan: {
      essential: profile.supplementPriority.slice(0, 3).map((supp) => ({
        name: supp.split("(")[0].trim(),
        dosage: "As indicated",
        timing: "With meals",
        benefit: "Nutritional support",
      })),
      optional: profile.supplementPriority.slice(3).map((supp) => ({
        name: supp.split("(")[0].trim(),
        dosage: "As indicated",
        timing: "As needed",
        benefit: "Additional support",
      })),
      warnings: [
        "Consult healthcare provider",
        "Monitor for reactions",
        "Buy from reputable sources",
      ],
    },

    weeklyPlanner: [
      {
        day: "Monday",
        mealPrep: ["Meal prep", "Grocery shopping"],
        exercise: "Strength training",
        selfCare: "Planning",
        goals: ["Start week strong"],
      },
    ],

    personalizedTips: [
      insights.metabolicInsight,
      insights.workoutStrategy,
      insights.sleepStrategy,
      insights.stressStrategy,
    ],

    progressTracking: {
      weeklyMetrics: [
        "Energy level",
        "Sleep quality",
        "Stress level",
        "Exercise completion",
      ],
      monthlyGoals: ["Health markers", "Weight management", "Consistency"],
      redFlags: ["Persistent fatigue", "Increased stress", "Sleep issues"],
    },

    confidenceScore: Math.min(95, 70 + Object.keys(profile).length),
    generatedAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  };
}
