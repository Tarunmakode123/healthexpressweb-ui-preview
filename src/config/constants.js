// Centralized Configuration Constants for Health Express

export const HEALTH_MANAGER_PHONE = import.meta.env.VITE_HEALTH_MANAGER_PHONE || '+918069000000';
export const HEALTH_MANAGER_DISPLAY_PHONE = '+91 80690 00000';

export const SERVICE_CATEGORIES = [
  { id: 'lab-tests', name: 'Lab Tests', slug: 'lab-tests', icon: 'FlaskConical', description: 'Blood tests, pathology, and home sample collection' },
  { id: 'imaging', name: 'Imaging', slug: 'imaging', icon: 'Scan', description: 'MRI, CT Scans, X-Rays, Ultrasound & Radiology' },
  { id: 'genetics', name: 'Genetics', slug: 'genetics', icon: 'Dna', description: 'DNA screening, hereditary risk analysis & genomic tests' },
  { id: 'home-care', name: 'Home Care', slug: 'home-care', icon: 'Home', description: 'Nursing care, doctor visits & medical procedures at home' },
  { id: 'surgery', name: 'Surgery', slug: 'surgery', icon: 'Stethoscope', description: 'Elective surgeries, consultations & hospital care guidance' },
  { id: 'health-packages', name: 'Health Packages', slug: 'health-packages', icon: 'ShieldCheck', description: 'Comprehensive multi-parameter health checkups' }
];

export const CATEGORY_GUIDANCE_BLOCKS = {
  block1: {
    title: 'A little guidance when you need it.',
    body: 'Some healthcare services may require an in-person visit to a diagnostic centre, clinic, or hospital. Your Health Manager will speak with you, explain what’s required, and help you understand the next steps before you proceed.'
  },
  block2: {
    title: 'Fast when possible. Clear when it takes longer.',
    body: 'Get certain diagnostic reports in as little as 4 hours. Turnaround time varies by test, methodology and laboratory, with specialized investigations potentially taking several days or longer. Your Health Manager will explain the expected timeline for your specific test.'
  }
};
