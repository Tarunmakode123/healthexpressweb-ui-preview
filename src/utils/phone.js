/**
 * International & Indian Phone Number Normalization Utility
 * Normalizes input phone numbers to E.164 format (+[CountryCode][NationalNumber])
 * Supports international country codes for NRIs and overseas family care coordination.
 */

export const POPULAR_COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳', name: 'India (+91)' },
  { code: '+1', country: 'USA / Canada', flag: '🇺🇸', name: 'USA / Canada (+1)' },
  { code: '+971', country: 'UAE', flag: '🇦🇪', name: 'UAE (+971)' },
  { code: '+44', country: 'UK', flag: '🇬🇧', name: 'UK (+44)' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', name: 'Singapore (+65)' },
  { code: '+61', country: 'Australia', flag: '🇦🇺', name: 'Australia (+61)' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', name: 'Saudi Arabia (+966)' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦', name: 'Qatar (+974)' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼', name: 'Kuwait (+965)' },
  { code: '+968', country: 'Oman', flag: '🇴🇲', name: 'Oman (+968)' },
  { code: '+49', country: 'Germany', flag: '🇩🇪', name: 'Germany (+49)' },
  { code: '+33', country: 'France', flag: '🇫🇷', name: 'France (+33)' },
  { code: '+81', country: 'Japan', flag: '🇯🇵', name: 'Japan (+81)' }
];

/**
 * Validates and normalizes phone numbers to standard E.164 format
 */
export function validateAndNormalizeInternationalPhone(input, selectedCountryCode = '+91') {
  if (!input || typeof input !== 'string' || !input.trim()) {
    return { isValid: false, phone_e164: '', error: 'Mobile phone number is required.' };
  }

  let cleaned = input.trim();

  // If user typed a number starting with '+', extract the full E.164 string
  if (cleaned.startsWith('+')) {
    const digitsOnly = cleaned.slice(1).replace(/\D/g, '');
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      return { 
        isValid: false, 
        phone_e164: '', 
        error: 'Please enter a valid international mobile number (7 to 15 digits).' 
      };
    }
    return {
      isValid: true,
      phone_e164: `+${digitsOnly}`,
      rawDigits: digitsOnly,
      countryCode: selectedCountryCode,
      error: null
    };
  }

  // Strip non-digit characters
  let digits = cleaned.replace(/\D/g, '');

  // Special validation for Indian mobile numbers (+91)
  if (selectedCountryCode === '+91') {
    if (digits.startsWith('91') && digits.length === 12) {
      digits = digits.slice(2);
    } else if (digits.startsWith('0') && digits.length === 11) {
      digits = digits.slice(1);
    }

    if (digits.length !== 10) {
      return { 
        isValid: false, 
        phone_e164: '', 
        error: 'Please enter a valid 10-digit Indian mobile number.' 
      };
    }

    const firstDigit = digits.charAt(0);
    if (!['6', '7', '8', '9'].includes(firstDigit)) {
      return { 
        isValid: false, 
        phone_e164: '', 
        error: 'Indian mobile numbers must start with 6, 7, 8, or 9.' 
      };
    }

    return {
      isValid: true,
      phone_e164: `+91${digits}`,
      rawDigits: digits,
      countryCode: '+91',
      error: null
    };
  }

  // Validation for other international country codes
  if (digits.length < 5 || digits.length > 14) {
    return {
      isValid: false,
      phone_e164: '',
      error: `Please enter a valid phone number for ${selectedCountryCode}.`
    };
  }

  const cleanCountryCode = selectedCountryCode.replace(/\D/g, '');
  return {
    isValid: true,
    phone_e164: `+${cleanCountryCode}${digits}`,
    rawDigits: digits,
    countryCode: selectedCountryCode,
    error: null
  };
}

/**
 * Backwards compatibility wrapper for Indian phone validation
 */
export function validateAndNormalizeIndianPhone(input, countryCode = '+91') {
  return validateAndNormalizeInternationalPhone(input, countryCode);
}
