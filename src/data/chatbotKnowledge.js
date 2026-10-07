/**
 * HEALTH EXPRESS — HEX
 * AI AGENT KNOWLEDGE & DECISION SYSTEM DATASET
 * Website-driven Knowledge Base • Version 1.0
 * 
 * Authoritative Source of Truth for HEX AI Agent
 */

export const HEX_SPECIFICATION = {
  agentIdentity: {
    name: "HEX",
    greeting: "How may I assist you today?",
    persona: "Warm family health manager",
    tone: "Warm, calm, professional, concise and clear",
    escalationPhrase: "Let me connect you to your Health Manager.",
    humanDestination: "Health Manager",
    primaryHandoff: "Approved WhatsApp channel"
  },

  operatingRules: {
    sourceOfTruth: "Approved Health Express website/CMS knowledge data is authoritative.",
    noInvention: "Never guess, infer, extrapolate or fill missing data with general model knowledge.",
    humanHandoff: "If information is missing/ambiguous, a quotation is required, the user has a concern, or an operational action is requested, offer Health Manager handoff.",
    informationalOnly: "HEX explains and guides; it does not execute transactions (booking, payment, cancellation, rescheduling).",
    noMedicalAdvice: "Never diagnose, interpret symptoms/results, recommend medicines/treatment, or give clinical opinions.",
    providerNeutrality: "Present factual provider information only. Do NOT rank or recommend providers.",
    privacy: "Authenticated family information may only be shown to authorized users within the relevant account.",
    goldenRule: "If HEX knows it from approved Health Express data, explain it. If HEX does not know it, do not guess — connect the user to their Health Manager."
  },

  serviceCatalogue: [
    {
      id: "lab-diagnostics",
      type: "service",
      name: "Lab Diagnostics",
      status: "LIVE",
      short_description: "Home sample collection and NABL-accredited diagnostic blood testing.",
      full_description: "Comprehensive blood tests, pathology panels, and routine diagnostic checkups collected directly at home in Bengaluru.",
      coverage: "Bengaluru (Selected Pilot Localities & PIN Codes)",
      price_type: "MRP / STARTING_FROM",
      mrp_inr: null,
      starting_price_inr: 299,
      human_handoff: true
    },
    {
      id: "radiology-imaging",
      type: "service",
      name: "Radiology & Imaging",
      status: "LIVE",
      short_description: "X-Rays, Ultrasound, MRI & CT Scans at trusted diagnostic centers.",
      full_description: "High-precision diagnostic imaging at NABL/NABH accredited partner centers near you in Bengaluru with digital report delivery.",
      coverage: "Bengaluru (Selected Diagnostic Partner Centers)",
      price_type: "MRP / STARTING_FROM",
      mrp_inr: null,
      starting_price_inr: 1200,
      human_handoff: true
    },
    {
      id: "genetics-genomics",
      type: "service",
      name: "Genetics & Genomics",
      status: "LIVE",
      short_description: "Personalized DNA screening & hereditary health risk profiling.",
      full_description: "Advanced DNA sequencing and hereditary risk assessments paired with expert genetic counseling.",
      coverage: "Bengaluru",
      price_type: "MRP / STARTING_FROM",
      mrp_inr: null,
      starting_price_inr: 4999,
      human_handoff: true
    },
    {
      id: "preventive-packages",
      type: "service",
      name: "Health & Preventive Packages",
      status: "LIVE",
      short_description: "Full body health checkups & screening profiles for all age groups.",
      full_description: "Proactive checkup packages designed to assess diabetes, heart health, lipid profiles, liver & kidney wellness, and vitamin levels.",
      coverage: "Bengaluru",
      price_type: "MRP / STARTING_FROM",
      mrp_inr: 2999,
      starting_price_inr: 1499,
      human_handoff: true
    },
    {
      id: "home-nursing-care",
      type: "service",
      name: "Home Nursing & Care",
      status: "LIVE",
      short_description: "Professional nursing care, caregivers, and clinical support at home.",
      full_description: "Broader coverage home healthcare services including post-operative recovery, elderly care, Japa care, and companion caregivers.",
      coverage: "Bengaluru (Broader Citywide Coverage)",
      price_type: "QUOTE_REQUIRED",
      mrp_inr: null,
      starting_price_inr: null,
      human_handoff: true
    },
    {
      id: "surgery-coordination",
      type: "service",
      name: "Surgery & Surgical Care Coordination",
      status: "LIVE",
      short_description: "Second opinions & surgical admission coordination.",
      full_description: "Expert surgical guidance, hospital admission coordination, insurance assistance, and post-surgery recovery planning.",
      coverage: "Bengaluru",
      price_type: "QUOTE_REQUIRED",
      mrp_inr: null,
      starting_price_inr: null,
      human_handoff: true
    }
  ],

  homeNursingTaxonomy: {
    nursingClinicalSupport: [
      "Home Nursing Care",
      "Post-Operative Care",
      "Post-Hospital & Recovery Care"
    ],
    everydayFamilyCare: [
      "Elderly Care",
      "Patient Caregivers",
      "Respite Care"
    ],
    motherBabyCare: [
      "Japa Caregivers",
      "Postpartum & Newborn Support"
    ],
    others: [
      "Dementia Care",
      "Companion Care",
      "Disability Care",
      "Live-In Care"
    ]
  },

  comingSoonServices: [
    {
      id: "telemedicine",
      name: "Telemedicine",
      status: "COMING_SOON",
      description: "Online doctor consultations and remote care guidance."
    },
    {
      id: "pharmacy",
      name: "Pharmacy & Medicine Delivery",
      status: "COMING_SOON",
      description: "Prescription medicine fulfillment and home delivery."
    },
    {
      id: "wellness",
      name: "Wellness Services",
      status: "COMING_SOON",
      description: "Nutritional guidance, fitness coaching, and lifestyle wellness."
    },
    {
      id: "chronic-management",
      name: "Chronic Disease Management",
      status: "COMING_SOON",
      description: "Dedicated care plans for diabetes, hypertension, and long-term condition management."
    }
  ],

  geographyPilot: {
    city: "Bengaluru",
    pilotStatus: "ACTIVE PILOT",
    outOfAreaWaitlistEnabled: true,
    homeNursingCoverageNote: "Home Nursing has broader coverage across Bengaluru.",
    approvedLocalities: [
      "Koramangala", "Indiranagar", "HSR Layout", "Whitefield", 
      "Bellandur", "Jayanagar", "Electronic City", "Sarjapur Road", 
      "Hebbal", "JP Nagar", "BTM Layout", "Banashankari",
      "Malleshwaram", "Yelahanka", "Marathahalli"
    ],
    approvedPinCodes: [
      "560034", "560038", "560102", "560066", "560103", 
      "560041", "560100", "560035", "560024", "560078"
    ]
  },

  exampleResponses: {
    greeting: "How may I assist you today?",
    unlistedPrice: "I don't have the current pricing for this service. Let me connect you to your Health Manager.",
    unknownInformation: "I don't have that information available right now. Let me connect you to your Health Manager.",
    medicalAdvice: "I can help with Health Express services and coordination, but I can't provide medical advice. Let me connect you to your Health Manager.",
    outOfArea: "Health Express is currently available in select areas of Bengaluru. This area is not currently covered. I can help you join the waitlist so you can be notified when we expand.",
    comingSoon: "This service is coming soon to Health Express. It isn't currently available.",
    humanRequest: "Of course. Let me connect you to your Health Manager.",
    callback: "Absolutely. I'll connect you with the Health Manager team so they can call you back.",
    prescription: "You can upload your prescription/medical order or connect with your Health Manager on WhatsApp. Our team can review it and guide you on the next step."
  }
};

export const CHATBOT_KNOWLEDGE = {
  company: {
    name: "Health Express",
    assistantName: "HEX",
    positioning: "Your personal health manager, for you and your family.",
    tagline: "Healthcare, without the hassle.",
    launchCity: "Bengaluru",
    softLaunchNotice: "Health Express is currently operating in its active pilot phase focused on Lab Diagnostics, Radiology, Genetics, Preventive Health, Home Nursing, and Surgical Coordination in Bengaluru.",
    whatsappNumber: "+91 76765 58809",
    whatsappLink: "https://wa.me/917676558809",
    email: "hello@healthexpress.care"
  },
  spec: HEX_SPECIFICATION,
  services: HEX_SPECIFICATION.serviceCatalogue,
  localities: HEX_SPECIFICATION.geographyPilot.approvedLocalities
};
