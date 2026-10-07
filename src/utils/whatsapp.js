/**
 * Health Express WhatsApp Integration Utility
 * Configurable via environment variables.
 * Formatted with warm, professional Indian healthcare messaging lingo.
 */

export const WHATSAPP_NUMBER = (typeof import.meta !== 'undefined' && import.meta.env ? 
  (import.meta.env.VITE_HEALTH_EXPRESS_WHATSAPP_NUMBER ||
   import.meta.env.VITE_HEALTHeXpress_WHATSAPP_NUMBER || 
   import.meta.env.VITE_WHATSAPP_NUMBER) : null) || "917676558809"; // Dedicated Health Express WhatsApp & Contact number: +91 76765 58809

export const DEFAULT_MESSAGES = {
  general: "Namaste Health Express! I would like help coordinating healthcare services for myself / my family.",
  prescription: "Namaste Health Express! I would like to share my prescription / medical order for coordination.",
  preventive: "Namaste Health Express! I am interested in exploring Preventive Health Packages.",
  service: (serviceName) => `Namaste Health Express! I am interested in ${serviceName}. Please share available options and booking details.`,
  test: (testName) => `Namaste Health Express! I am interested in ${testName}. Please share test details, pricing, and home sample collection availability.`,
  city: (cityName) => `Namaste Health Express! I am looking for available healthcare services in ${cityName}.`,
  provider: "Namaste Health Express! I am a healthcare / diagnostic provider interested in partnering with Health Express."
};

/**
 * Open WhatsApp with a prefilled message
 * @param {string} message - Text message to prefill
 */
export const openWhatsApp = (message = DEFAULT_MESSAGES.general) => {
  const cleanNumber = WHATSAPP_NUMBER.replace(/[^0-9]/g, '');
  const encodedMsg = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMsg}`;
  
  // Open in new tab/window or native WhatsApp app on mobile
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
};
