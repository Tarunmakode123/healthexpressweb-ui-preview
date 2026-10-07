/**
 * Health Express Health Calculators & Clinical Guides Library Engine
 * Sources: CDC, WHO, AHA, ACOG, Mifflin-St Jeor, Institute of Medicine, U.S. Navy.
 */

export const CALCULATOR_CATEGORIES = [
  { id: 'body-fitness', name: 'Body & Fitness', description: 'BMI, BMR, Calorie Needs, Ideal Weight, Body Fat & Hydration' },
  { id: 'heart-health', name: 'Heart Health', description: 'Blood Pressure Checker & Target Heart Rate Zones' },
  { id: 'womens-health', name: "Women's & Pregnancy", description: 'Pregnancy Due Date, Gestational Age, Ovulation & Weight Gain' },
  { id: 'mens-health', name: "Men's Health Guides", description: 'Semen Analysis, Testosterone & PSA Laboratory Guides' },
];

export const CALCULATORS = [
  // 1. BMI CALCULATOR
  {
    id: 'bmi-calculator',
    slug: 'bmi-calculator',
    title: 'BMI Calculator',
    shortDesc: 'Calculate your Body Mass Index based on your height and weight.',
    category: 'body-fitness',
    categoryName: 'Body & Fitness',
    iconName: 'Scale',
    unitType: 'metric', // metric or US
    disclaimer: 'CDC states adult BMI is a screening tool, not a diagnostic measure. For children under 20, use the Child & Teen BMI percentile tool.',
    sources: [
      { name: 'CDC Adult BMI Calculator', url: 'https://www.cdc.gov/bmi/adult-calculator/index.html' }
    ],
    inputs: [
      { id: 'height', label: 'Height (cm)', type: 'number', min: 100, max: 250, default: 170, step: 1 },
      { id: 'weight', label: 'Weight (kg)', type: 'number', min: 30, max: 250, default: 70, step: 0.5 }
    ],
    calculate: (inputs) => {
      const hM = Number(inputs.height) / 100;
      const wKg = Number(inputs.weight);
      if (!hM || hM <= 0 || !wKg || wKg <= 0) return null;

      const bmi = Number((wKg / (hM * hM)).toFixed(1));
      let category = 'Healthy Weight';
      let color = 'emerald';
      let summary = 'Your BMI is within the healthy reference range.';

      if (bmi < 18.5) {
        category = 'Underweight';
        color = 'amber';
        summary = 'Your BMI indicates you are below the typical healthy weight range.';
      } else if (bmi >= 18.5 && bmi < 25) {
        category = 'Healthy Weight';
        color = 'emerald';
        summary = 'Your BMI is in the healthy weight range for adults.';
      } else if (bmi >= 25 && bmi < 30) {
        category = 'Overweight';
        color = 'amber';
        summary = 'Your BMI indicates you are above the typical healthy weight range.';
      } else {
        category = 'Obesity Range';
        color = 'rose';
        summary = 'Your BMI falls into the obesity category.';
      }

      const minHealthy = (18.5 * hM * hM).toFixed(1);
      const maxHealthy = (24.9 * hM * hM).toFixed(1);

      return {
        mainValue: bmi,
        unit: 'kg/m²',
        category,
        color,
        summary,
        details: [
          { label: 'Healthy Weight Range for your height', value: `${minHealthy} kg – ${maxHealthy} kg` },
          { label: 'Underweight Range', value: '< 18.5' },
          { label: 'Healthy Weight Range', value: '18.5 – 24.9' },
          { label: 'Overweight Range', value: '25.0 – 29.9' },
          { label: 'Obesity Range', value: '≥ 30.0' }
        ],
        cta: {
          title: 'Want to understand what this means for your health?',
          btnText: 'Talk to a Health Manager on WhatsApp',
          message: `Hello Health Express! I calculated my BMI as ${bmi} (${category}) on your website. I would like guidance on weight management & health checkup packages.`,
          serviceLink: '/services',
          serviceName: 'Explore Full Body Health Checkups'
        }
      };
    }
  },

  // 2. BMR CALCULATOR
  {
    id: 'bmr-calculator',
    slug: 'bmr-calculator',
    title: 'BMR Calculator',
    shortDesc: 'Estimate the calories your body burns at rest to support essential functions.',
    category: 'body-fitness',
    categoryName: 'Body & Fitness',
    iconName: 'Flame',
    disclaimer: 'Calculated using the validated Mifflin-St Jeor equation. BMR is an estimate of basal metabolic rate, not a direct laboratory measurement.',
    sources: [
      { name: 'Mifflin et al., AJCN (1990)', url: 'https://pubmed.ncbi.nlm.nih.gov/2305711/' }
    ],
    inputs: [
      { id: 'gender', label: 'Biological Sex', type: 'select', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }], default: 'male' },
      { id: 'age', label: 'Age (Years)', type: 'number', min: 18, max: 100, default: 30, step: 1 },
      { id: 'height', label: 'Height (cm)', type: 'number', min: 100, max: 250, default: 170, step: 1 },
      { id: 'weight', label: 'Weight (kg)', type: 'number', min: 30, max: 200, default: 70, step: 1 }
    ],
    calculate: (inputs) => {
      const w = Number(inputs.weight);
      const h = Number(inputs.height);
      const a = Number(inputs.age);
      const isMale = inputs.gender === 'male';

      if (!w || !h || !a) return null;

      // Mifflin-St Jeor Formula
      let bmr = (10 * w) + (6.25 * h) - (5 * a) + (isMale ? 5 : -161);
      bmr = Math.round(bmr);

      return {
        mainValue: bmr,
        unit: 'kcal / day',
        category: 'Basal Metabolic Rate',
        color: 'purple',
        summary: `Your body burns approximately ${bmr} calories daily at complete rest to maintain vital organ functions.`,
        details: [
          { label: 'Sedentary Daily Burn (no exercise)', value: `${Math.round(bmr * 1.2)} kcal` },
          { label: 'Moderate Active Daily Burn (3-5 days/wk)', value: `${Math.round(bmr * 1.55)} kcal` },
          { label: 'Formula Used', value: 'Mifflin-St Jeor Equation' }
        ],
        cta: {
          title: 'Looking to optimize your metabolism or nutrition?',
          btnText: 'Ask your Health Manager on WhatsApp',
          message: `Hello Health Express! My estimated BMR is ${bmr} kcal/day. I would like to consult on diet planning and preventive health checkups.`,
          serviceLink: '/services',
          serviceName: 'View Nutrition & Preventive Care'
        }
      };
    }
  },

  // 3. CALORIE / TDEE CALCULATOR
  {
    id: 'calorie-calculator',
    slug: 'calorie-calculator',
    title: 'Daily Calorie (TDEE) Calculator',
    shortDesc: 'Estimate how many calories you need each day based on your body and activity level.',
    category: 'body-fitness',
    categoryName: 'Body & Fitness',
    iconName: 'Zap',
    disclaimer: 'TDEE is a general energy expenditure estimate. Do not apply restrictive calorie goals during pregnancy, childhood, or medical recovery without clinical guidance.',
    sources: [
      { name: 'Mifflin et al., AJCN', url: 'https://pubmed.ncbi.nlm.nih.gov/2305711/' }
    ],
    inputs: [
      { id: 'gender', label: 'Biological Sex', type: 'select', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }], default: 'female' },
      { id: 'age', label: 'Age (Years)', type: 'number', min: 18, max: 95, default: 28, step: 1 },
      { id: 'height', label: 'Height (cm)', type: 'number', min: 100, max: 230, default: 162, step: 1 },
      { id: 'weight', label: 'Weight (kg)', type: 'number', min: 30, max: 200, default: 62, step: 1 },
      { 
        id: 'activity', 
        label: 'Activity Level', 
        type: 'select', 
        options: [
          { label: 'Sedentary (Little or no exercise)', value: '1.2' },
          { label: 'Lightly Active (Exercise 1-3 days/wk)', value: '1.375' },
          { label: 'Moderately Active (Exercise 3-5 days/wk)', value: '1.55' },
          { label: 'Very Active (Hard exercise 6-7 days/wk)', value: '1.725' }
        ], 
        default: '1.375' 
      }
    ],
    calculate: (inputs) => {
      const w = Number(inputs.weight);
      const h = Number(inputs.height);
      const a = Number(inputs.age);
      const factor = Number(inputs.activity);
      const isMale = inputs.gender === 'male';

      if (!w || !h || !a) return null;

      const bmr = (10 * w) + (6.25 * h) - (5 * a) + (isMale ? 5 : -161);
      const tdee = Math.round(bmr * factor);
      const weightLossKcal = Math.round(tdee - 400);
      const weightGainKcal = Math.round(tdee + 400);

      return {
        mainValue: tdee,
        unit: 'kcal / day',
        category: 'Total Daily Energy Expenditure',
        color: 'emerald',
        summary: `To maintain your current weight, your estimated daily intake is ${tdee} calories.`,
        details: [
          { label: 'Weight Maintenance', value: `${tdee} kcal/day` },
          { label: 'Mild Weight Loss (~0.4 kg/wk)', value: `${weightLossKcal} kcal/day` },
          { label: 'Weight Gain Target', value: `${weightGainKcal} kcal/day` },
          { label: 'Basal Rest Rate (BMR)', value: `${Math.round(bmr)} kcal/day` }
        ],
        cta: {
          title: 'Want professional diet guidance or a metabolic blood profile?',
          btnText: 'Consult Health Manager on WhatsApp',
          message: `Hello Health Express! My estimated TDEE is ${tdee} kcal/day. Please guide me on nutrition consultations and blood tests.`,
          serviceLink: '/services',
          serviceName: 'Browse Metabolic & Lipid Tests'
        }
      };
    }
  },

  // 4. IDEAL WEIGHT CALCULATOR
  {
    id: 'ideal-weight-calculator',
    slug: 'ideal-weight-calculator',
    title: 'Ideal Weight Calculator',
    shortDesc: 'Get an estimated healthy reference weight range based on your height.',
    category: 'body-fitness',
    categoryName: 'Body & Fitness',
    iconName: 'Target',
    disclaimer: 'Calculated using historical Devine formula reference equations alongside standard CDC healthy BMI range (18.5–24.9). Used as a general reference, not a strict medical target.',
    sources: [
      { name: 'Devine Formula & CDC Reference', url: 'https://www.cdc.gov/bmi/adult-calculator/index.html' }
    ],
    inputs: [
      { id: 'gender', label: 'Biological Sex', type: 'select', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }], default: 'male' },
      { id: 'height', label: 'Height (cm)', type: 'number', min: 140, max: 220, default: 175, step: 1 }
    ],
    calculate: (inputs) => {
      const hCm = Number(inputs.height);
      const hInches = hCm / 2.54;
      const isMale = inputs.gender === 'male';

      if (!hCm) return null;

      const inchesOver5ft = Math.max(0, hInches - 60);
      const devineWeight = isMale ? (50 + (2.3 * inchesOver5ft)) : (45.5 + (2.3 * inchesOver5ft));

      const hM = hCm / 100;
      const minBmiWeight = 18.5 * hM * hM;
      const maxBmiWeight = 24.9 * hM * hM;

      return {
        mainValue: Math.round(devineWeight),
        unit: 'kg (Devine Reference)',
        category: 'Estimated Reference Weight',
        color: 'purple',
        summary: `Your estimated reference weight according to Devine formula is ~${Math.round(devineWeight)} kg.`,
        details: [
          { label: 'Devine Reference Estimate', value: `${devineWeight.toFixed(1)} kg` },
          { label: 'CDC Healthy Weight Range', value: `${minBmiWeight.toFixed(1)} kg – ${maxBmiWeight.toFixed(1)} kg` }
        ],
        cta: {
          title: 'Want a comprehensive body composition checkup?',
          btnText: 'Talk to a Health Manager',
          message: `Hello Health Express! I checked my ideal weight reference (${devineWeight.toFixed(1)} kg) on your website and would like information on health screening packages.`,
          serviceLink: '/services',
          serviceName: 'View Health Checkup Packages'
        }
      };
    }
  },

  // 5. BODY FAT CALCULATOR
  {
    id: 'body-fat-calculator',
    slug: 'body-fat-calculator',
    title: 'Body Fat Calculator',
    shortDesc: 'Estimate your body fat percentage using U.S. Navy circumference method.',
    category: 'body-fitness',
    categoryName: 'Body & Fitness',
    iconName: 'Activity',
    disclaimer: 'Calculated using the U.S. Navy circumference equations. Circumference equations are sensitive to measuring technique and provide anthropometric estimates.',
    sources: [
      { name: 'U.S. Navy Body Composition Method', url: 'https://www.calculator.net/fitness-and-health-calculator.html' }
    ],
    inputs: [
      { id: 'gender', label: 'Biological Sex', type: 'select', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }], default: 'male' },
      { id: 'height', label: 'Height (cm)', type: 'number', min: 140, max: 220, default: 175, step: 1 },
      { id: 'waist', label: 'Waist Circumference (cm)', type: 'number', min: 50, max: 180, default: 85, step: 1 },
      { id: 'neck', label: 'Neck Circumference (cm)', type: 'number', min: 25, max: 70, default: 38, step: 1 },
      { id: 'hip', label: 'Hip Circumference (cm - Females only)', type: 'number', min: 50, max: 180, default: 95, step: 1 }
    ],
    calculate: (inputs) => {
      const h = Number(inputs.height);
      const w = Number(inputs.waist);
      const n = Number(inputs.neck);
      const hip = Number(inputs.hip);
      const isMale = inputs.gender === 'male';

      if (!h || !w || !n) return null;

      let bodyFat = 0;

      if (isMale) {
        if (w - n <= 0) return null;
        bodyFat = 495 / (1.0324 - (0.19077 * Math.log10(w - n)) + (0.15456 * Math.log10(h))) - 450;
      } else {
        if (w + hip - n <= 0) return null;
        bodyFat = 495 / (1.29579 - (0.35004 * Math.log10(w + hip - n)) + (0.22100 * Math.log10(h))) - 450;
      }

      bodyFat = Math.max(3, Math.min(60, Number(bodyFat.toFixed(1))));

      let category = 'Fitness Range';
      let color = 'emerald';

      if (isMale) {
        if (bodyFat < 6) category = 'Essential Fat';
        else if (bodyFat <= 13) category = 'Athletes';
        else if (bodyFat <= 17) category = 'Fitness';
        else if (bodyFat <= 24) category = 'Average';
        else { category = 'High Body Fat'; color = 'amber'; }
      } else {
        if (bodyFat < 14) category = 'Essential Fat';
        else if (bodyFat <= 20) category = 'Athletes';
        else if (bodyFat <= 24) category = 'Fitness';
        else if (bodyFat <= 31) category = 'Average';
        else { category = 'High Body Fat'; color = 'amber'; }
      }

      return {
        mainValue: bodyFat,
        unit: '%',
        category,
        color,
        summary: `Estimated body fat percentage is ${bodyFat}% (${category} category).`,
        details: [
          { label: 'Body Fat Category', value: category },
          { label: 'Calculation Method', value: 'U.S. Navy Circumference Equation' }
        ],
        cta: {
          title: 'Want a clinical lipid profile or wellness screening?',
          btnText: 'Talk to a Health Manager',
          message: `Hello Health Express! I estimated my body fat at ${bodyFat}% on your site. Please share details on lipid profile and wellness tests.`,
          serviceLink: '/services',
          serviceName: 'View Lipid & Wellness Packages'
        }
      };
    }
  },

  // 6. WATER INTAKE CALCULATOR
  {
    id: 'water-intake-calculator',
    slug: 'water-intake-calculator',
    title: 'Water Intake Calculator',
    shortDesc: 'Estimate your daily fluid needs based on body weight, activity, and climate.',
    category: 'body-fitness',
    categoryName: 'Body & Fitness',
    iconName: 'Droplet',
    disclaimer: 'Consumer hydration estimate based on baseline 35 mL/kg fluid guidance. Patients with kidney or heart disease should follow clinician fluid restrictions.',
    sources: [
      { name: 'National Academies Hydration Guidance', url: 'https://www.calculator.net/fitness-and-health-calculator.html' }
    ],
    inputs: [
      { id: 'weight', label: 'Body Weight (kg)', type: 'number', min: 30, max: 200, default: 68, step: 1 },
      { 
        id: 'exercise', 
        label: 'Daily Exercise / Activity', 
        type: 'select', 
        options: [
          { label: 'None / Minimal', value: '0' },
          { label: '30 Minutes Exercise', value: '350' },
          { label: '60 Minutes Exercise', value: '700' },
          { label: '90+ Minutes Heavy Workout', value: '1000' }
        ], 
        default: '350' 
      },
      { 
        id: 'climate', 
        label: 'Climate / Weather Exposure', 
        type: 'select', 
        options: [
          { label: 'Normal / Air Conditioned', value: '0' },
          { label: 'Hot / Humid Weather', value: '400' }
        ], 
        default: '0' 
      }
    ],
    calculate: (inputs) => {
      const w = Number(inputs.weight);
      const ex = Number(inputs.exercise);
      const cl = Number(inputs.climate);

      if (!w) return null;

      const baseMl = w * 35;
      const totalMl = Math.round(baseMl + ex + cl);
      const liters = (totalMl / 1000).toFixed(1);
      const glasses = Math.round(totalMl / 250);

      return {
        mainValue: liters,
        unit: 'Liters / day',
        category: 'Daily Hydration Target',
        color: 'sky',
        summary: `Your recommended daily fluid intake is ~${liters} Liters (${glasses} standard glasses).`,
        details: [
          { label: 'Daily Hydration Target', value: `${liters} Liters` },
          { label: 'Equivalent Glasses (250 mL)', value: `${glasses} glasses` },
          { label: 'Baseline Requirement', value: `${(baseMl / 1000).toFixed(1)} L` }
        ],
        cta: {
          title: 'Inquiring about kidney health or electrolyte screening?',
          btnText: 'Ask Health Manager on WhatsApp',
          message: `Hello Health Express! I checked my daily water intake (${liters}L) on your site. Please share details on kidney function tests (KFT).`,
          serviceLink: '/services',
          serviceName: 'Browse Kidney Function Tests (KFT)'
        }
      };
    }
  },

  // 7. BLOOD PRESSURE CATEGORY CHECKER
  {
    id: 'blood-pressure-checker',
    slug: 'blood-pressure-checker',
    title: 'Blood Pressure Category Checker',
    shortDesc: 'Classify your blood pressure reading against established AHA guidelines.',
    category: 'heart-health',
    categoryName: 'Heart Health',
    iconName: 'HeartPulse',
    disclaimer: 'Based on American Heart Association (AHA) guidelines. Hypertension cannot be diagnosed from a single reading. Seeking immediate medical care for severe symptoms is recommended.',
    sources: [
      { name: 'AHA Blood Pressure Explained', url: 'https://www.heart.org/en/health-topics/high-blood-pressure/blood-pressure-explained' }
    ],
    inputs: [
      { id: 'systolic', label: 'Systolic BP (Top Number, mmHg)', type: 'number', min: 70, max: 240, default: 118, step: 1 },
      { id: 'diastolic', label: 'Diastolic BP (Bottom Number, mmHg)', type: 'number', min: 40, max: 140, default: 78, step: 1 }
    ],
    calculate: (inputs) => {
      const sys = Number(inputs.systolic);
      const dia = Number(inputs.diastolic);

      if (!sys || !dia) return null;

      let category = 'Normal Blood Pressure';
      let color = 'emerald';
      let summary = 'Your reading falls within the normal range (<120 systolic and <80 diastolic).';

      if (sys > 180 || dia > 120) {
        category = 'Hypertensive Crisis — Seek Immediate Care';
        color = 'rose';
        summary = 'Systolic over 180 or diastolic over 120 requires prompt medical evaluation.';
      } else if (sys >= 140 || dia >= 90) {
        category = 'Stage 2 Hypertension';
        color = 'rose';
        summary = 'Systolic 140+ or diastolic 90+ falls under Stage 2 Hypertension category.';
      } else if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) {
        category = 'Stage 1 Hypertension';
        color = 'amber';
        summary = 'Systolic 130-139 or diastolic 80-89 falls under Stage 1 Hypertension category.';
      } else if (sys >= 120 && sys <= 129 && dia < 80) {
        category = 'Elevated Blood Pressure';
        color = 'amber';
        summary = 'Systolic 120-129 with diastolic <80 indicates elevated blood pressure.';
      }

      return {
        mainValue: `${sys}/${dia}`,
        unit: 'mmHg',
        category,
        color,
        summary,
        details: [
          { label: 'AHA Category', value: category },
          { label: 'Normal Range', value: '< 120 and < 80 mmHg' },
          { label: 'Elevated Range', value: '120–129 and < 80 mmHg' },
          { label: 'Stage 1 Hypertension', value: '130–139 or 80–89 mmHg' },
          { label: 'Stage 2 Hypertension', value: '≥ 140 or ≥ 90 mmHg' }
        ],
        cta: {
          title: 'Want to consult a cardiologist or book a Cardiac Profile?',
          btnText: 'Talk to a Health Manager on WhatsApp',
          message: `Hello Health Express! I checked my blood pressure reading (${sys}/${dia} mmHg - ${category}) on your site. Please assist me with cardiac checkups.`,
          serviceLink: '/services',
          serviceName: 'View Cardiac & Lipid Packages'
        }
      };
    }
  },

  // 8. TARGET HEART RATE CALCULATOR
  {
    id: 'target-heart-rate-calculator',
    slug: 'target-heart-rate-calculator',
    title: 'Target Heart Rate Calculator',
    shortDesc: 'Estimate your max heart rate and exercise training zones by age.',
    category: 'heart-health',
    categoryName: 'Heart Health',
    iconName: 'Activity',
    disclaimer: 'Based on American Heart Association age-predicted formulas (Max HR ≈ 220 - age). Heart medications or medical conditions alter target ranges.',
    sources: [
      { name: 'AHA Target Heart Rates', url: 'https://www.heart.org/en/healthy-living/exercise-and-physical-activity/fitness-basics/target-heart-rates' }
    ],
    inputs: [
      { id: 'age', label: 'Age (Years)', type: 'number', min: 18, max: 90, default: 35, step: 1 }
    ],
    calculate: (inputs) => {
      const age = Number(inputs.age);
      if (!age) return null;

      const maxHr = 220 - age;
      const modMin = Math.round(maxHr * 0.50);
      const modMax = Math.round(maxHr * 0.70);
      const vigMin = Math.round(maxHr * 0.70);
      const vigMax = Math.round(maxHr * 0.85);

      return {
        mainValue: maxHr,
        unit: 'bpm (Age-Predicted Max)',
        category: 'Max Heart Rate',
        color: 'purple',
        summary: `Your estimated maximum heart rate is ~${maxHr} bpm.`,
        details: [
          { label: 'Age-Predicted Max HR', value: `${maxHr} bpm` },
          { label: 'Moderate Intensity Zone (50-70%)', value: `${modMin} – ${modMax} bpm` },
          { label: 'Vigorous Intensity Zone (70-85%)', value: `${vigMin} – ${vigMax} bpm` }
        ],
        cta: {
          title: 'Want an ECG or full heart health assessment?',
          btnText: 'Consult Health Manager on WhatsApp',
          message: `Hello Health Express! I checked my target heart rate zone (${modMin}-${vigMax} bpm) on your website. I would like details on ECG & heart screening.`,
          serviceLink: '/services',
          serviceName: 'Browse Heart & ECG Screening'
        }
      };
    }
  },

  // 9. PREGNANCY DUE DATE CALCULATOR
  {
    id: 'due-date-calculator',
    slug: 'due-date-calculator',
    title: 'Pregnancy Due Date Calculator',
    shortDesc: 'Estimate your expected delivery date based on your last menstrual period.',
    category: 'womens-health',
    categoryName: "Women's Health",
    iconName: 'Calendar',
    disclaimer: 'Estimates expected delivery date (EDD) using standard Naegele rule (LMP + 280 days). Ultrasound measurements during prenatal care may update this date.',
    sources: [
      { name: 'Mayo Clinic Due Date Methodology', url: 'https://www.mayoclinic.org/healthy-lifestyle/getting-pregnant/in-depth/due-date-calculator/itt-20084955' }
    ],
    inputs: [
      { id: 'lmp', label: 'First Day of Last Menstrual Period (LMP)', type: 'date', default: new Date().toISOString().split('T')[0] },
      { id: 'cycle', label: 'Average Cycle Length (Days)', type: 'number', min: 22, max: 38, default: 28, step: 1 }
    ],
    calculate: (inputs) => {
      const lmpDate = new Date(inputs.lmp);
      const cycle = Number(inputs.cycle) || 28;

      if (isNaN(lmpDate.getTime())) return null;

      // Add 280 days + cycle adjustment
      const cycleAdj = cycle - 28;
      const edd = new Date(lmpDate.getTime() + ((280 + cycleAdj) * 24 * 60 * 60 * 1000));

      const today = new Date();
      const diffMs = today.getTime() - lmpDate.getTime();
      const totalDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
      const weeks = Math.floor(totalDays / 7);
      const days = totalDays % 7;

      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      const eddString = edd.toLocaleDateString('en-IN', options);

      return {
        mainValue: eddString,
        unit: 'Estimated Delivery Date',
        category: `Gestational Age: ${weeks > 0 ? `${weeks} Weeks ${days} Days` : 'Early Pregnancy'}`,
        color: 'emerald',
        summary: `Your estimated due date is ${eddString}. You are currently at approximately ${weeks} weeks gestation.`,
        details: [
          { label: 'Estimated Due Date (EDD)', value: eddString },
          { label: 'Current Gestational Age', value: `${weeks} weeks, ${days} days` },
          { label: 'Estimated Ovulation Date', value: new Date(lmpDate.getTime() + ((14 + cycleAdj) * 24 * 60 * 60 * 1000)).toLocaleDateString('en-IN', options) },
          { label: 'First Trimester Ends', value: new Date(lmpDate.getTime() + (12 * 7 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-IN', options) }
        ],
        cta: {
          title: 'Planning your prenatal blood tests & ultrasound scans?',
          btnText: 'Talk to a Health Manager on WhatsApp',
          message: `Hello Health Express! My estimated due date is ${eddString} (${weeks} weeks pregnant). Please assist me with prenatal diagnostic packages.`,
          serviceLink: '/services',
          serviceName: 'Browse Prenatal & Ultrasound Packages'
        }
      };
    }
  },

  // 10. PREGNANCY WEIGHT GAIN CALCULATOR
  {
    id: 'pregnancy-weight-gain-calculator',
    slug: 'pregnancy-weight-gain-calculator',
    title: 'Pregnancy Weight Gain Calculator',
    shortDesc: 'Estimate recommended weight gain range based on pre-pregnancy BMI.',
    category: 'womens-health',
    categoryName: "Women's Health",
    iconName: 'Heart',
    disclaimer: 'Based on Institute of Medicine / National Academies pregnancy weight-gain guidelines for singleton pregnancies.',
    sources: [
      { name: 'National Academies Weight Gain Guidance', url: 'https://nap.nationalacademies.org/catalog/12584/weight-gain-during-pregnancy-reexamining-the-guidelines' }
    ],
    inputs: [
      { id: 'height', label: 'Height (cm)', type: 'number', min: 140, max: 210, default: 162, step: 1 },
      { id: 'preWeight', label: 'Pre-Pregnancy Weight (kg)', type: 'number', min: 35, max: 180, default: 58, step: 1 }
    ],
    calculate: (inputs) => {
      const hM = Number(inputs.height) / 100;
      const wKg = Number(inputs.preWeight);

      if (!hM || !wKg) return null;

      const preBmi = Number((wKg / (hM * hM)).toFixed(1));
      let range = '11.5 kg – 16.0 kg';
      let category = 'Normal Pre-Pregnancy Weight';

      if (preBmi < 18.5) {
        range = '12.5 kg – 18.0 kg';
        category = 'Underweight';
      } else if (preBmi >= 18.5 && preBmi < 25) {
        range = '11.5 kg – 16.0 kg';
        category = 'Normal Weight';
      } else if (preBmi >= 25 && preBmi < 30) {
        range = '7.0 kg – 11.5 kg';
        category = 'Overweight';
      } else {
        range = '5.0 kg – 9.0 kg';
        category = 'Obese Range';
      }

      return {
        mainValue: range,
        unit: 'Total Gain Target',
        category,
        color: 'purple',
        summary: `Based on your pre-pregnancy BMI of ${preBmi} (${category}), the recommended total weight gain range is ${range}.`,
        details: [
          { label: 'Pre-Pregnancy BMI', value: `${preBmi} kg/m² (${category})` },
          { label: 'Recommended Total Gain Range', value: range },
          { label: 'Trimester 2 & 3 Weekly Target', value: preBmi < 25 ? '~0.4 kg / week' : '~0.3 kg / week' }
        ],
        cta: {
          title: 'Want guidance on maternal health monitoring?',
          btnText: 'Consult Health Manager on WhatsApp',
          message: `Hello Health Express! I calculated my pregnancy weight gain range (${range}) on your site. Please help me coordinate prenatal care.`,
          serviceLink: '/services',
          serviceName: 'Browse Pregnancy Health Services'
        }
      };
    }
  },

  // 11. OVULATION & FERTILE WINDOW CALCULATOR
  {
    id: 'ovulation-calculator',
    slug: 'ovulation-calculator',
    title: 'Ovulation & Fertile Window Calculator',
    shortDesc: 'Estimate your fertile window and likely ovulation date from cycle information.',
    category: 'womens-health',
    categoryName: "Women's Health",
    iconName: 'Sparkles',
    disclaimer: 'Based on ACOG fertile-window guidelines. Calendar estimates are approximate and should not be used as a primary method of contraception.',
    sources: [
      { name: 'ACOG Fertile Window Guidance', url: 'https://www.acog.org/womens-health/experts-and-stories/the-latest/trying-to-get-pregnant-heres-when-to-have-sex' }
    ],
    inputs: [
      { id: 'lmp', label: 'First Day of Last Period', type: 'date', default: new Date().toISOString().split('T')[0] },
      { id: 'cycleLength', label: 'Average Cycle Length (Days)', type: 'number', min: 21, max: 40, default: 28, step: 1 }
    ],
    calculate: (inputs) => {
      const lmpDate = new Date(inputs.lmp);
      const cycle = Number(inputs.cycleLength) || 28;

      if (isNaN(lmpDate.getTime())) return null;

      // Ovulation = LMP + cycle - 14 days
      const ovulationDays = cycle - 14;
      const ovulationDate = new Date(lmpDate.getTime() + (ovulationDays * 24 * 60 * 60 * 1000));
      
      const fertileStart = new Date(ovulationDate.getTime() - (5 * 24 * 60 * 60 * 1000));
      const fertileEnd = new Date(ovulationDate.getTime() + (1 * 24 * 60 * 60 * 1000));

      const options = { month: 'short', day: 'numeric' };

      return {
        mainValue: ovulationDate.toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }),
        unit: 'Estimated Ovulation Date',
        category: 'Fertile Window',
        color: 'purple',
        summary: `Your fertile window is estimated from ${fertileStart.toLocaleDateString('en-IN', options)} to ${fertileEnd.toLocaleDateString('en-IN', options)}.`,
        details: [
          { label: 'Estimated Ovulation Date', value: ovulationDate.toLocaleDateString('en-IN', options) },
          { label: 'Peak Fertile Window', value: `${fertileStart.toLocaleDateString('en-IN', options)} – ${fertileEnd.toLocaleDateString('en-IN', options)}` },
          { label: 'Next Expected Period', value: new Date(lmpDate.getTime() + (cycle * 24 * 60 * 60 * 1000)).toLocaleDateString('en-IN', options) }
        ],
        cta: {
          title: 'Planning a pregnancy or hormonal profile?',
          btnText: 'Talk to Health Manager on WhatsApp',
          message: `Hello Health Express! I checked my ovulation window on your website. Please guide me on fertility hormone profiles (AMH, Thyroid, FSH).`,
          serviceLink: '/services',
          serviceName: 'Browse Hormone & Fertility Screening'
        }
      };
    }
  }
];

export function getCalculatorBySlug(slug) {
  return CALCULATORS.find(c => c.slug === slug);
}

export function getCalculatorsByCategory(catId) {
  return CALCULATORS.filter(c => c.category === catId);
}
