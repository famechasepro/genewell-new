import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Upload from "./pages/Upload";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Quiz from "./pages/Quiz";
import QuizResults from "./pages/QuizResults";
import Download from "./pages/Download";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import AdminDashboard from "./pages/AdminDashboard";
import PlaceholderPage from "./pages/PlaceholderPage";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/quiz-results" element={<QuizResults />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/download" element={<Download />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route
            path="/demo"
            element={
              <PlaceholderPage
                title="Sample DNA Report"
                description="Explore a comprehensive sample of our DNA analysis report to see the kind of personalized insights you'll receive."
              />
            }
          />
          <Route
            path="/reports"
            element={
              <PlaceholderPage
                title="Your Reports"
                description="Access all your generated wellness reports, download guides, and track your progress over time."
              />
            }
          />
          <Route
            path="/premium"
            element={
              <PlaceholderPage
                title="Premium Features"
                description="Unlock advanced analytics, personalized coaching, and exclusive wellness content with our premium plans."
              />
            }
          />
          <Route
            path="/help"
            element={
              <PlaceholderPage
                title="Help Center"
                description="Find answers to common questions, troubleshooting guides, and contact support for assistance."
              />
            }
          />
          <Route
            path="/privacy"
            element={
              <PlaceholderPage
                title="Privacy Policy"
                description="Learn how we protect your genetic data and personal information with industry-leading security measures."
              />
            }
          />
          <Route
            path="/terms"
            element={
              <PlaceholderPage
                title="Terms of Service"
                description="Review our terms of service and user agreement for using the GeneWell platform."
              />
            }
          />
          <Route
            path="/contact"
            element={
              <PlaceholderPage
                title="Contact Us"
                description="Get in touch with our team for support, partnerships, or general inquiries about GeneWell."
              />
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
