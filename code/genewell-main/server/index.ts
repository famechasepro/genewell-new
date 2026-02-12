import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleRegister, handleLogin, handleGetProfile } from "./routes/auth";
import {
  handleDNAUpload,
  handleGetAnalysisResults,
  handleGenerateReport,
} from "./routes/dna";
import { handleSubmitQuiz, handleGetQuizResults } from "./routes/quiz";
import { handleGetDashboard, handleGetProgressStats } from "./routes/dashboard";
import {
  handleWellnessQuizSubmission,
  handleWellnessPayment,
  handleWellnessDownload,
  handleProductDownload,
  handleWellnessPurchase,
  handlePDFDownload,
  handlePDFDownloadBase64,
  handleListUserPDFs,
  handleUserDashboard,
  handleStorageStats,
  handleSamplePDF,
} from "./routes/wellness";
import {
  handleCreatePaymentRequest,
  handleCreateDirectPaymentLink,
  handleVerifyPayment,
  handlePaymentWebhook,
  handleGetUserPurchases,
  handleSendReportEmail,
} from "./routes/payments";
import {
  requireAdmin,
  handleGetAllUsers,
  handleGetUserDetails,
  handleAdminDashboard,
  handleGetAllPurchases,
  handleGetQuizResponses,
  handleGetEmailLogs,
  handleExportUsersCSV,
} from "./routes/admin";
import { initializeDatabase } from "./lib/db";
import { initializeEmailService } from "./lib/email-service";
import { startCleanupJob } from "./lib/storage";

// Initialize services
async function initializeServices() {
  try {
    // Initialize database
    if (process.env.DATABASE_URL) {
      await initializeDatabase();
      console.log("Database initialized");
    }

    // Initialize email service
    await initializeEmailService();
  } catch (error) {
    console.error("Error initializing services:", error);
    // Continue even if services fail to initialize
  }
}

export function createServer() {
  const app = express();

  // Initialize services
  initializeServices().catch(console.error);

  // Start cleanup job for expired PDFs
  startCleanupJob();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/login", handleLogin);
  app.get("/api/auth/profile", handleGetProfile);

  // DNA processing routes
  app.post("/api/dna/upload", handleDNAUpload);
  app.get("/api/dna/results", handleGetAnalysisResults);
  app.get("/api/dna/report", handleGenerateReport);

  // Quiz routes
  app.post("/api/quiz/submit", handleSubmitQuiz);
  app.get("/api/quiz/results", handleGetQuizResults);

  // Dashboard routes
  app.get("/api/dashboard", handleGetDashboard);
  app.get("/api/dashboard/progress", handleGetProgressStats);

  // Wellness quiz routes - NEW PERSONALIZATION SYSTEM
  app.post("/api/wellness/quiz", handleWellnessQuizSubmission);
  app.post("/api/wellness/purchase", handleWellnessPurchase);
  app.get("/api/wellness/download-pdf/:pdfRecordId", handlePDFDownload);
  app.get("/api/wellness/download-pdf-base64/:pdfRecordId", handlePDFDownloadBase64);
  app.get("/api/wellness/pdfs", handleListUserPDFs);
  app.get("/api/wellness/dashboard/:userId", handleUserDashboard);
  app.get("/api/wellness/stats", handleStorageStats);
  app.get("/api/wellness/sample-pdf", handleSamplePDF);

  // Legacy wellness routes (for backward compatibility)
  app.post("/api/wellness/payment", handleWellnessPayment);
  app.get("/api/wellness/download/:analysisId", handleWellnessDownload);

  // Product download routes (legacy)
  app.get("/api/products/download/:productId", handleProductDownload);

  // Payment routes
  app.post("/api/payments/create-payment-request", handleCreatePaymentRequest);
  app.post("/api/payments/create-direct-payment-link", handleCreateDirectPaymentLink);
  app.get("/api/payments/verify/:purchaseId", handleVerifyPayment);
  app.post("/api/payments/webhook", handlePaymentWebhook);
  app.get("/api/payments/user/:email", handleGetUserPurchases);
  app.post("/api/payments/send-report-email", handleSendReportEmail);

  // Admin routes - require authentication
  app.get("/api/admin/users", requireAdmin, handleGetAllUsers);
  app.get("/api/admin/users/:userId", requireAdmin, handleGetUserDetails);
  app.get("/api/admin/dashboard", requireAdmin, handleAdminDashboard);
  app.get("/api/admin/purchases", requireAdmin, handleGetAllPurchases);
  app.get("/api/admin/quiz-responses", requireAdmin, handleGetQuizResponses);
  app.get("/api/admin/email-logs", requireAdmin, handleGetEmailLogs);
  app.get("/api/admin/export/users-csv", requireAdmin, handleExportUsersCSV);

  return app;
}
