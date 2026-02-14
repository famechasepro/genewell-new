import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import {
  Dna,
  Check,
  Star,
  Crown,
  Shield,
  Zap,
  Users,
  ArrowLeft,
  Phone,
  Mail,
  Heart,
  Brain,
  FileText,
  Target,
  AlertCircle,
  ChevronRight,
  Gift,
} from "lucide-react";
import QuizGateModal from "@/components/QuizGateModal";
import LegalFooter from "@/components/LegalFooter";
import {
  FREE_BLUEPRINT,
  ESSENTIAL_BLUEPRINT,
  PREMIUM_BLUEPRINT,
  COMPLETE_COACHING,
  addOns,
  ADDON_IDS,
  PlanConfiguration,
} from "@/lib/products";

export default function Pricing() {
  const navigate = useNavigate();
  const [quizGateOpen, setQuizGateOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [showAddOns, setShowAddOns] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  const plans = [
    {
      ...FREE_BLUEPRINT,
      popular: false,
      buttonText: "Get Free Blueprint",
    },
    {
      ...ESSENTIAL_BLUEPRINT,
      popular: false,
      buttonText: "Get Essential",
    },
    {
      ...PREMIUM_BLUEPRINT,
      popular: true,
      buttonText: "Get Premium",
    },
    {
      ...COMPLETE_COACHING,
      popular: false,
      buttonText: "Start Coaching",
    },
  ];

  const handleSelectPlan = (planId: string) => {
    const quizCompleted = localStorage.getItem("analysisId");

    // ALL plans require quiz completion for personalization
    if (!quizCompleted) {
      setSelectedPlanId(planId);
      setQuizGateOpen(true);
    } else {
      // Quiz already completed, show add-ons selection
      setSelectedPlanId(planId);
      setSelectedAddOns([]);
      setShowAddOns(true);
    }
  };

  const toggleAddOn = (addonId: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId],
    );
  };

  const calculateTotal = () => {
    if (!selectedPlanId) return 0;
    const plan = plans.find((p) => p.id === selectedPlanId);
    const addOnPrice = selectedAddOns.reduce((sum, addonId) => {
      const addon = addOns.find((a) => a.id === addonId);
      return sum + (addon?.price || 0);
    }, 0);
    return (plan?.price || 0) + addOnPrice;
  };

  const calculateTotalPages = () => {
    if (!selectedPlanId) return 0;
    const plan = plans.find((p) => p.id === selectedPlanId);
    const addonPages = selectedAddOns.reduce((sum, addonId) => {
      const addon = addOns.find((a) => a.id === addonId);
      return sum + (addon?.pageCountAddition || 0);
    }, 0);
    return (plan?.pageCount || 0) + addonPages;
  };

  const handleContinueCheckout = () => {
    if (!selectedPlanId) return;

    const plan = plans.find((p) => p.id === selectedPlanId);
    if (!plan || !plan.planId) return;

    const configuration: PlanConfiguration = {
      planId: plan.planId, // Use the planId with underscores (e.g., "free_blueprint")
      selectedAddOns,
      totalPrice: calculateTotal(),
    };

    localStorage.setItem("planConfiguration", JSON.stringify(configuration));
    navigate("/checkout", { state: { configuration } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <QuizGateModal
        isOpen={quizGateOpen}
        onClose={() => setQuizGateOpen(false)}
        productName={selectedPlanId || ""}
      />

      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-base sm:text-lg text-blue-900">Genewell</span>
            </Link>
            <div className="flex items-center gap-1 sm:gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="hidden sm:flex text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2">
                <Zap className="h-4 w-4" />
              </Button>
              <Link to="/login" className="hidden sm:block">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  Sign In
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleBack} className="text-xs sm:text-sm">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline ml-2">Back</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-16">
        {/* Launch Offer Banner */}
        <div className="mb-8 sm:mb-16 bg-gradient-to-r from-purple-50 via-pink-50 to-red-50 border-2 border-purple-300 rounded-lg p-4 sm:p-6 md:p-8">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex-shrink-0">
              <Gift className="h-8 sm:h-10 w-8 sm:w-10 text-purple-600 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-purple-900 mb-2">
                🚀 45-Day Launch Offer!
              </h2>
              <p className="text-purple-700 font-semibold mb-2 sm:mb-3 text-xs sm:text-lg">
                All premium products are <span className="text-red-600 bg-red-50 px-2 py-1 rounded inline-block text-xs sm:text-sm">FREE for 45 days</span>
              </p>
              <p className="text-purple-600 mb-2 text-xs sm:text-base">
                Get full access to Essential, Premium, or Complete Coaching plans at no cost during our launch period.
              </p>
              <p className="text-xs text-purple-600">
                <span className="font-semibold">Exception:</span> Live Training & Coaching services available as paid add-ons
              </p>
            </div>
          </div>
        </div>

        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-16">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-3 sm:mb-6">
            Evidence-Based Wellness, Every Budget
          </h1>
          <p className="text-sm sm:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto mb-6 sm:mb-8">
            Science-backed plans personalized to your sleep, nutrition,
            training, and stress. No pseudoscience. No gimmicks.
          </p>
        </div>

        {/* CORE PLANS SECTION */}
        <div className="mb-12 sm:mb-20">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 sm:mb-4">
              Core Plans
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Choose the depth of personalization that fits your goals
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  selectedPlanId === plan.id
                    ? "ring-2 ring-blue-500 shadow-xl"
                    : ""
                } ${
                  plan.popular
                    ? "sm:scale-105 border-2 border-blue-500 shadow-xl lg:row-span-2"
                    : "border-slate-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-center py-1.5 sm:py-2 text-xs sm:text-sm font-semibold">
                    <Star className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">Most Popular</span>
                    <span className="sm:hidden">Popular</span>
                  </div>
                )}

                <CardHeader className={`pb-3 sm:pb-6 ${plan.popular ? "pt-10 sm:pt-12" : ""}`}>
                  <CardTitle className="text-lg sm:text-2xl font-bold text-slate-900">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-slate-600 text-xs sm:text-sm">
                    {plan.pageCount} page{plan.pageCount !== 1 ? "s" : ""}{" "}
                    personalized for you
                  </CardDescription>

                  <div className="pt-3 sm:pt-4">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                        ₹{plan.price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-slate-600 text-xs sm:text-sm">
                        {plan.id === "free-blueprint" ? "Free" : "one-time"}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {plan.pageCount}-page PDF
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6">
                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    size="sm"
                    className={`w-full font-semibold text-xs sm:text-sm h-auto py-2 sm:py-2.5 ${
                      plan.popular
                        ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 text-white"
                        : selectedPlanId === plan.id
                          ? "bg-blue-600 text-white"
                          : ""
                    }`}
                    variant={
                      selectedPlanId === plan.id
                        ? "default"
                        : plan.popular
                          ? "default"
                          : "outline"
                    }
                  >
                    {selectedPlanId === plan.id ? (
                      <>
                        <Check className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        Selected
                      </>
                    ) : (
                      plan.buttonText
                    )}
                  </Button>

                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="font-semibold text-slate-900 text-xs sm:text-sm">
                      Includes:
                    </h4>
                    <ul className="space-y-2">
                      {plan.details.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-start space-x-2 text-sm text-slate-700"
                        >
                          <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ADD-ONS SECTION - Show only if plan selected */}
        {showAddOns && selectedPlanId && (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Premium Add-Ons (Optional)
              </h2>
              <p className="text-slate-600">
                Enhance your plan with specialized modules
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {addOns.map((addon) => {
                const IconMap: Record<string, React.ReactNode> = {
                  dna: <Dna className="h-6 w-6" />,
                  pill: <FileText className="h-6 w-6" />,
                  target: <Target className="h-6 w-6" />,
                  users: <Users className="h-6 w-6" />,
                  heart: <Heart className="h-6 w-6" />,
                  zap: <Zap className="h-6 w-6" />,
                };

                const isSelected = selectedAddOns.includes(addon.id);

                return (
                  <Card
                    key={addon.id}
                    className={`border-slate-200 hover:shadow-lg transition-all cursor-pointer ${
                      isSelected ? "ring-2 ring-blue-500 shadow-lg" : ""
                    }`}
                    onClick={() => toggleAddOn(addon.id)}
                  >
                    <CardHeader>
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center mb-3 text-blue-600">
                        {IconMap[addon.icon] || <Zap className="h-6 w-6" />}
                      </div>
                      <CardTitle className="text-lg text-slate-900">
                        {addon.name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        +{addon.pageCountAddition} pages to your report
                      </CardDescription>
                      <CardDescription className="text-xs">
                        {addon.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-2xl font-bold text-blue-600">
                        +₹{addon.price.toLocaleString("en-IN")}
                      </div>
                      <ul className="space-y-2">
                        {addon.features.slice(0, 3).map((feature, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-slate-600 flex items-start space-x-2"
                          >
                            <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="pt-2">
                        <Button
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAddOn(addon.id);
                          }}
                        >
                          {isSelected ? (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Added
                            </>
                          ) : (
                            "Add to Plan"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Configuration Summary */}
            {selectedPlanId && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 mb-8 border border-blue-200">
                <h3 className="font-semibold text-slate-900 mb-4">
                  Your Configuration
                </h3>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-slate-600">Plan Selected</p>
                    <p className="font-semibold text-slate-900">
                      {plans.find((p) => p.id === selectedPlanId)?.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      ₹
                      {plans
                        .find((p) => p.id === selectedPlanId)
                        ?.price.toLocaleString("en-IN") || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Selected Add-Ons</p>
                    <p className="font-semibold text-slate-900">
                      {selectedAddOns.length > 0
                        ? selectedAddOns
                            .map((id) => addOns.find((a) => a.id === id)?.name)
                            .join(", ")
                        : "None"}
                    </p>
                    {selectedAddOns.length > 0 && (
                      <p className="text-xs text-slate-500 mt-1">
                        +₹
                        {selectedAddOns
                          .reduce(
                            (sum, id) =>
                              sum +
                              (addOns.find((a) => a.id === id)?.price || 0),
                            0,
                          )
                          .toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Pages in PDF</p>
                    <p className="font-bold text-lg text-blue-600">
                      {calculateTotalPages()} pages
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-sm text-slate-600">Total Price</p>
                    <p className="font-bold text-2xl text-blue-600">
                      ₹{calculateTotal().toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleContinueCheckout}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 text-white font-semibold py-3 text-lg"
                >
                  Continue to Checkout
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* FAQ SECTION */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100 mb-16">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
            Common Questions
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Is this really personalized?
              </h3>
              <p className="text-slate-700 text-sm">
                Yes. Your 25-question quiz captures sleep patterns, activity
                level, stress profile, dietary preferences, and health history.
                Your plan reflects your actual life, not generic advice.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                What if I start Free and want to upgrade?
              </h3>
              <p className="text-slate-700 text-sm">
                No problem. Your quiz data carries forward. Upgrade anytime.
                Premium includes everything Essential covers, plus advanced
                metrics and training periodization.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                What makes this different from other apps?
              </h3>
              <p className="text-slate-700 text-sm">
                Evidence-based only. Every recommendation is backed by
                peer-reviewed research (sleep neurobiology, exercise science,
                clinical nutrition, behavioral psychology). No metabolic types.
                No body type classifications. No pseudoscience.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-slate-700 text-sm">
                Yes. 30-day money-back guarantee on Premium and Coaching if
                you're not satisfied. Free tier is always free.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                How is Coaching different from Premium?
              </h3>
              <p className="text-slate-700 text-sm">
                Premium is self-directed with tools and structure. Coaching adds
                a real person: weekly check-ins, video form review,
                behavior-change coaching, adjustments based on YOUR progress,
                and direct messaging support.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Do you use DNA testing?
              </h3>
              <p className="text-slate-700 text-sm">
                Optional. DNA Analysis Add-on (₹1,499) provides insights into
                nutrient processing, caffeine sensitivity, and exercise response
                based on genetic markers. But it's not required—your quiz data
                is powerful alone.
              </p>
            </div>
          </div>
        </div>

        {/* SUPPORT SECTION */}
        <div className="text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-lg">
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Still have questions?
          </h3>
          <p className="text-slate-600 mb-6">
            Our team is here to help you choose the right plan for your wellness
            journey
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="mailto:support@genewell.com">
              <Button
                variant="outline"
                className="w-full sm:w-auto border-slate-300"
              >
                <Mail className="mr-2 h-4 w-4" />
                Email Support
              </Button>
            </a>
            <a
              href="https://calendly.com/genewell"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                <Phone className="mr-2 h-4 w-4" />
                Schedule Call
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
