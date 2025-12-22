import jsPDF from "jspdf";

export interface PersonalizationProfile {
  name: string;
  email: string;
  age: number;
  gender: string;
  estimatedHeightCm: number;
  estimatedWeightKg: number;
  estimatedBMR: number;
  estimatedTDEE: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  stressScore: number;
  sleepScore: number;
  activityScore: number;
  energyScore: number;
  medicalConditions: string[];
  digestiveIssues: string[];
  foodIntolerances: string[];
  skinConcerns: string[];
  dietaryPreference: string;
  exercisePreference: string[];
  workSchedule: string;
  region: string;
  recommendedTests: string[];
  supplementPriority: string[];
  exerciseIntensity: string;
  mealFrequency: number;
  dnaConsent: boolean;
}

export interface PersonalizationInsights {
  metabolicInsight: string;
  recommendedMealTimes: string[];
  calorieRange: { min: number; max: number };
  macroRatios: { protein: number; carbs: number; fats: number };
  supplementStack: Array<{ name: string; reason: string; dosage: string }>;
  workoutStrategy: string;
  sleepStrategy: string;
  stressStrategy: string;
}

export interface PersonalizationData {
  profile: PersonalizationProfile;
  insights: PersonalizationInsights;
}

export interface PDFGenerationOptions {
  tier: "free" | "essential" | "premium" | "coaching";
  addOns?: string[];
  orderId: string;
  timestamp: string;
  language?: "en" | "hi";
}

const colors = {
  primary: [124, 58, 237],
  dark: [45, 55, 72],
  gray: [107, 114, 128],
  lightGray: [229, 231, 235],
};

export async function generatePersonalizedPDFClient(
  personalizationData: PersonalizationData,
  options: PDFGenerationOptions
): Promise<{ blob: Blob; filename: string }> {
  const { profile, insights } = personalizationData;
  const { tier, addOns = [], orderId, timestamp, language = "en" } = options;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = margin;

  const pageHeight_ = pdf.internal.pageSize.getHeight();

  const addNewPage = () => {
    pdf.addPage();
    yPosition = margin;
  };

  const checkPageBreak = (spaceNeeded: number) => {
    if (yPosition + spaceNeeded > pageHeight_ - margin) {
      addNewPage();
    }
  };

  const addHeaderSection = (title: string, subtitle?: string) => {
    checkPageBreak(15);
    pdf.setFontSize(20);
    pdf.setTextColor(45, 55, 72);
    pdf.setFont("helvetica", "bold");
    pdf.text(title, margin, yPosition);
    yPosition += 10;

    if (subtitle) {
      pdf.setFontSize(11);
      pdf.setTextColor(113, 128, 150);
      pdf.setFont("helvetica", "normal");
      const subtitleLines = pdf.splitTextToSize(subtitle, contentWidth);
      pdf.text(subtitleLines, margin, yPosition);
      yPosition += subtitleLines.length * 4 + 2;
    }

    pdf.setDrawColor(229, 231, 235);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;
  };

  const addSubSection = (title: string) => {
    checkPageBreak(10);
    pdf.setFontSize(13);
    pdf.setTextColor(74, 85, 104);
    pdf.setFont("helvetica", "bold");
    pdf.text(title, margin, yPosition);
    yPosition += 7;
  };

  const addText = (
    text: string,
    size: number = 10,
    color: number[] = [17, 24, 39],
    isBold: boolean = false
  ) => {
    checkPageBreak(8);
    pdf.setFontSize(size);
    pdf.setTextColor(...color);
    pdf.setFont("helvetica", isBold ? "bold" : "normal");
    const lines = pdf.splitTextToSize(text, contentWidth);
    pdf.text(lines, margin, yPosition);
    yPosition += lines.length * 4.5 + 2;
  };

  const addBulletPoint = (text: string, size: number = 9) => {
    checkPageBreak(6);
    pdf.setFontSize(size);
    pdf.setTextColor(17, 24, 39);
    pdf.setFont("helvetica", "normal");
    const lines = pdf.splitTextToSize(`• ${text}`, contentWidth - 5);
    pdf.text(lines, margin + 5, yPosition);
    yPosition += lines.length * 4 + 1;
  };

  // === COVER PAGE ===
  pdf.setFontSize(32);
  pdf.setTextColor(124, 58, 237);
  pdf.setFont("helvetica", "bold");
  pdf.text("Your Wellness Blueprint", margin, yPosition);
  yPosition += 15;

  pdf.setFontSize(28);
  pdf.setTextColor(17, 24, 39);
  pdf.text(profile.name, margin, yPosition);
  yPosition += 12;

  const tierNames: Record<string, string> = {
    free: "Free Edition",
    essential: "Essential Edition",
    premium: "Premium Edition",
    coaching: "Complete Coaching Edition",
  };

  pdf.setFontSize(14);
  pdf.setTextColor(74, 85, 104);
  pdf.text(`${tierNames[tier]} — Science-Based & Fully Personalized`, margin, yPosition);
  yPosition += 15;

  pdf.setFontSize(10);
  pdf.setTextColor(113, 128, 150);
  pdf.text(
    `Generated: ${new Date(timestamp).toLocaleDateString()} at ${new Date(timestamp).toLocaleTimeString()}`,
    margin,
    yPosition
  );
  yPosition += 5;
  pdf.text(`Order ID: ${orderId}`, margin, yPosition);
  yPosition += 5;
  pdf.text(`Plan Tier: ${tier.toUpperCase()}`, margin, yPosition);
  yPosition += 8;

  pdf.setTextColor(17, 24, 39);
  pdf.text(`Age: ${profile.age} | Gender: ${profile.gender}`, margin, yPosition);
  yPosition += 5;
  pdf.text(
    `Height: ${profile.estimatedHeightCm}cm | Weight: ${profile.estimatedWeightKg}kg`,
    margin,
    yPosition
  );
  yPosition += 12;

  const introText = `Dear ${profile.name},\n\nThis personalized wellness blueprint is uniquely designed for you, based on your quiz answers, lifestyle, and goals. Every recommendation is science-backed and actionable.\n\nFollow the daily and weekly steps consistently, and you'll see measurable improvements within 30 days.`;
  const introLines = pdf.splitTextToSize(introText, contentWidth);
  pdf.setFontSize(10);
  pdf.text(introLines, margin, yPosition);

  addNewPage();

  // === PAGE 1: TOP 3 ACTIONS ===
  pdf.setFontSize(20);
  pdf.setTextColor(45, 55, 72);
  pdf.setFont("helvetica", "bold");
  pdf.text(`${profile.name}'s Top 3 Actions This Week`, margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setTextColor(113, 128, 150);
  pdf.setFont("helvetica", "normal");
  const actionSubtitle = pdf.splitTextToSize(
    "Start here—these three changes will have the biggest impact on your energy and results",
    contentWidth
  );
  pdf.text(actionSubtitle, margin, yPosition);
  yPosition += actionSubtitle.length * 4 + 3;

  pdf.setDrawColor(229, 231, 235);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 6;

  pdf.setFontSize(12);
  pdf.setTextColor(124, 58, 237);
  pdf.setFont("helvetica", "bold");
  pdf.text("1. Lock Your Wake Time", margin, yPosition);
  yPosition += 5;

  pdf.setFontSize(9);
  pdf.setTextColor(17, 24, 39);
  pdf.setFont("helvetica", "normal");
  const action1Lines = pdf.splitTextToSize(
    `Wake at ${insights.recommendedMealTimes[0]?.split(" ")[0] || "7:00"} AM every day (including weekends) for 30 days. This single action resets your circadian rhythm and improves sleep quality within days.`,
    contentWidth
  );
  pdf.text(action1Lines, margin, yPosition);
  yPosition += action1Lines.length * 4 + 4;

  pdf.setFontSize(12);
  pdf.setTextColor(124, 58, 237);
  pdf.setFont("helvetica", "bold");
  pdf.text("2. Eat Within a 10–12 Hour Window", margin, yPosition);
  yPosition += 5;

  pdf.setFontSize(9);
  pdf.setTextColor(17, 24, 39);
  pdf.setFont("helvetica", "normal");
  const action2Lines = pdf.splitTextToSize(
    `Breakfast: ${insights.recommendedMealTimes[0]} | Lunch: ${insights.recommendedMealTimes[1]} | Dinner: ${insights.recommendedMealTimes[2]} | Stop eating after ${insights.recommendedMealTimes[2]}. This simple timing synchronizes your metabolism and digestion.`,
    contentWidth
  );
  pdf.text(action2Lines, margin, yPosition);
  yPosition += action2Lines.length * 4 + 4;

  pdf.setFontSize(12);
  pdf.setTextColor(124, 58, 237);
  pdf.setFont("helvetica", "bold");
  pdf.text("3. Move for 20–30 Minutes, 3x This Week", margin, yPosition);
  yPosition += 5;

  pdf.setFontSize(9);
  pdf.setTextColor(17, 24, 39);
  pdf.setFont("helvetica", "normal");
  const action3Lines = pdf.splitTextToSize(
    "Any movement counts: walk, yoga, gym, dancing. Research shows this alone reduces stress by 40%, increases energy, and improves sleep. Start with what feels easy.",
    contentWidth
  );
  pdf.text(action3Lines, margin, yPosition);
  yPosition += action3Lines.length * 4 + 6;

  pdf.setFontSize(8);
  pdf.setTextColor(107, 114, 128);
  const tipLines = pdf.splitTextToSize(
    "💡 Pro Tip: These three actions work together. Lock your wake time first (it sets everything else). Add meal timing in week 2. Add movement in week 3. Small steps, big results.",
    contentWidth
  );
  pdf.text(tipLines, margin, yPosition);

  addNewPage();

  // === EXECUTIVE SUMMARY ===
  addHeaderSection("Executive Summary", `${profile.name}'s Personalized Wellness Analysis`);

  addText(insights.metabolicInsight, 10);

  addSubSection("Your Wellness Baseline");
  addText(`Energy Level: ${profile.energyScore}/100`, 9);
  addText(`Sleep Quality: ${profile.sleepScore}/100`, 9);
  addText(`Stress Resilience: ${profile.stressScore}/100`, 9);
  addText(`Physical Activity: ${profile.activityScore}/100`, 9);

  addSubSection("Critical Blood Work (Baseline)");
  addText("Get these tests done BEFORE starting (compare at 6 & 12 weeks):", 8);
  profile.recommendedTests.slice(0, 6).forEach((test) => {
    addBulletPoint(test, 8);
  });

  // === PREMIUM INSIGHTS ===
  if (tier === "premium" || tier === "coaching") {
    addNewPage();
    addHeaderSection(
      "Latest Science Updates",
      "Real-time health insights based on 2024 research"
    );

    addText(
      "Your personalized plan incorporates the latest wellness research from 2024. These insights are unique to your profile and goals.",
      9
    );

    addSubSection("Your Personalized Research Insights");
    addBulletPoint(
      "Sleep: Recent studies confirm that sleep consistency matters more than duration. Your target is to wake at the same time daily, including weekends.",
      8
    );
    addBulletPoint(
      "Nutrition: 2024 research shows Mediterranean diet principles dramatically improve longevity. We've adapted this to your Indian diet preferences.",
      8
    );
    addBulletPoint(
      "Exercise: Zone 2 training (conversational pace cardio) is proven to enhance aerobic capacity without overtraining. Aim for 2-3 sessions weekly.",
      8
    );
    addBulletPoint(
      "Stress: Cold exposure (15-30 seconds) activates your vagus nerve and improves resilience. Start conservative if new to cold.",
      8
    );
  }

  // === METABOLIC PROFILE ===
  if (tier !== "free") {
    addNewPage();
    addHeaderSection(
      "Your Metabolic Profile",
      `${profile.name}'s Personal Energy Calculation`
    );

    addText("Based on your age, gender, activity level, and body composition:", 9);

    addText(
      `Basal Metabolic Rate (BMR): ${profile.estimatedBMR} calories/day`,
      10,
      [17, 24, 39],
      true
    );
    addText(
      "Energy your body burns at complete rest (breathing, circulation, brain).",
      8,
      [107, 114, 128]
    );

    addText(
      `Total Daily Energy Expenditure (TDEE): ${profile.estimatedTDEE} calories/day`,
      10,
      [17, 24, 39],
      true
    );
    addText(
      "Your actual daily calorie burn, including activity.",
      8,
      [107, 114, 128]
    );

    addSubSection("What This Means for Weight Management");
    addText(`→ To maintain weight: Eat ~${profile.estimatedTDEE} calories daily`, 9);
    addText(
      `→ To lose fat: Eat ${profile.estimatedTDEE - 300} - ${profile.estimatedTDEE - 500} calories/day`,
      9
    );
    addText(
      `→ To gain muscle: Eat ${profile.estimatedTDEE + 300} - ${profile.estimatedTDEE + 500} calories/day`,
      9
    );

    addSubSection("Daily Macronutrient Targets");
    const proteinPct = Math.round(
      ((profile.proteinGrams * 4) / profile.estimatedTDEE) * 100
    );
    const carbsPct = Math.round(
      ((profile.carbsGrams * 4) / profile.estimatedTDEE) * 100
    );
    const fatsPct = Math.round(
      ((profile.fatsGrams * 9) / profile.estimatedTDEE) * 100
    );

    addText(`Protein: ${profile.proteinGrams}g/day (${proteinPct}%)`, 9);
    addText(
      "For muscle preservation and satiety. 1.8-2.2g per kg body weight is optimal.",
      8,
      [107, 114, 128]
    );

    addText(`Carbs: ${profile.carbsGrams}g/day (${carbsPct}%)`, 9);
    addText(
      "Fuels workouts, brain, and recovery. Timing matters (pre/post-workout).",
      8,
      [107, 114, 128]
    );

    addText(`Fats: ${profile.fatsGrams}g/day (${fatsPct}%)`, 9);
    addText(
      "Essential for hormones, brain, and nutrient absorption.",
      8,
      [107, 114, 128]
    );

    addNewPage();
  }

  // === NUTRITION PLAN ===
  if (tier === "essential" || tier === "premium" || tier === "coaching") {
    addHeaderSection(
      "Personalized Nutrition Plan",
      `${profile.name}'s Optimal Eating Strategy`
    );

    addSubSection("Your Meal Timing (Circadian Optimization)");
    insights.recommendedMealTimes.forEach((time, idx) => {
      const meals = ["Breakfast", "Lunch", "Dinner"];
      addText(`${meals[idx]}: ${time}`, 9);
    });
    addText(
      "Research shows eating within consistent windows synchronizes your circadian rhythm, improves digestion, and stabilizes blood sugar.",
      8,
      [107, 114, 128]
    );

    addSubSection("Core Nutrition Framework (Every Meal)");
    addBulletPoint("Protein source (eggs, Greek yogurt, paneer, dal, chicken, tofu)", 8);
    addBulletPoint("Carb source (rice, roti, oats, sweet potato, quinoa)", 8);
    addBulletPoint("Vegetable (minimum 2 cups, variety of colors)", 8);
    addBulletPoint("Healthy fat (olive oil, ghee, nuts, avocado)", 8);

    if (tier === "premium" || tier === "coaching") {
      addNewPage();

      addSubSection("7-Day Meal Plan Framework");
      addText("Use this as a template. Mix and match based on your preferences:", 9);

      const sampleMeals = [
        "Breakfast: 2-3 eggs + oats with banana + 1 tsp ghee",
        "Mid-morning: Greek yogurt + berries + almonds",
        "Lunch: Grilled chicken + brown rice + roasted broccoli + olive oil",
        "Afternoon: Apple + peanut butter",
        "Dinner: Lentil dal + roti + spinach curry",
        "Optional evening: Casein (Greek yogurt) if hungry after 8 PM",
      ];

      sampleMeals.forEach((meal) => {
        addBulletPoint(meal, 8);
      });

      addSubSection("Indian Grocery Shopping List");
      addText("Proteins: Chicken breast, Fish, Paneer, Moong/Arhar dal, Eggs", 8);
      addText(
        "Vegetables: Spinach, Broccoli, Bell peppers, Carrots, Cauliflower, Tomatoes",
        8
      );
      addText("Grains: Brown rice, Whole wheat roti, Oats, Quinoa, Millets", 8);
      addText("Healthy Fats: Olive oil, Ghee, Almonds, Peanuts, Sesame oil", 8);

      addSubSection("Hydration Protocol (Science-Based)");
      addBulletPoint("Upon waking: 500ml water (rehydrates after 8-hour fast)", 8);
      addBulletPoint("With meals: 250ml water (aids digestion)", 8);
      addBulletPoint("Between meals: Drink when thirsty", 8);
      addBulletPoint("Daily target: 2-2.5 liters (adjust for climate, activity)", 8);
      addBulletPoint("After 7 PM: Reduce intake (minimize nighttime urination)", 8);

      addNewPage();
    }
  }

  // === SLEEP OPTIMIZATION ===
  addHeaderSection(
    "Sleep Optimization Protocol",
    `${profile.name}'s Critical Recovery Foundation`
  );

  addText(insights.sleepStrategy, 9);

  addSubSection("Sleep Hygiene Checklist");
  addBulletPoint("Consistent sleep-wake time (even weekends) ← Most important", 8);
  addBulletPoint("Dark room: <5 lux (blackout curtains or eye mask)", 8);
  addBulletPoint("Cool temperature: 65-68°F (18-20°C)", 8);
  addBulletPoint("Quiet environment: <30 dB (earplugs or white noise)", 8);
  addBulletPoint("No blue light 60-90 min before bed", 8);
  addBulletPoint("No caffeine after 2 PM (5-6 hour half-life)", 8);
  addBulletPoint("Warm bath/tea 90 min before bed (triggers melatonin)", 8);

  if (tier !== "free") {
    addSubSection("Sleep Supplements (If Protocol Alone Isn't Enough)");
    addBulletPoint("Magnesium Glycinate: 300-400mg, 60 min before bed", 8);
    addBulletPoint("L-Theanine: 100-200mg, optional with magnesium", 8);
    addBulletPoint("Herbal tea: Chamomile or passionflower (traditional)", 8);
    addText(
      "→ Try protocol first for 2 weeks minimum. Then add one supplement at a time.",
      8,
      [107, 114, 128]
    );
  }

  addNewPage();

  // === MOVEMENT & FITNESS ===
  if (tier === "essential" || tier === "premium" || tier === "coaching") {
    addHeaderSection(
      "Movement & Training Plan",
      `${profile.name}'s Personalized Exercise Protocol`
    );

    addText(insights.workoutStrategy, 9);

    const workoutType =
      tier === "essential"
        ? "3-Day Beginner"
        : tier === "premium"
          ? "5-Day Intermediate"
          : "6-Day Advanced";

    addSubSection(`${workoutType} Weekly Schedule`);

    if (tier === "essential") {
      addText("Monday: Full Body Strength (30 min)", 9);
      addBulletPoint("Push-ups or chest press: 3 sets x 8-12 reps", 8);
      addBulletPoint("Squats or leg press: 3 sets x 12-15 reps", 8);
      addBulletPoint("Plank or core: 3 sets x 30-60 seconds", 8);

      addText("Wednesday: Zone 2 Cardio (30 min, conversational pace)", 9);
      addBulletPoint("Brisk walk, jog, or cycle at easy pace", 8);

      addText("Friday: Flexibility & Recovery (20 min)", 9);
      addBulletPoint("Yoga, stretching, deep breathing", 8);
    } else if (tier === "premium") {
      addText("Monday: Lower Body Strength (45 min)", 9);
      addBulletPoint("Focus: Squat, deadlift variations", 8);

      addText("Tuesday: Upper Body Push (45 min)", 9);
      addBulletPoint("Focus: Chest, shoulders, triceps", 8);

      addText("Wednesday: Active Recovery (30 min)", 9);
      addBulletPoint("Walk, yoga, or light mobility", 8);

      addText("Thursday: Upper Body Pull (45 min)", 9);
      addBulletPoint("Focus: Back, biceps, rear delts", 8);

      addText("Friday: Full Body Power (45 min)", 9);
      addBulletPoint("Focus: Olympic lift patterns, explosive movements", 8);

      addText("Sat-Sun: Optional light activity or complete rest", 9);
    } else {
      addText("6-day periodized program with progressive overload", 9);
      addText(
        "Phases: Strength (weeks 1-4) → Hypertrophy (weeks 5-8) → Power (weeks 9-12)",
        9
      );
    }

    addSubSection("Progressive Overload Formula");
    addText("Weeks 1-4: Master form with moderate weight", 8);
    addText("Weeks 5-8: Increase weight or reps by 5-10%", 8);
    addText("Weeks 9-12: New variations or higher intensity", 8);

    addNewPage();
  }

  // === STRESS MANAGEMENT ===
  addHeaderSection(
    "Stress Management & Nervous System Optimization",
    `${profile.name}'s Daily Resilience Protocol`
  );

  addText(insights.stressStrategy, 9);

  addSubSection("Daily Stress Management Tools");
  addBulletPoint(
    "Box Breathing: 4-4-4-4 count. Activates parasympathetic in 5 minutes.",
    8
  );
  addBulletPoint(
    "Movement: 20-30 min moderate activity (walk, yoga, gym). Reduces cortisol comparable to medication.",
    8
  );
  addBulletPoint("Social connection: 30+ min meaningful interaction 3x/week.", 8);
  addBulletPoint("Fix sleep first: One bad night increases anxiety by 60%.", 8);

  if (tier !== "free") {
    addSubSection("Advanced Stress Techniques");
    addBulletPoint(
      "Progressive Muscle Relaxation: Tense & release each muscle group",
      8
    );
    addBulletPoint(
      "Meditation: 10-15 min daily (Headspace, Calm, or free YT)",
      8
    );
    addBulletPoint("Nature exposure: 20+ min in nature (park, forest) 1-2x/week", 8);
    addBulletPoint(
      "Creative hobbies: Art, music, or writing (activate parasympathetic)",
      8
    );
  }

  // === SUPPLEMENTS ===
  if (tier === "premium" || tier === "coaching") {
    addNewPage();
    addHeaderSection(
      "Smart Supplement Strategy",
      `${profile.name}'s Science-Backed Nutritional Support`
    );

    addSubSection("Your Supplement Priority Stack");
    profile.supplementPriority.forEach((supp, idx) => {
      addText(`${idx + 1}. ${supp}`, 9);
    });

    addSubSection("Supplement Timing Protocol");
    addText("Morning (with breakfast):", 9, [17, 24, 39], true);
    addBulletPoint(
      "Vitamin D3: 2000-4000 IU (immune, mood, metabolism)",
      8
    );
    addBulletPoint("Omega-3 (fish oil or algae): 2-3g EPA+DHA", 8);
    addBulletPoint("Multivitamin: If deficient (optional)", 8);

    addText("Evening (with dinner):", 9, [17, 24, 39], true);
    addBulletPoint("Magnesium: Only if prescribed or sleep issues", 8);

    addSubSection("Supplement Selection Rules");
    addBulletPoint("Start ONE supplement at a time (2-week minimum)", 8);
    addBulletPoint(
      "Buy from reputable brands: USP, NSF, Informed Choice certified",
      8
    );
    addBulletPoint(
      "Food first — supplements fill gaps, not replace real nutrition",
      8
    );
    addBulletPoint("Consult doctor before starting anything", 8);
    addBulletPoint("Store in cool, dry place away from sunlight", 8);
  }

  // === PROGRESS TRACKING ===
  addNewPage();
  addHeaderSection(
    "90-Day Progress Tracking System",
    `${profile.name}'s Transformation Timeline`
  );

  addSubSection("Weekly Check-In (2 Minutes)");
  addText("Track every Sunday evening:", 9);
  addBulletPoint("Energy levels (morning, midday, evening): 1-10 scale", 8);
  addBulletPoint("Sleep quality & duration: hours + 1-10 rating", 8);
  addBulletPoint("Stress level: 1-10 scale", 8);
  addBulletPoint("Workouts completed this week: __/3 or __/5", 8);
  addBulletPoint("Meal plan adherence: __%", 8);

  addSubSection("Monthly Assessment (Week 4, 8, 12)");
  addBulletPoint("Photos: Same time, same place, same light (front & side)", 8);
  addBulletPoint("Measurements: Weight, waist, chest, arms (if applicable)", 8);
  addBulletPoint("Performance: Push-ups, squats, running time, etc.", 8);
  addBulletPoint("Blood work: If doing 6 & 12 week testing", 8);
  addBulletPoint("Mood & energy consistency", 8);

  addSubSection("Expected 90-Day Timeline");
  addText("Weeks 1-2: Sleep improves, energy stabilizes", 8);
  addText("Weeks 3-4: Mood lifts, stress improves, workouts feel easier", 8);
  addText("Weeks 5-8: Visible changes, muscle/strength gains", 8);
  addText("Weeks 9-12: Major transformation, habits feel automatic", 8);

  // === ACTION PLAN ===
  addNewPage();
  addHeaderSection(
    "Your 90-Day Action Plan",
    `${profile.name}'s Step-by-Step Implementation`
  );

  addText("Week 1: Foundation", 9, [17, 24, 39], true);
  addBulletPoint("Review this entire blueprint thoroughly", 8);
  addBulletPoint("Schedule baseline blood work (if recommended)", 8);
  addBulletPoint("Setup meal prep container and grocery plan", 8);
  addBulletPoint("Create tracking system (spreadsheet or app)", 8);

  addText("Weeks 2-4: System Establishment", 9, [17, 24, 39], true);
  addBulletPoint("Lock in meal times (most important step)", 8);
  addBulletPoint("Complete 3-4 workouts, focus on form", 8);
  addBulletPoint("Practice daily stress management (5 min minimum)", 8);
  addBulletPoint("Track sleep, energy, mood daily", 8);

  addText("Weeks 5-12: Momentum & Optimization", 9, [17, 24, 39], true);
  addBulletPoint("Adjust calories/macros based on results", 8);
  addBulletPoint("Increase workout intensity or volume", 8);
  addBulletPoint("Refine supplement stack if needed", 8);
  addBulletPoint("Build lasting habits—consistency beats perfection", 8);

  addNewPage();

  pdf.setFontSize(14);
  pdf.setTextColor(124, 58, 237);
  pdf.setFont("helvetica", "bold");
  pdf.text(
    "Remember: Small consistent steps create lasting transformation.",
    margin,
    yPosition
  );
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setTextColor(17, 24, 39);
  pdf.setFont("helvetica", "normal");
  pdf.text(
    `${profile.name}, you have the evidence-based roadmap. Commit to the process, and results will follow.`,
    margin,
    yPosition
  );
  yPosition += 10;

  pdf.setFontSize(8);
  pdf.setTextColor(107, 114, 128);
  pdf.text(
    "This blueprint is for educational purposes and not medical advice.",
    margin,
    yPosition
  );
  yPosition += 4;
  pdf.text(
    "Always consult healthcare professionals before major lifestyle changes.",
    margin,
    yPosition
  );
  yPosition += 4;
  pdf.text(`Generated by Genewell Wellness • Order: ${orderId}`, margin, yPosition);

  // Generate PDF blob
  const pdfBlob = pdf.output("blob");

  const sanitizedName = profile.name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
  const filename = `${sanitizedName}_${tier}_blueprint_${orderId}.pdf`;

  return { blob: pdfBlob, filename };
}

export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
