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
import { startCleanupJob } from "./lib/storage";

export function createServer() {
  const app = express();

  // Start cleanup job for expired PDFs
  startCleanupJob();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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

  // Legacy wellness routes (for backward compatibility)
  app.post("/api/wellness/payment", handleWellnessPayment);
  app.get("/api/wellness/download/:analysisId", handleWellnessDownload);

  // Product download routes (legacy)
  app.get("/api/products/download/:productId", handleProductDownload);

  return app;
}
