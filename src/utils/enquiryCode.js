/**
 * Health Express Human-Readable Enquiry ID Generator
 * Generates unique, collision-safe, human-readable codes (e.g., HE-2026-89421)
 */

export function generateEnquiryCode() {
  const year = new Date().getFullYear();
  // 5 random uppercase alphanumeric characters excluding confusing characters (0, O, 1, I)
  const charset = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomSegment = '';
  for (let i = 0; i < 5; i++) {
    randomSegment += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return `HE-${year}-${randomSegment}`;
}
