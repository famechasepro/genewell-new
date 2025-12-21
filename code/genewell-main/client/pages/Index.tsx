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
import { Link } from "react-router-dom";
import QuizGateModal from "@/components/QuizGateModal";
import { products } from "@/lib/products";
import {
  Sparkles,
  Brain,
  Target,
  Zap,
  Shield,
  Star,
  ArrowRight,
  Play,
  Users,
  Award,
  CheckCircle,
  Clock,
  Smartphone,
  Heart,
  TrendingUp,
  Download,
  Lock,
  Globe,
} from "lucide-react";
import LegalFooter from "@/components/LegalFooter";

export default function Index() {
  const [quizGateOpen, setQuizGateOpen] = useState(false);
  const [selectedProductName, setSelectedProductName] = useState("");
  const [showVideoModal, setShowVideoModal] = useState(false);

  const handleProductClick = (productId: string, productName: string) => {
    const quizCompleted = localStorage.getItem("analysisId");
    if (!quizCompleted) {
      setSelectedProductName(productName);
      setQuizGateOpen(true);
    } else {
      // User has completed quiz, proceed to download
      sessionStorage.setItem("selectedProductId", productId);
      window.location.href = "/download";
    }
  };

  const handleSampleReport = async () => {
    try {
      const response = await fetch("/api/wellness/sample-pdf");
      const data = await response.json();
      if (data.pdfUrl) {
        window.open(data.pdfUrl, "_blank");
      }
    } catch (error) {
      console.error("Error downloading sample report:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <QuizGateModal
        isOpen={quizGateOpen}
        onClose={() => setQuizGateOpen(false)}
        productName={selectedProductName}
      />
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Genewell
                </span>
                <div className="text-xs text-gray-500 font-medium">
                  WELLNESS AI
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#how-it-works"
                className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
              >
                How It Works
              </a>
              <a
                href="#science"
                className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
              >
                The Science
              </a>
              <a
                href="#results"
                className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
              >
                Results
              </a>
              <Link
                to="/pricing"
                className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
              >
                Pricing
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                🔥 16K+ Plans Created
              </Badge>
              <Link to="/quiz">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 rounded-full">
                  Start Free Quiz
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-purple-100 text-purple-700 hover:bg-purple-200 px-4 py-2 rounded-full text-sm font-medium">
              ✨ AI-Powered • Science-Backed • Instant Results
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                Your Body,
              </span>
              <br />
              <span className="text-gray-900">Decoded in 3 Minutes</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Get your personalized <strong>Wellness Blueprint</strong> — from
              optimal meal timing to perfect workouts — based on your unique
              metabolism, lifestyle & DNA (optional).
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to="/quiz">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg rounded-full shadow-2xl hover:shadow-purple-500/25"
                >
                  <Brain className="mr-3 h-6 w-6" />
                  Take the 3-Min Quiz (Free)
                </Button>
              </Link>

              <Button
                size="lg"
                variant="outline"
                className="border-2 border-purple-200 text-purple-700 hover:bg-purple-50 px-8 py-6 text-lg rounded-full"
                onClick={() => setShowVideoModal(true)}
              >
                <Play className="mr-3 h-5 w-5" />
                Watch How It Works
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-2 border-orange-200 text-orange-700 hover:bg-orange-50 px-8 py-6 text-lg rounded-full"
                onClick={handleSampleReport}
              >
                <Download className="mr-3 h-5 w-5" />
                See Sample Report
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500 text-sm">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span>🔒 DNA Never Stored</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-purple-500" />
                <span>⚡ Instant Results</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-pink-500" />
                <span>👥 16,000+ Success Stories</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                45,000+
              </div>
              <div className="text-gray-600">Personalized Plans Delivered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-600 mb-2">89%</div>
              <div className="text-gray-600">
                Report Positive Changes in 30 Days
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-500 mb-2">
                4.7⭐
              </div>
              <div className="text-gray-600">
                Average Rating from 8K+ Reviews
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-500 mb-2">
                95%
              </div>
              <div className="text-gray-600">Customer Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-20 bg-gradient-to-br from-purple-50 to-pink-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How Your{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Transformation
              </span>{" "}
              Begins
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Answer 25 science-backed questions about your body, habits, and goals to create your unique wellness blueprint
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900 mb-2">
                  Smart Quiz
                </CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  Answer 25 science-backed questions about your body, habits, and goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Metabolic profiling & energy analysis</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Digestion & energy patterns</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Stress & sleep optimization</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Optional DNA integration</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900 mb-2">
                  AI Analysis
                </CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  Advanced algorithms create your personalized wellness
                  blueprint instantly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-pink-500" />
                    <span>Evidence-Based Science</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-pink-500" />
                    <span>Behavioral psychology patterns</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-pink-500" />
                    <span>Nutritional genomics data</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-pink-500" />
                    <span>10,000+ successful case studies</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900 mb-2">
                  Your Blueprint
                </CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  Get your complete personalized wellness plan as a premium PDF
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-orange-500" />
                    <span>Custom meal timing & foods</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-orange-500" />
                    <span>Home-friendly workout plan</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-orange-500" />
                    <span>Sleep & stress protocols</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-orange-500" />
                    <span>Weekly lifestyle planner</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link to="/quiz">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg rounded-full"
              >
                Start Your 3-Minute Journey
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Your Complete{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Wellness Blueprint
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need for sustainable body optimization, delivered
              instantly
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Card
                key={product.id}
                className={`border-2 hover:border-opacity-100 transition-all duration-300 border-${product.color}-100 hover:border-${product.color}-300 hover:shadow-lg`}
              >
                <CardHeader>
                  <div
                    className={`w-12 h-12 bg-${product.color}-100 rounded-xl flex items-center justify-center mb-4`}
                  >
                    {product.icon === "heart" && (
                      <Heart className={`h-6 w-6 text-${product.color}-600`} />
                    )}
                    {product.icon === "clock" && (
                      <Clock className={`h-6 w-6 text-${product.color}-600`} />
                    )}
                    {product.icon === "zap" && (
                      <Zap className={`h-6 w-6 text-${product.color}-600`} />
                    )}
                    {product.icon === "brain" && (
                      <Brain className={`h-6 w-6 text-${product.color}-600`} />
                    )}
                    {product.icon === "trending-up" && (
                      <TrendingUp
                        className={`h-6 w-6 text-${product.color}-600`}
                      />
                    )}
                    {product.icon === "sparkles" && (
                      <Sparkles
                        className={`h-6 w-6 text-${product.color}-600`}
                      />
                    )}
                  </div>
                  <CardTitle className="text-xl text-gray-900">
                    {product.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col h-full">
                  <p className="text-gray-600 mb-4 flex-grow">
                    {product.description}
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1 mb-6">
                    {product.details.map((detail, idx) => (
                      <li key={idx}>• {detail}</li>
                    ))}
                  </ul>
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Price</span>
                      <span className="text-lg font-bold text-gray-900">
                        ₹{product.price}
                      </span>
                    </div>
                    <Button
                      onClick={() =>
                        handleProductClick(product.id, product.name)
                      }
                      className={`w-full bg-gradient-to-r from-${product.color}-500 to-${product.color}-600 hover:from-${product.color}-600 hover:to-${product.color}-700 text-white`}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Guide
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Preview */}
      <section
        id="results"
        className="py-20 bg-gradient-to-br from-emerald-50 to-teal-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Real People,{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Real Results
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands who've transformed their health with personalized
              science
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="p-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "After years of yo-yo dieting, the Essential Blueprint showed
                  me exactly why certain foods work for my body. I've lost 8kg
                  in 8 weeks and maintained energy throughout the day. The meal
                  timing advice alone was worth it!"
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                    S
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Sneha K., 32
                    </div>
                    <div className="text-sm text-gray-500">
                      Mumbai, Maharashtra
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="p-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "As a corporate professional, I had chronic bloating and low
                  energy. The Premium Blueprint helped me understand my Pitta
                  constitution. After implementing the recommendations, my
                  digestion improved within 2 weeks and I'm sleeping better than
                  ever."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center text-white font-bold">
                    V
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Vikram M., 41
                    </div>
                    <div className="text-sm text-gray-500">
                      Bangalore, Karnataka
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="p-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "I got the Complete Coaching plan with personal follow-ups. My
                  coach helped me build sustainable habits rather than quick
                  fixes. 3 months in and I've transformed my relationship with
                  food. My family also benefited from the shared meal plans!"
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white font-bold">
                    R
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Ritika P., 27
                    </div>
                    <div className="text-sm text-gray-500">Delhi, NCR</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Science Behind This */}
      <section id="science" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              The{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Science
              </span>{" "}
              Behind Your Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI combines evidence-based exercise science, nutrition
              research, sleep neurobiology, behavioral psychology, and optional
              DNA insights
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Multi-Layered Analysis System
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Metabolic & Lifestyle Profiling
                    </h4>
                    <p className="text-gray-600">
                      Evidence-based calculation of your basal metabolic rate,
                      daily energy expenditure, and personalized macronutrient
                      targets based on exercise science research.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Behavioral Psychology Patterns
                    </h4>
                    <p className="text-gray-600">
                      Analysis of eating habits, stress responses, and lifestyle
                      preferences for sustainable change.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-600 font-bold text-sm">
                      3
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Nutritional Genomics (Optional)
                    </h4>
                    <p className="text-gray-600">
                      DNA-based insights into metabolism, food sensitivities,
                      and nutrient processing capabilities.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Machine Learning Optimization
                    </h4>
                    <p className="text-gray-600">
                      Continuous improvement based on 16,000+ successful case
                      studies and outcomes.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card className="border-2 border-blue-100 text-center p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">92%</div>
                <div className="text-gray-600">Accuracy Rate</div>
              </Card>
              <Card className="border-2 border-purple-100 text-center p-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  500+
                </div>
                <div className="text-gray-600">Research Papers</div>
              </Card>
              <Card className="border-2 border-emerald-100 text-center p-6">
                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  16K+
                </div>
                <div className="text-gray-600">Success Stories</div>
              </Card>
              <Card className="border-2 border-orange-100 text-center p-6">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  3 Min
                </div>
                <div className="text-gray-600">Analysis Time</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Decode Your Body?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join 16,000+ people who've discovered their optimal wellness
            blueprint. Your 3-minute journey to transformation starts now.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/quiz">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-6 text-xl font-semibold rounded-full"
              >
                <Sparkles className="mr-3 h-6 w-6" />
                Start Free Quiz Now
              </Button>
            </Link>

            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-xl rounded-full"
              onClick={handleSampleReport}
            >
              <Download className="mr-3 h-5 w-5" />
              See Sample Report
            </Button>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 text-white/80 text-sm">
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4" />
              <span>🔒 Privacy Protected</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>⚡ Instant Results</span>
            </div>
            <div className="flex items-center space-x-2">
              <Smartphone className="h-4 w-4" />
              <span>📱 Mobile Optimized</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>🌍 English + Hindi</span>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">How Genewell Works</h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: "16/9" }}>
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
                  <div className="text-center text-white">
                    <Play className="h-24 w-24 mx-auto mb-4 opacity-80" />
                    <p className="text-xl font-semibold">How Genewell Creates Your Perfect Wellness Blueprint</p>
                    <p className="text-sm mt-4 opacity-80">
                      Step 1: Take a 3-minute quiz answering science-backed questions
                      <br />
                      Step 2: Our AI analyzes your responses using exercise physiology & nutrition science
                      <br />
                      Step 3: Get your personalized wellness blueprint with meal timing, workouts & sleep protocols
                      <br />
                      Step 4: Optional: Upload your DNA for 99% personalization accuracy
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">What You'll Learn:</h4>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Your exact calorie & macro needs</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Optimal meal timing for your body</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Science-backed workout plan</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Sleep & stress optimization</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Supplement recommendations</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">90-day tracking & progress system</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <Button variant="outline" onClick={() => setShowVideoModal(false)}>
                Close
              </Button>
              <Link to="/quiz">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  <Brain className="mr-2 h-4 w-4" />
                  Start Quiz Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer with Legal Links */}
      <LegalFooter />
    </div>
  );
}
