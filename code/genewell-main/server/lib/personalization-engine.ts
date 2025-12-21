// Personalization engine - works with quiz data objects
// 100% evidence-based science: Exercise physiology, nutrition science, sleep neurobiology, behavioral psychology, stress neuroscience

export interface UserProfile {
  // Personal info
  name: string;
  email: string;
  age: number;
  gender: "male" | "female" | "non-binary" | "prefer-not-to-say";

  // Body metrics - evidence-based, Mifflin-St Jeor and Harris-Benedict models
  estimatedHeightCm: number;
  estimatedWeightKg: number;
  estimatedBMR: number; // Basal Metabolic Rate (science-based)
  estimatedTDEE: number; // Total Daily Energy Expenditure

  // Macronutrients
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;

  // Health & Lifestyle scores (1-100)
  stressScore: number;
  sleepScore: number;
  activityScore: number;
  energyScore: number;

  // Health conditions & preferences
  medicalConditions: string[];
  digestiveIssues: string[];
  foodIntolerances: string[];
  skinConcerns: string[];
  dietaryPreference: string;
  exercisePreference: string[];
  workSchedule: string;
  region: string;

  // Health data
  recommendedTests: string[];
  supplementPriority: string[];
  exerciseIntensity: "low" | "moderate" | "high";
  mealFrequency: number;

  // DNA consent (optional biomarker testing)
  dnaConsent: boolean;
}

export interface PersonalizationData {
  profile: UserProfile;
  insights: {
    metabolicInsight: string;
    recommendedMealTimes: string[];
    calorieRange: { min: number; max: number };
    macroRatios: { protein: number; carbs: number; fats: number };
    supplementStack: Array<{ name: string; reason: string; dosage?: string }>;
    workoutStrategy: string;
    sleepStrategy: string;
    stressStrategy: string;
  };
}

// Blood test recommendations based on goals and health conditions - evidence-based
// Include Agilus/SRL Diagnostics-style comprehensive panels
const BLOOD_TEST_RECOMMENDATIONS: Record<string, string[]> = {
  "weight-loss": [
    "Fasting Blood Glucose (FBS) & Random Blood Glucose (RBS)",
    "Lipid Profile: Total Cholesterol, LDL, HDL, Triglycerides, VLDL",
    "Thyroid Function Tests (TFT): TSH, Free T3, Free T4",
    "Complete Hemogram (CBC)",
    "Liver Function Tests (LFT): SGOT, SGPT, ALP, Bilirubin",
    "Kidney Function Tests (RFT): Creatinine, BUN, Electrolytes",
    "Vitamin D (25-hydroxyvitamin D)",
  ],
  "muscle-gain": [
    "Fasting Blood Glucose (FBS)",
    "Lipid Panel (cholesterol, LDL, HDL, triglycerides)",
    "Liver Function Tests (LFT)",
    "Complete Metabolic Panel with Creatinine for kidney function",
    "Iron Panel (Serum Iron, Ferritin, TIBC)",
    "Vitamin B12 and Folate levels",
    "Testosterone levels (for males)",
    "Vitamin D (25-hydroxyvitamin D)",
    "Albumin & Total Protein",
  ],
  "stress-management": [
    "Complete Metabolic Panel (glucose, kidney, liver, electrolytes)",
    "Thyroid Function Tests (TSH, Free T4, Free T3)",
    "Vitamin D (25-hydroxyvitamin D)",
    "Magnesium (blood serum)",
    "Cortisol (optional, if chronic stress)",
    "CBC for immune function assessment",
  ],
  "sleep-improvement": [
    "Vitamin D (25-hydroxyvitamin D)",
    "Thyroid Function (TSH, Free T4)",
    "Iron Panel (ferritin, serum iron)",
    "Magnesium (blood serum)",
    "Complete Hemogram (CBC)",
    "Liver Function Tests (to rule out metabolic issues)",
  ],
  "low-energy": [
    "Complete Hemogram (CBC) - for anaemia assessment",
    "Fasting Blood Glucose (FBS) & Random Blood Glucose (RBS)",
    "Thyroid Function Tests (TSH, Free T3, Free T4)",
    "Vitamin D (25-hydroxyvitamin D)",
    "Vitamin B12 and folate",
    "Iron Panel (Serum Iron, Ferritin, TIBC)",
    "Liver Function Tests (LFT)",
    "Kidney Function Tests (RFT)",
  ],
  "general-wellness": [
    "Complete Hemogram (CBC)",
    "Fasting Blood Glucose (FBS) & Random Blood Glucose (RBS)",
    "Lipid Panel (Total Cholesterol, LDL, HDL, Triglycerides)",
    "Liver Function Tests (LFT): SGOT, SGPT, ALP",
    "Kidney Function Tests (RFT): Creatinine, BUN",
    "Thyroid Function Tests (TSH, Free T4)",
    "Vitamin D (25-hydroxyvitamin D)",
    "Electrolytes (Sodium, Potassium, Chloride, Bicarbonate)",
  ],
};

// Evidence-based supplement recommendations - only proven interventions
const EVIDENCE_BASED_SUPPLEMENTS = {
  "stress-high": [
    "Magnesium glycinate (300-400mg, reduces cortisol and improves sleep)",
    "Omega-3 (EPA/DHA 2-3g, reduces inflammation and supports mood)",
  ],
  "stress-moderate": [
    "Magnesium (200-300mg, daily for nervous system support)",
  ],
  "sleep-poor": [
    "Magnesium glycinate (300-400mg before bed, improves sleep latency and depth)",
    "L-Theanine (100-200mg, promotes relaxation without sedation)",
  ],
  "digestion-issues": [
    "Probiotics (10-50 billion CFU, supports gut microbiota and digestion)",
    "Digestive enzymes (with meals, if needed)",
  ],
  "energy-low": [
    "Vitamin D3 (2000-4000 IU daily, critical for mood and energy)",
    "Iron (if deficient per blood test, especially women)",
    "Vitamin B12 (if deficient or plant-based diet)",
  ],
  "essential-all": [
    "Vitamin D3 (2000-4000 IU daily, supports immunity, mood, bone health)",
    "Omega-3 (EPA/DHA 2-3g daily, anti-inflammatory, cardiovascular and mental health)",
    "Creatine monohydrate (3-5g daily, improves strength and cognition, proven safe)",
  ],
};

export function analyzeQuizData(quizData: any, userName?: string, userEmail?: string): PersonalizationData {
  // Extract core data
  const age = quizData.age || 30;
  const gender = quizData.gender || "female";
  const activityLevel = quizData.activityLevel || "moderately-active";
  const stressLevel = quizData.stressLevel || "moderate";
  const sleepHours = quizData.sleepHours || "7-8";
  const energyLevels = quizData.energyLevels || "moderate";
  const weightGoal = quizData.weightGoal || "maintain";

  // Calculate health scores (1-100)
  const stressScoreMap = {
    "very-high": 85,
    "high": 70,
    moderate: 55,
    low: 30,
    minimal: 10,
  };
  const stressScore = (stressScoreMap as any)[stressLevel] || 55;

  const sleepScoreMap = {
    "less-than-5": 25,
    "5-6": 45,
    "6-7": 70,
    "7-8": 85,
    "more-than-8": 75,
  };
  const sleepScore = (sleepScoreMap as any)[sleepHours] || 85;

  const activityScoreMap = {
    sedentary: 15,
    "lightly-active": 40,
    "moderately-active": 65,
    "very-active": 85,
    "highly-active": 95,
  };
  const activityScore = (activityScoreMap as any)[activityLevel] || 65;

  const energyScoreMap = {
    "very-low": 15,
    low: 35,
    moderate: 60,
    high: 80,
    "very-high": 95,
  };
  const energyScore = (energyScoreMap as any)[energyLevels] || 60;

  // Estimate body metrics using evidence-based anthropometry
  // These are general estimates; actual values should come from user input if available
  let estimatedHeightCm = gender === "female" ? 160 : 175;
  let estimatedWeightKg = gender === "female" ? 65 : 80;

  // Refine estimates based on activity level and energy (proxy for body composition)
  if (activityScore > 80) {
    // More active = potentially leaner
    estimatedWeightKg *= 0.95;
  } else if (activityScore < 30) {
    // Less active = potentially heavier
    estimatedWeightKg *= 1.05;
  }

  // Calculate BMR using Mifflin-St Jeor equation (most accurate for sedentary-to-active)
  // BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + (5 for males, -161 for females)
  const bmrGenderFactor = gender === "male" ? 5 : -161;
  const estimatedBMR = Math.round(
    10 * estimatedWeightKg + 6.25 * estimatedHeightCm - 5 * age + bmrGenderFactor
  );

  // Calculate TDEE using activity multiplier (Harris-Benedict)
  const activityMultiplierMap = {
    sedentary: 1.2,
    "lightly-active": 1.375,
    "moderately-active": 1.55,
    "very-active": 1.725,
    "highly-active": 1.9,
  };
  const activityMultiplier = (activityMultiplierMap as any)[activityLevel] || 1.55;
  const estimatedTDEE = Math.round(estimatedBMR * activityMultiplier);

  // Calculate macronutrients based on goal (evidence-based ranges)
  const macros = calculateMacronutrients(
    estimatedTDEE,
    estimatedWeightKg,
    weightGoal,
    gender
  );

  // Extract health conditions
  const medicalConditions = Array.isArray(quizData.medicalConditions)
    ? quizData.medicalConditions.filter((c: string) => c !== "none")
    : quizData.medicalConditions && quizData.medicalConditions !== "none"
    ? [quizData.medicalConditions]
    : [];

  const digestiveIssues = Array.isArray(quizData.digestiveIssues)
    ? quizData.digestiveIssues.filter((c: string) => c !== "none")
    : quizData.digestiveIssues && quizData.digestiveIssues !== "none"
    ? [quizData.digestiveIssues]
    : [];

  const foodIntolerances = Array.isArray(quizData.foodIntolerances)
    ? quizData.foodIntolerances.filter((c: string) => c !== "none")
    : quizData.foodIntolerances && quizData.foodIntolerances !== "none"
    ? [quizData.foodIntolerances]
    : [];

  const skinConcerns = Array.isArray(quizData.skinConcerns)
    ? quizData.skinConcerns.filter((c: string) => c !== "none")
    : quizData.skinConcerns && quizData.skinConcerns !== "none"
    ? [quizData.skinConcerns]
    : [];

  // Recommend blood tests based on goals and conditions
  const recommendedTests = getRecommendedBloodTests(
    weightGoal,
    medicalConditions,
    gender,
    age
  );

  // Determine supplement priority (evidence-based only)
  const supplementPriority = getSupplementStack(
    gender,
    age,
    stressScore,
    sleepScore,
    digestiveIssues,
    energyScore
  );

  // Exercise intensity based on activity level
  const exerciseIntensity =
    activityScore > 80 ? "high" : activityScore > 45 ? "moderate" : "low";

  // Meal frequency recommendation (science-based)
  // More frequent, smaller meals support stable energy and adherence for many
  const mealFrequency = 3; // Evidence shows 3 meals optimal for most; adjust per person

  // Create profile
  const profile: UserProfile = {
    name: userName || "User",
    email: userEmail || "user@example.com",
    age,
    gender,
    estimatedHeightCm,
    estimatedWeightKg,
    estimatedBMR,
    estimatedTDEE,
    proteinGrams: macros.protein,
    carbsGrams: macros.carbs,
    fatsGrams: macros.fats,
    stressScore,
    sleepScore,
    activityScore,
    energyScore,
    medicalConditions,
    digestiveIssues,
    foodIntolerances,
    skinConcerns,
    dietaryPreference: quizData.dietaryPreference || "non-veg",
    exercisePreference: Array.isArray(quizData.exercisePreference)
      ? quizData.exercisePreference
      : quizData.exercisePreference
      ? [quizData.exercisePreference]
      : ["walking"],
    workSchedule: quizData.workSchedule || "9-to-5",
    region: "India",
    recommendedTests,
    supplementPriority,
    exerciseIntensity,
    mealFrequency,
    dnaConsent: quizData.dnaUpload === "yes-upload",
  };

  // Generate insights
  const insights = generateInsights(profile, quizData);

  return { profile, insights };
}

function calculateMacronutrients(
  tdee: number,
  weightKg: number,
  goal: string,
  gender: string
): { protein: number; carbs: number; fats: number } {
  // Evidence-based macronutrient recommendations
  // Protein: 1.6-2.2 g/kg depending on goal (conservatively 1.8-2.0 for most)
  // Carbs & fats: Adjusted by goal

  let proteinGPerKg = 1.8; // Default for maintenance
  let carbPercentage = 0.45; // % of calories
  let fatPercentage = 0.30; // % of calories

  // Adjust by goal
  if (goal === "lose-weight") {
    proteinGPerKg = 2.2; // Higher protein preserves muscle during deficit
    carbPercentage = 0.35;
    fatPercentage = 0.30;
  } else if (goal === "gain-weight" || goal === "build-muscle") {
    proteinGPerKg = 1.8;
    carbPercentage = 0.50;
    fatPercentage = 0.25;
  } else if (goal === "maintain") {
    proteinGPerKg = 1.6;
    carbPercentage = 0.45;
    fatPercentage = 0.30;
  }

  // Calculate actual grams
  const proteinGrams = Math.round(weightKg * proteinGPerKg);
  const carbGrams = Math.round((tdee * carbPercentage) / 4);
  const fatGrams = Math.round((tdee * fatPercentage) / 9);

  return {
    protein: proteinGrams,
    carbs: carbGrams,
    fats: fatGrams,
  };
}

function getRecommendedBloodTests(
  goal: string,
  conditions: string[],
  gender: string,
  age: number
): string[] {
  const testsSet = new Set<string>();

  // Add tests based on goal
  const goalTests =
    BLOOD_TEST_RECOMMENDATIONS[goal] ||
    BLOOD_TEST_RECOMMENDATIONS["general-wellness"];
  goalTests.forEach((t) => testsSet.add(t));

  // Add age-based tests (over 40, more comprehensive)
  if (age > 40) {
    testsSet.add("Lipid Panel (cholesterol, LDL, HDL, triglycerides)");
    testsSet.add("Thyroid Function (TSH, Free T4)");
  }

  // Add gender-specific tests
  if (gender === "female") {
    testsSet.add("Iron Panel (ferritin, serum iron, TIBC)");
    testsSet.add("Hemoglobin (anaemia screening)");
  }

  // Ensure core baseline tests
  testsSet.add("Complete Metabolic Panel");
  testsSet.add("Vitamin D (25-hydroxyvitamin D)");
  testsSet.add("Thyroid Function (TSH, Free T4)");

  return Array.from(testsSet);
}

function getSupplementStack(
  gender: string,
  age: number,
  stressScore: number,
  sleepScore: number,
  digestiveIssues: string[],
  energyScore: number
): string[] {
  const stack: string[] = [];

  // Essential for all (proven, safe, evidence-based)
  stack.push("Vitamin D3 (2000-4000 IU daily - supports immunity, mood, bone health)");
  stack.push("Omega-3 (EPA+DHA 2-3g daily - anti-inflammatory, cardiovascular and mental health)");

  // Stress management (neuroscience-based)
  if (stressScore > 70) {
    stack.push("Magnesium glycinate (300-400mg daily - reduces cortisol, improves sleep)");
  } else if (stressScore > 50) {
    stack.push("Magnesium (200-300mg daily - nervous system support)");
  }

  // Sleep support (if needed)
  if (sleepScore < 65) {
    stack.push("Magnesium glycinate (300-400mg before bed)");
    stack.push("L-Theanine (100-200mg - promotes relaxation)");
  }

  // Digestive support (microbiome science)
  if (digestiveIssues.length > 0) {
    stack.push("Probiotics (10-50 billion CFU - supports gut microbiota)");
  }

  // Energy support
  if (energyScore < 50) {
    stack.push("Vitamin B12 (if deficient per blood test, especially plant-based diet)");
  }

  // Gender/age specific
  if (gender === "female" && age > 35) {
    stack.push("Iron supplementation (if deficient per blood test)");
  }

  // Limit to top evidence-backed supplements
  return stack.slice(0, 8);
}

function generateInsights(
  profile: UserProfile,
  quizData: any
): PersonalizationData["insights"] {
  // Determine meal timing based on wake time (circadian science)
  const wakeTime = quizData.wakeUpTime || "6-8";
  let recommendedMealTimes: string[] = [];

  if (wakeTime === "before-6") {
    recommendedMealTimes = ["6:30-7:30 AM", "12:30-1:30 PM", "7:00-8:00 PM"];
  } else if (wakeTime === "after-10") {
    recommendedMealTimes = ["11:00 AM-12:00 PM", "3:00-4:00 PM", "9:00-10:00 PM"];
  } else {
    // Default 6-8 or 8-10 AM wake times
    recommendedMealTimes = ["8:00-9:00 AM", "1:00-2:00 PM", "7:30-8:30 PM"];
  }

  return {
    metabolicInsight: `Based on exercise physiology research, your estimated resting metabolic rate (BMR) is ${profile.estimatedBMR} calories/day. With your ${profile.activityLevel} activity level, your daily energy expenditure (TDEE) is approximately ${profile.estimatedTDEE} calories. This means eating at or around ${profile.estimatedTDEE} calories maintains your current weight; eat below this for fat loss, above for muscle gain.`,

    recommendedMealTimes,

    calorieRange: {
      min: Math.round(profile.estimatedTDEE * 0.85),
      max: Math.round(profile.estimatedTDEE * 1.15),
    },

    macroRatios: {
      protein: Math.round((profile.proteinGrams * 4) / profile.estimatedTDEE * 100),
      carbs: Math.round((profile.carbsGrams * 4) / profile.estimatedTDEE * 100),
      fats: Math.round((profile.fatsGrams * 9) / profile.estimatedTDEE * 100),
    },

    supplementStack: profile.supplementPriority.map((supp) => {
      const [name, description] = supp.includes(" (") 
        ? [supp.substring(0, supp.indexOf(" (")), supp.substring(supp.indexOf("(") + 1, supp.length - 1)]
        : [supp, "Evidence-based health support"];
      return {
        name,
        reason: description || "Supports optimal health and wellness",
      };
    }),

    workoutStrategy: `${profile.exerciseIntensity.charAt(0).toUpperCase() + profile.exerciseIntensity.slice(1)} intensity exercise physiology indicates ${
      profile.exerciseIntensity === "low"
        ? "3 days/week of moderate activity (walking, yoga, light strength training) supports health without overload"
        : profile.exerciseIntensity === "moderate"
        ? "4-5 days/week combining resistance and cardio builds strength and aerobic capacity"
        : "5-6 days/week with periodized training (varying volume and intensity) maximizes performance adaptations"
    }.`,

    sleepStrategy: `Sleep neurobiology research shows that your current sleep score of ${profile.sleepScore}/100 indicates ${
      profile.sleepScore < 50
        ? "significant sleep disruption. Prioritize consistent sleep-wake timing (even on weekends), a cool (65-68°F), dark, quiet bedroom, and consider magnesium glycinate (300-400mg 60 min before bed) after 2 weeks of protocol consistency."
        : profile.sleepScore < 75
        ? "room for improvement. Maintain consistent sleep-wake timing, ensure your bedroom is dark (<5 lux), quiet (<30 dB), and cool (65-68°F). A structured evening routine starting 60 min before bed (no screens, warm bath/tea) supports sleep quality."
        : "good sleep quality. Continue your current sleep schedule and environment—consistency is key. 7-9 hours nightly supports all other health interventions."
    }`,

    stressStrategy: `Stress neuroscience shows elevated cortisol impairs sleep, immunity, and body composition. Your stress score of ${profile.stressScore}/100 suggests ${
      profile.stressScore > 70
        ? "high chronic stress activation. Daily evidence-based tools: Box breathing (4-4-4-4, 5 rounds) activates parasympathetic tone in 5 min. 20-30 min moderate-intensity movement (walking, cycling) reduces cortisol comparable to anti-anxiety medication. Magnesium glycinate (300-400mg) and omega-3 (2-3g EPA/DHA) support nervous system regulation."
        : profile.stressScore > 50
        ? "moderate stress. Incorporate 15-20 min daily of stress-reduction: walking, meditation, or breathing exercises. Consistent sleep and movement are powerful stress buffers."
        : "low stress levels. Maintain current healthy practices—consistent sleep, regular movement, and social connection are proven stress resilience factors."
    }`,
  };
}

export function getBMRInsight(profile: UserProfile): string {
  return `Your estimated Basal Metabolic Rate (BMR) is ${profile.estimatedBMR} calories/day, calculated using the evidence-based Mifflin-St Jeor equation. This represents the calories you burn at complete rest. Combined with your activity level, your Total Daily Energy Expenditure (TDEE) is approximately ${profile.estimatedTDEE} calories/day—this is your maintenance calorie target.`;
}

export function getMacroBreakdown(profile: UserProfile): string {
  const proteinPercent = Math.round((profile.proteinGrams * 4) / profile.estimatedTDEE * 100);
  const carbPercent = Math.round((profile.carbsGrams * 4) / profile.estimatedTDEE * 100);
  const fatPercent = Math.round((profile.fatsGrams * 9) / profile.estimatedTDEE * 100);

  return `Based on exercise science research, your daily macronutrient targets are: Protein ${profile.proteinGrams}g (${proteinPercent}%) - preserves muscle and supports satiety; Carbohydrates ${profile.carbsGrams}g (${carbPercent}%) - fuels performance and recovery; Healthy Fats ${profile.fatsGrams}g (${fatPercent}%) - supports hormones and nutrient absorption.`;
}
