import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Sparkles,
  CheckCircle,
  Download as DownloadIcon,
  Mail,
  FileText,
  AlertCircle,
  Loader,
  ArrowLeft,
  Eye,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import LegalFooter from "@/components/LegalFooter";
import {
  getProductByPlanId,
  getAddOnById,
  PlanConfiguration,
} from "@/lib/products";

interface PDFData {
  pdfRecordId: string;
  orderId: string;
  planTier: string;
  userName: string;
  generatedAt: string;
  expiresAt: string;
  downloadUrl: string;
  pageCount: number;
}

export default function Download() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pdfData, setPdfData] = useState<PDFData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");
  const [showInfo, setShowInfo] = useState(true);

  const quizData = JSON.parse(localStorage.getItem("quizData") || "{}");
  const analysisId = localStorage.getItem("analysisId");

  // Get configuration from state or localStorage
  const [configuration, setConfiguration] = useState<PlanConfiguration | null>(
    null
  );

  useEffect(() => {
    const stateConfig =
      location.state?.configuration || location.state?.planId
        ? {
            planId:
              location.state?.planId || location.state?.configuration?.planId,
            selectedAddOns:
              location.state?.addOns ||
              location.state?.configuration?.selectedAddOns ||
              [],
            totalPrice: location.state?.configuration?.totalPrice || 0,
          }
        : JSON.parse(localStorage.getItem("planConfiguration") || "null");

    setConfiguration(stateConfig);

    if (stateConfig && analysisId) {
      generatePDF(stateConfig);
    }
  }, [location.state, analysisId]);

  const generatePDF = async (config: PlanConfiguration) => {
    setIsLoading(true);
    setError("");
    setShowInfo(true);

    try {
      const freshAnalysisId = localStorage.getItem("analysisId");
      const savedQuizData = localStorage.getItem("quizData");

      if (!freshAnalysisId) {
        throw new Error(
          "Analysis ID not found. Please complete the quiz first."
        );
      }

      const planTier = config.planId.replace("_blueprint", "");

      console.log("Generating PDF...", {
        freshAnalysisId,
        planTier,
        addOns: config.selectedAddOns,
      });

      const language = localStorage.getItem("language") || "en";

      const response = await fetch("/api/wellness/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisId: freshAnalysisId,
          planTier,
          addOns: config.selectedAddOns,
          quizData: savedQuizData ? JSON.parse(savedQuizData) : undefined,
          language,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Purchase API error:", response.status, errorText);
        throw new Error(
          `PDF generation failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("PDF generated successfully:", data);

      const plan = getProductByPlanId(config.planId);
      const addOnPages = config.selectedAddOns.reduce((sum, id) => {
        const addon = getAddOnById(id);
        return sum + (addon?.pageCountAddition || 0);
      }, 0);
      const totalPages = (plan?.pageCount || 6) + addOnPages;

      setPdfData({
        pdfRecordId: data.pdfRecordId,
        orderId: data.orderId,
        planTier: config.planId,
        userName: quizData.userName || "User",
        generatedAt: new Date().toISOString(),
        expiresAt: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        downloadUrl: data.downloadUrl,
        pageCount: totalPages,
      });

      localStorage.setItem("lastPDFData", JSON.stringify(data));
    } catch (err) {
      console.error("PDF generation error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate PDF");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!pdfData) return;

    setIsDownloading(true);
    try {
      console.log("Starting download from URL:", pdfData.downloadUrl);
      const response = await fetch(pdfData.downloadUrl);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `Download failed: ${response.status} ${response.statusText}`,
          errorText
        );
        throw new Error(
          `Download failed: ${response.status} ${response.statusText}`
        );
      }

      const blob = await response.blob();
      console.log("PDF blob size:", blob.size);

      if (blob.size === 0) {
        throw new Error("Downloaded PDF is empty");
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${(quizData.userName || "blueprint").replace(/\s+/g, "-")}_${pdfData.planTier}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("Download completed successfully");
    } catch (err) {
      console.error("Download error:", err);
      setError(
        err instanceof Error
          ? `Download failed: ${err.message}`
          : "Failed to download PDF"
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleViewInline = async () => {
    if (!pdfData) return;

    try {
      const response = await fetch(pdfData.downloadUrl);
      if (!response.ok) throw new Error("Failed to load PDF");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      console.error("View error:", err);
      setError("Failed to view PDF");
    }
  };

  // Check for analysis ID before rendering
  if (!analysisId && !configuration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Quiz Required
            </h1>
            <p className="text-slate-600 mb-6">
              Your wellness blueprint is personalized based on your quiz
              responses. Please complete the wellness quiz first to get started.
            </p>
            <Button
              onClick={() => navigate("/quiz")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Take Wellness Quiz
            </Button>
            <p className="text-xs text-slate-500 mt-4">
              Takes about 5-10 minutes to complete
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-8">
          <Loader className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Creating Your Personalized Blueprint
          </h2>
          <p className="text-slate-600 text-sm">
            Generating your science-backed wellness plan with your name and personalized recommendations...
          </p>
          <p className="text-xs text-slate-500 mt-4">This usually takes 5-15 seconds</p>
        </Card>
      </div>
    );
  }

  const plan = getProductByPlanId(configuration?.planId || "free_blueprint");
  const selectedAddOns =
    configuration?.selectedAddOns
      .map((id) => getAddOnById(id))
      .filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg text-blue-900">Genewell</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                <Sparkles className="mr-2 h-4 w-4" /> HOME
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/pricing")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Plans
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/quiz")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Take Another Quiz
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Your Blueprint is Ready, {quizData.userName || "User"}!
            </h1>
            <p className="text-xl text-slate-600">
              Your personalized wellness blueprint has been generated based on your responses
            </p>
          </div>

          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-700 ml-2">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Configuration Summary */}
          {plan && (
            <Card className="mb-6 border-2 border-green-200 bg-green-50/30">
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>
                  {pdfData?.pageCount || plan.pageCount} pages • Personalized for {quizData.userName || "you"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">
                      Your Blueprint Includes:
                    </h3>
                    <ul className="space-y-2">
                      {plan.details.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start space-x-2 text-slate-700"
                        >
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {selectedAddOns.length > 0 && (
                    <div className="border-t border-green-200 pt-4">
                      <h3 className="font-semibold text-slate-900 mb-3">
                        Premium Add-Ons Included:
                      </h3>
                      <div className="space-y-2">
                        {selectedAddOns.map((addon) => (
                          <div
                            key={addon!.id}
                            className="flex items-start space-x-2 bg-white/60 p-3 rounded-lg border border-green-100"
                          >
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-semibold text-slate-900">
                                {addon!.name}
                              </p>
                              <p className="text-xs text-slate-600 mt-1">
                                +{addon!.pageCountAddition} pages
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {pdfData && (
                    <div className="border-t border-green-200 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/60 p-3 rounded-lg">
                          <p className="text-xs text-slate-600">Total Pages</p>
                          <p className="text-2xl font-bold text-green-600">
                            {pdfData.pageCount}
                          </p>
                        </div>
                        <div className="bg-white/60 p-3 rounded-lg">
                          <p className="text-xs text-slate-600">Generated</p>
                          <p className="text-xs text-slate-900 mt-1">
                            {new Date(pdfData.generatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Download Buttons */}
          {pdfData && (
            <Card className="mb-6 border-2 border-blue-500">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardTitle>Download Your Personalized Blueprint</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 text-white font-semibold py-6 text-lg"
                  >
                    {isDownloading ? (
                      <>
                        <Loader className="mr-2 h-5 w-5 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <DownloadIcon className="mr-2 h-5 w-5" />
                        Download PDF ({pdfData.pageCount} pages)
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleViewInline}
                    variant="outline"
                    size="lg"
                    className="w-full py-6 text-base"
                  >
                    <Eye className="mr-2 h-5 w-5" />
                    View Online
                  </Button>
                </div>

                {pdfData.expiresAt && (
                  <div className="mt-4 text-xs text-slate-500 text-center">
                    Your download expires on{" "}
                    {new Date(pdfData.expiresAt).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What's Next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-4">
                <Badge className="mt-1 flex-shrink-0">1</Badge>
                <div>
                  <h4 className="font-semibold text-slate-900">
                    Download your blueprint
                  </h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Save the PDF to your device. It includes everything personalized to your profile with your name on the cover.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Badge className="mt-1 flex-shrink-0">2</Badge>
                <div>
                  <h4 className="font-semibold text-slate-900">
                    Review and understand your plan
                  </h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Read through your personalized recommendations. Every recommendation is backed by 2024 peer-reviewed research and written for daily action.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Badge className="mt-1 flex-shrink-0">3</Badge>
                <div>
                  <h4 className="font-semibold text-slate-900">
                    Start implementing
                  </h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Begin with Week 1 actions. Consistency beats perfection. Small daily steps create lasting transformation.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Badge className="mt-1 flex-shrink-0">4</Badge>
                <div>
                  <h4 className="font-semibold text-slate-900">
                    Track and adjust
                  </h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Use the tracking tools in your blueprint. After 4 weeks, reassess and adjust based on what's working.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <div className="mt-8 text-center p-6 bg-white rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-2">Need Help?</h3>
            <p className="text-slate-600 text-sm mb-4">
              Have questions about your plan or need additional support?
            </p>
            <a href="mailto:support@genewell.com">
              <Button variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <LegalFooter />
    </div>
  );
}
