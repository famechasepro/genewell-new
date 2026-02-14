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
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Brain,
  Heart,
  Clock,
  Activity,
  Moon,
  Zap,
  Target,
  Upload,
  CheckCircle,
  User,
  Utensils,
  Scale,
  Bed,
  AlertCircle,
  Globe,
} from "lucide-react";
import { WellnessQuiz } from "@shared/api";
import LegalFooter from "@/components/LegalFooter";
import { analyzeQuizData } from "@/lib/quiz-analysis";

// Quiz Questions Configuration
const quizQuestions = [
  {
    id: "age",
    title: "Let's start with your age",
    subtitle: "This helps us understand your metabolic baseline",
    icon: User,
    type: "select" as const,
    options: [
      { value: "16-20", label: "16-20 years", emoji: "🌱" },
      { value: "21-25", label: "21-25 years", emoji: "🌟" },
      { value: "26-30", label: "26-30 years", emoji: "💪" },
      { value: "31-35", label: "31-35 years", emoji: "🎯" },
      { value: "36-40", label: "36-40 years", emoji: "⚡" },
      { value: "41-45", label: "41-45 years", emoji: "🔥" },
      { value: "46-50", label: "46-50 years", emoji: "💎" },
      { value: "51-60", label: "51-60 years", emoji: "🏆" },
    ],
  },
  {
    id: "gender",
    title: "What's your gender identity?",
    subtitle: "Hormonal differences affect metabolism and nutrition needs",
    icon: Heart,
    type: "select" as const,
    options: [
      { value: "male", label: "Male", emoji: "👨" },
      { value: "female", label: "Female", emoji: "👩" },
      { value: "non-binary", label: "Non-binary", emoji: "🌈" },
      { value: "prefer-not-to-say", label: "Prefer not to say", emoji: "💜" },
    ],
  },
  {
    id: "wakeUpTime",
    title: "What time do you usually wake up?",
    subtitle: "Your circadian rhythm affects optimal meal timing",
    icon: Clock,
    type: "select" as const,
    options: [
      { value: "before-6", label: "Before 6 AM", emoji: "🌅" },
      { value: "6-8", label: "6-8 AM", emoji: "☀️" },
      { value: "8-10", label: "8-10 AM", emoji: "🌤️" },
      { value: "after-10", label: "After 10 AM", emoji: "🌞" },
    ],
  },
  {
    id: "mealsPerDay",
    title: "How many meals do you eat daily?",
    subtitle: "Your current eating pattern reveals digestive capacity",
    icon: Utensils,
    type: "select" as const,
    options: [
      { value: "1", label: "1 meal (OMAD)", emoji: "🍽️" },
      { value: "2", label: "2 meals", emoji: "🥗" },
      { value: "3", label: "3 meals", emoji: "🍜" },
      { value: "4-plus", label: "4+ meals/snacks", emoji: "🍎" },
    ],
  },
  {
    id: "tiredTime",
    title: "When do you feel most tired?",
    subtitle: "Energy dips reveal your natural metabolic rhythm",
    icon: Bed,
    type: "select" as const,
    options: [
      { value: "morning", label: "Morning (hard to wake up)", emoji: "😴" },
      { value: "afternoon", label: "Afternoon (post-lunch dip)", emoji: "🥱" },
      { value: "evening", label: "Evening (dinner time)", emoji: "😮‍💨" },
      { value: "rarely", label: "Rarely tired during day", emoji: "⚡" },
    ],
  },
  {
    id: "bloatingFrequency",
    title: "How often do you feel bloated after eating?",
    subtitle: "Digestive patterns indicate food compatibility",
    icon: Activity,
    type: "select" as const,
    options: [
      { value: "often", label: "Often (most meals)", emoji: "😣" },
      { value: "sometimes", label: "Sometimes", emoji: "😐" },
      { value: "rarely", label: "Rarely", emoji: "🙂" },
      { value: "never", label: "Never", emoji: "😊" },
    ],
  },
  {
    id: "stressLevel",
    title: "How would you rate your stress levels?",
    subtitle: "Stress directly impacts metabolism and digestion",
    icon: Brain,
    type: "select" as const,
    options: [
      { value: "very-high", label: "Very High", emoji: "🔥" },
      { value: "moderate", label: "Moderate", emoji: "😰" },
      { value: "low", label: "Low", emoji: "😌" },
      { value: "minimal", label: "Minimal/None", emoji: "🧘‍♀️" },
    ],
  },
  {
    id: "hungerFrequency",
    title: "How often do you feel hungry between meals?",
    subtitle:
      "Hunger patterns reveal metabolic speed and blood sugar stability",
    icon: Clock,
    type: "select" as const,
    options: [
      { value: "1-2-hours", label: "Every 1-2 hours", emoji: "🍿" },
      { value: "3-4-hours", label: "Every 3-4 hours", emoji: "⏰" },
      { value: "rarely", label: "Rarely feel hungry", emoji: "🎯" },
      { value: "depends", label: "Depends on the day", emoji: "🤷‍♀️" },
    ],
  },
  {
    id: "weightGoal",
    title: "What's your current weight goal?",
    subtitle: "Your goals shape the intensity and focus of your plan",
    icon: Target,
    type: "select" as const,
    options: [
      { value: "lose-weight", label: "Lose weight (fat loss)", emoji: "📉" },
      { value: "gain-weight", label: "Gain weight (muscle/mass)", emoji: "📈" },
      { value: "maintain", label: "Maintain current weight", emoji: "⚖️" },
      { value: "no-goal", label: "No specific goal", emoji: "🌟" },
    ],
  },
  {
    id: "sleepHours",
    title: "How many hours do you sleep?",
    subtitle: "Sleep quality affects hormones, metabolism, and recovery",
    icon: Moon,
    type: "select" as const,
    options: [
      { value: "less-than-5", label: "Less than 5 hours", emoji: "😵" },
      { value: "5-6", label: "5-6 hours", emoji: "😪" },
      { value: "7-8", label: "7-8 hours", emoji: "😴" },
      { value: "more-than-8", label: "More than 8 hours", emoji: "😌" },
    ],
  },
  {
    id: "activityLevel",
    title: "How physically active are you daily?",
    subtitle:
      "Activity level determines caloric needs and exercise recommendations",
    icon: Zap,
    type: "select" as const,
    options: [
      {
        value: "sedentary",
        label: "Sedentary (desk job, minimal walking)",
        emoji: "🪑",
      },
      {
        value: "lightly-active",
        label: "Lightly active (walks, chores)",
        emoji: "🚶‍♀️",
      },
      {
        value: "moderately-active",
        label: "Moderately active (gym 2-3x/week)",
        emoji: "🏋️‍♀️",
      },
      {
        value: "highly-active",
        label: "Highly active (daily training)",
        emoji: "🏃‍♀️",
      },
    ],
  },
  {
    id: "cravings",
    title: "What do you crave most often?",
    subtitle: "Cravings reveal nutrient deficiencies and metabolic imbalances",
    icon: Heart,
    type: "select" as const,
    options: [
      { value: "sweet-foods", label: "Sweet foods", emoji: "🍰" },
      { value: "salty-snacks", label: "Salty snacks", emoji: "🥨" },
      { value: "fried-junk", label: "Fried/junk food", emoji: "🍟" },
      { value: "spicy-sour", label: "Spicy/sour foods", emoji: "🌶️" },
      { value: "no-cravings", label: "I don't crave often", emoji: "🎯" },
    ],
  },
  {
    id: "energyLevels",
    title: "How would you describe your energy levels?",
    subtitle:
      "Energy patterns help identify metabolic optimization opportunities",
    icon: Zap,
    type: "select" as const,
    options: [
      { value: "very-low", label: "Very Low (constantly tired)", emoji: "🔋" },
      { value: "low", label: "Low (need stimulants)", emoji: "☕" },
      { value: "moderate", label: "Moderate (ups and downs)", emoji: "📊" },
      { value: "high", label: "High (consistently good)", emoji: "⚡" },
      {
        value: "very-high",
        label: "Very High (always energetic)",
        emoji: "🚀",
      },
    ],
  },
  {
    id: "hydrationHabits",
    title: "How much water do you drink daily?",
    subtitle: "Hydration affects metabolism, energy, and nutrient transport",
    icon: Activity,
    type: "select" as const,
    options: [
      {
        value: "less-than-4-glasses",
        label: "Less than 4 glasses",
        emoji: "🥤",
      },
      { value: "4-6-glasses", label: "4-6 glasses", emoji: "💧" },
      { value: "6-8-glasses", label: "6-8 glasses", emoji: "🌊" },
      { value: "more-than-8", label: "More than 8 glasses", emoji: "🏊‍♀️" },
    ],
  },
  {
    id: "digestiveIssues",
    title: "Do you face any digestive issues?",
    subtitle:
      "Digestive health is key to nutrient absorption and overall wellness",
    icon: Activity,
    type: "select" as const,
    options: [
      { value: "acidity", label: "Acidity or heartburn", emoji: "🔥" },
      { value: "constipation", label: "Constipation", emoji: "🚫" },
      { value: "loose-motions", label: "Loose motions", emoji: "💨" },
      { value: "gas", label: "Gas or bloating", emoji: "💨" },
      { value: "none", label: "No digestive issues", emoji: "✅" },
    ],
  },
  {
    id: "medicalConditions",
    title: "Any medical conditions we should know about?",
    subtitle: "Medical history helps customize safe, effective recommendations",
    icon: Heart,
    type: "select" as const,
    options: [
      { value: "pcos", label: "PCOS or hormonal imbalance", emoji: "⚖️" },
      { value: "thyroid", label: "Thyroid (Hyper/Hypo)", emoji: "🦋" },
      { value: "diabetes", label: "Diabetes or pre-diabetes", emoji: "🍯" },
      { value: "blood-pressure", label: "Blood pressure concerns", emoji: "❤️" },
      { value: "none", label: "No major conditions", emoji: "💚" },
      { value: "prefer-not-to-say", label: "Prefer not to disclose", emoji: "🤐" },
    ],
  },
  {
    id: "eatingOut",
    title: "How often do you eat out or order food?",
    subtitle:
      "Eating patterns affect nutritional consistency and meal planning",
    icon: Utensils,
    type: "select" as const,
    options: [
      { value: "daily", label: "Daily", emoji: "🛵" },
      { value: "3-5-times", label: "3-5 times a week", emoji: "📦" },
      { value: "1-2-times", label: "1-2 times a week", emoji: "🍕" },
      { value: "rarely", label: "Rarely/Never", emoji: "🏠" },
    ],
  },
  {
    id: "exercisePreference",
    title: "What type of movement excites you most?",
    subtitle: "We’ll tailor workouts around what keeps you consistent",
    icon: Activity,
    type: "select" as const,
    options: [
      { value: "cardio", label: "Cardio (running, cycling)", emoji: "🏃‍♀️" },
      { value: "strength", label: "Strength training", emoji: "🏋️‍♀️" },
      { value: "yoga", label: "Yoga or Pilates", emoji: "🧘‍♀️" },
      { value: "dance", label: "Dance or Zumba", emoji: "💃" },
      { value: "sports", label: "Sports or games", emoji: "⚽" },
      { value: "walking", label: "Walking and hiking", emoji: "🚶‍♀️" },
      { value: "none", label: "Getting started (no routine yet)", emoji: "🛋️" },
    ],
  },
  {
    id: "workSchedule",
    title: "What's your work schedule like?",
    subtitle:
      "Work patterns affect meal timing and stress management strategies",
    icon: Clock,
    type: "select" as const,
    options: [
      { value: "9-to-5", label: "Regular 9-to-5", emoji: "🏢" },
      { value: "shift-work", label: "Shift work", emoji: "🌙" },
      { value: "flexible", label: "Flexible/Remote", emoji: "💻" },
      { value: "student", label: "Student", emoji: "📚" },
      { value: "homemaker", label: "Homemaker", emoji: "🏠" },
    ],
  },
  {
    id: "dnaUpload",
    title: "DNA Report for Deeper Analysis?",
    subtitle:
      "Optional: Upload your DNA report for 99% accurate personalization",
    icon: Upload,
    type: "select" as const,
    options: [
      {
        value: "yes-upload",
        label: "Yes, I want to upload my DNA report",
        emoji: "🧬",
      },
      {
        value: "have-but-no-upload",
        label: "I have it but prefer not to upload",
        emoji: "🔒",
      },
      { value: "dont-have", label: "I don't have a DNA report", emoji: "🤷‍♀️" },
    ],
  },
  {
    id: "skinConcerns",
    title: "Any skin concerns?",
    subtitle: "Helps tailor anti-inflammatory nutrition",
    icon: Heart,
    type: "select" as const,
    options: [
      { value: "acne", label: "Acne", emoji: "🧴" },
      { value: "dryness", label: "Dryness", emoji: "💧" },
      { value: "oiliness", label: "Oiliness", emoji: "🛢️" },
      { value: "pigmentation", label: "Pigmentation", emoji: "🟤" },
      { value: "aging", label: "Aging", emoji: "⌛" },
      { value: "none", label: "None", emoji: "✅" },
    ],
  },
  {
    id: "moodPatterns",
    title: "How are your mood patterns?",
    subtitle: "Impacts stress and nutrition",
    icon: Brain,
    type: "select" as const,
    options: [
      { value: "mood-swings", label: "Mood swings", emoji: "🎢" },
      { value: "anxiety", label: "Anxiety", emoji: "😟" },
      { value: "depression", label: "Low mood", emoji: "🌧️" },
      { value: "irritability", label: "Irritability", emoji: "😠" },
      { value: "stable", label: "Stable", emoji: "🙂" },
    ],
  },
  {
    id: "foodIntolerances",
    title: "Any food intolerances?",
    subtitle: "Personalizes food lists",
    icon: Utensils,
    type: "select" as const,
    options: [
      { value: "lactose", label: "Lactose", emoji: "🥛" },
      { value: "gluten", label: "Gluten", emoji: "🍞" },
      { value: "nuts", label: "Nuts", emoji: "🥜" },
      { value: "seafood", label: "Seafood", emoji: "🦐" },
      { value: "eggs", label: "Eggs", emoji: "🥚" },
      { value: "none", label: "None", emoji: "✅" },
    ],
  },
  {
    id: "supplementUsage",
    title: "Do you use supplements?",
    subtitle: "We’ll adjust recommendations",
    icon: Sparkles,
    type: "select" as const,
    options: [
      { value: "none", label: "None", emoji: "🚫" },
      { value: "multivitamin", label: "Multivitamin", emoji: "💊" },
      { value: "protein", label: "Protein", emoji: "🥤" },
      { value: "specific-deficiency", label: "For specific deficiency", emoji: "🧪" },
      { value: "multiple", label: "Multiple", emoji: "📦" },
    ],
  },
  {
    id: "userInfo",
    title: "Your details",
    subtitle: "We’ll email your results and receipt",
    icon: User,
    type: "form" as const,
    options: [],
  },
];

export default function Quiz() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [quizData, setQuizData] = useState<Partial<WellnessQuiz>>({});
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const currentQuestion = quizQuestions[currentStep];
  const progress = ((currentStep + 1) / quizQuestions.length) * 100;
  const Icon = currentQuestion.icon;

  useEffect(() => {
    // Scroll to top smoothly when question changes
    const scrollContainer = document.getElementById("quiz-content");
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  }, [currentStep]);

  const handleAnswer = (questionId: string, value: string | string[]) => {
    setQuizData((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const isStepValid = () => {
    const currentAnswer = quizData[currentQuestion.id as keyof WellnessQuiz];
    if (currentQuestion.type === "checkbox") {
      return Array.isArray(currentAnswer) && currentAnswer.length > 0;
    }
    if ((currentQuestion as any).type === "form") {
      return Boolean((quizData as any).userName) && /.+@.+\..+/.test((quizData as any).userEmail || "");
    }
    return !!currentAnswer;
  };

  const handleNext = () => {
    if (currentStep < quizQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      submitQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitQuiz = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const ageRange = quizData.age as string;
      const ageValue = ageRange?.includes("16-20")
        ? 18
        : ageRange?.includes("21-25")
        ? 23
        : ageRange?.includes("26-30")
        ? 28
        : ageRange?.includes("31-35")
        ? 33
        : ageRange?.includes("36-40")
        ? 38
        : ageRange?.includes("41-45")
        ? 43
        : ageRange?.includes("46-50")
        ? 48
        : 55;

      const { userName, userEmail, ...rest } = quizData as any;

      // Handle array fields - convert to single value or keep as array
      const normalizedDigestive = Array.isArray(rest.digestiveIssues)
        ? rest.digestiveIssues[0]
        : rest.digestiveIssues;
      const normalizedMedical = Array.isArray(rest.medicalConditions)
        ? rest.medicalConditions[0]
        : rest.medicalConditions;
      const normalizedExercise = Array.isArray(rest.exercisePreference)
        ? rest.exercisePreference[0]
        : rest.exercisePreference;

      // Ensure skinConcerns and foodIntolerances are arrays
      const skinConcernsArray = Array.isArray(rest.skinConcerns)
        ? rest.skinConcerns
        : rest.skinConcerns
        ? [rest.skinConcerns]
        : ["none"];
      const foodIntolerancesArray = Array.isArray(rest.foodIntolerances)
        ? rest.foodIntolerances
        : rest.foodIntolerances
        ? [rest.foodIntolerances]
        : ["none"];

      const finalQuizData = {
        ...rest,
        age: ageValue,
        language,
        digestiveIssues: normalizedDigestive || "none",
        medicalConditions: normalizedMedical || "none",
        exercisePreference: normalizedExercise || "walking",
        skinConcerns: skinConcernsArray,
        foodIntolerances: foodIntolerancesArray,
        // Add default values for missing optional fields
        energyLevels: rest.energyLevels || "moderate",
        moodPatterns: rest.moodPatterns || "stable",
        hydrationHabits: rest.hydrationHabits || "6-8-glasses",
        supplementUsage: rest.supplementUsage || "none",
        workSchedule: rest.workSchedule || "9-to-5",
      };

      // Perform client-side analysis instead of server call
      console.log("Analyzing quiz data on client...");
      const personalizationData = analyzeQuizData(finalQuizData, userName, userEmail);

      // Generate analysis ID client-side
      const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create a blueprint from the personalization data
      const blueprint = {
        metabolismType: {
          type: "moderate",
          description: personalizationData.insights.metabolicInsight,
          characteristics: [
            `BMR: ${personalizationData.profile.estimatedBMR} calories`,
            `TDEE: ${personalizationData.profile.estimatedTDEE} calories`,
            `Daily calorie range: ${personalizationData.insights.calorieRange.min} - ${personalizationData.insights.calorieRange.max}`,
          ],
        },
        nutritionPlan: {
          bestFoods: ["Lean proteins", "Whole grains", "Fresh vegetables", "Healthy fats"],
          worstFoods: ["Processed foods", "Refined sugars", "Trans fats"],
          mealTiming: {
            breakfast: personalizationData.insights.recommendedMealTimes[0],
            lunch: personalizationData.insights.recommendedMealTimes[1],
            dinner: personalizationData.insights.recommendedMealTimes[2],
            snacks: ["Mid-morning", "Mid-afternoon"],
          },
        },
        fitnessRoutine: {
          workoutType: personalizationData.profile.exercisePreference,
          frequency: personalizationData.profile.mealFrequency,
          duration: personalizationData.profile.exerciseIntensity === "low" ? 20 : 30,
        },
      };

      localStorage.setItem("analysisId", analysisId);
      localStorage.setItem("blueprint", JSON.stringify(blueprint));
      localStorage.setItem("language", language);
      localStorage.setItem("quizData", JSON.stringify({ ...finalQuizData, userName, userEmail, language }));

      console.log("Quiz analysis complete. Navigating to results...", { analysisId, blueprint });
      navigate("/quiz-results");
    } catch (err) {
      console.error("Quiz error:", err);
      setError("Failed to submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentAnswer = quizData[currentQuestion.id as keyof WellnessQuiz];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg sm:rounded-xl flex-shrink-0">
                <Sparkles className="h-5 sm:h-6 w-5 sm:w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-base sm:text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Genewell
                </span>
                <div className="text-xs text-gray-500 font-medium">
                  WELLNESS AI
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-1 sm:gap-4">
              <Badge className="bg-purple-100 text-purple-700 text-xs sm:text-sm py-1">
                <span className="hidden sm:inline">Question {currentStep + 1} of {quizQuestions.length}</span>
                <span className="sm:hidden">{currentStep + 1}/{quizQuestions.length}</span>
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === "en" ? "hi" : "en")}
                className="hidden sm:flex text-xs sm:text-sm px-2"
              >
                <Globe className="h-4 w-4" />
                <span className="hidden md:inline ml-2">{language === "en" ? "हिंदी" : "English"}</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="hidden sm:flex text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Centered and Scrollable */}
      <div id="quiz-content" className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        {/* Progress */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {language === "en" ? "Wellness Analysis" : "स्वास्थ्य विश्लेषण"}
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm">
                {language === "en"
                  ? `Step ${currentStep + 1} of ${quizQuestions.length}`
                  : `चरण ${currentStep + 1} का ${quizQuestions.length}`}
              </p>
            </div>
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 sm:px-3 py-1 text-xs sm:text-sm">
              {Math.round(progress)}% {language === "en" ? "Complete" : "पूर्ण"}
            </Badge>
          </div>
          <Progress value={progress} className="h-2 sm:h-3 bg-white/50" />
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-700 text-xs sm:text-sm ml-2">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Question Card */}
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-4 sm:pb-6">
            <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Icon className="h-8 sm:h-10 w-8 sm:w-10 text-white" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
              {currentQuestion.title}
            </CardTitle>
            <CardDescription className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto">
              {currentQuestion.subtitle}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Select Questions */}
            {currentQuestion.type === "select" && (
              <div className="space-y-2">
                <Select
                  value={(currentAnswer as string) || ""}
                  onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
                >
                  <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-lg">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentQuestion.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="mr-2">{option.emoji}</span>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Checkbox Questions */}
            {currentQuestion.type === "checkbox" && (
              <div className="space-y-4">
                {currentQuestion.options.map((option) => {
                  const isSelected = Array.isArray(currentAnswer)
                    ? (currentAnswer as string[]).includes(option.value)
                    : false;

                  return (
                    <div
                      key={option.value}
                      className={`relative border-2 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        isSelected ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-300"
                      }`}
                      onClick={() => {
                        const current = (currentAnswer as string[]) || [];
                        const newValue = isSelected
                          ? current.filter((v) => v !== option.value)
                          : [...current, option.value];
                        handleAnswer(currentQuestion.id, newValue);
                      }}
                    >
                      <div className="flex items-center space-x-4">
                        <Checkbox id={option.value} checked={isSelected} onCheckedChange={() => {}} />
                        <span className="text-3xl">{option.emoji}</span>
                        <div className="flex-1">
                          <Label htmlFor={option.value} className="text-lg font-semibold text-gray-900 cursor-pointer">
                            {option.label}
                          </Label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* User Info Step */}
            {currentQuestion.type === "form" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="userName">Full Name</Label>
                  <Input
                    id="userName"
                    placeholder="Your full name"
                    value={(quizData as any).userName || ""}
                    onChange={(e) => handleAnswer("userName", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="userEmail">Email Address</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    placeholder="you@example.com"
                    value={(quizData as any).userEmail || ""}
                    onChange={(e) => handleAnswer("userEmail", e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Special DNA Upload Section */}
            {currentQuestion.id === "dnaUpload" &&
              currentAnswer === "yes-upload" && (
                <Card className="border-2 border-purple-200 bg-purple-50">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Upload className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Upload Your DNA Report
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Supported: 23andMe, AncestryDNA, MyHeritage (.txt, .csv)
                      </p>
                      <div className="border-2 border-dashed border-purple-300 rounded-xl p-8 cursor-pointer hover:border-purple-500 transition-colors">
                        <Upload className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                        <p className="text-purple-700 font-medium">
                          Click to upload or drag & drop
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          🔒 Your DNA is never stored or shared
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Navigation */}
            <div className="flex justify-between pt-8 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="px-6 py-3 text-lg"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                {language === "en" ? "Previous" : "पिछ��ा"}
              </Button>

              <Button
                onClick={handleNext}
                disabled={!isStepValid() || isSubmitting}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 text-lg"
              >
                {isSubmitting ? (
                  language === "en" ? (
                    "Creating Blueprint..."
                  ) : (
                    "योजना बनाई जा रही है..."
                  )
                ) : currentStep === quizQuestions.length - 1 ? (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    {language === "en" ? "Get My Blueprint" : "मेरी योजना पाएं"}
                  </>
                ) : (
                  <>
                    {language === "en" ? `Next (Q${currentStep + 2})` : "अगला"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>

            {!isStepValid() && (
              <p className="text-center text-red-600 text-sm mt-4">
                {language === "en"
                  ? "Please select an answer to continue"
                  : "कृपया जारी रखने के लिए एक उत्तर चुनें"}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-gray-500 text-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>🔒 100% Secure</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-purple-500" />
            <span>⚡ Instant Results</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-pink-500" />
            <span>🎯 92% Accuracy</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-orange-500" />
            <span>📱 Mobile Optimized</span>
          </div>
        </div>
        </div>
      </div>

      {/* Sticky Navigation Buttons at Bottom - Always Visible */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 z-40 safe-bottom">
        <div className="max-w-3xl mx-auto flex justify-between gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex-1 px-2 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm h-auto"
          >
            <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{language === "en" ? `Prev (Q${currentStep})` : "पिछला"}</span>
            <span className="sm:hidden">{language === "en" ? "Prev" : "पिछला"}</span>
          </Button>

          <Button
            onClick={handleNext}
            disabled={!isStepValid() || isSubmitting}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-2 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm h-auto"
          >
            {isSubmitting ? (
              <span className="text-xs">Creating...</span>
            ) : currentStep === quizQuestions.length - 1 ? (
              <>
                <CheckCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{language === "en" ? "Get Blueprint" : "पाएं"}</span>
                <span className="sm:hidden">{language === "en" ? "Get" : "पाएं"}</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">{language === "en" ? "Next" : "अगला"}</span>
                <span className="sm:hidden">{language === "en" ? "Next" : "अगला"}</span>
                <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </>
            )}
          </Button>
        </div>
        {!isStepValid() && (
          <p className="text-center text-red-600 text-xs mt-1">
            {language === "en"
              ? "Select an answer to continue"
              : "उत्तर चुनें"}
          </p>
        )}
      </div>

      {/* Footer */}
      <LegalFooter />
    </div>
  );
}
