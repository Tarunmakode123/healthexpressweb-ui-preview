/**
 * Health Express Surgeries & Surgical Care Data Directory
 * Strict pricing directive: No numerical prices displayed; "Price available on request".
 */

export const SURGERY_SPECIALITIES = [
  { 
    id: 'orthopaedics', 
    name: 'Orthopaedic Surgery', 
    iconName: 'Bone',
    description: 'Comprehensive joint replacement, bone fracture management, ligament repairs, and arthroscopic procedures using advanced minimally invasive techniques.',
    procedures: ['Knee Replacement (Total / Partial)', 'Hip Replacement', 'ACL & Ligament Reconstruction', 'Shoulder Arthroscopy', 'Fracture Fixation & Bone Trauma'],
    benefits: ['Minimally Invasive Robotic & Laparoscopic Options', 'NABH Accredited Partner Hospitals', 'Post-Op Physiotherapy & Rehab Guidance', 'Transparent Hospital Package Estimates'],
    hospitalStay: '1 to 3 Days',
    recoveryTime: 'Rapid Rehabilitation Protocol'
  },
  { 
    id: 'spine', 
    name: 'Spine Surgery', 
    iconName: 'Activity',
    description: 'Advanced spinal deformity correction, herniated disc treatment, minimally invasive discectomy, and spinal fusion procedures for chronic neck and back pain.',
    procedures: ['Spinal Fusion (TLIF / PLIF)', 'Microdiscectomy', 'Laminectomy & Decompression', 'Artificial Disc Replacement', 'Endoscopic Spine Surgery'],
    benefits: ['Endoscopic & Microscopic Precision', 'Expert Neuro & Ortho Spine Surgeons', 'Comprehensive Pre & Post-Op Rehab'],
    hospitalStay: '2 to 4 Days',
    recoveryTime: '3 to 6 Weeks Guided Recovery'
  },
  { 
    id: 'cardiac', 
    name: 'Cardiac & Cardiothoracic Surgery', 
    iconName: 'Heart',
    description: 'Open-heart and minimally invasive cardiothoracic procedures, coronary artery bypass grafting (CABG), valve repair/replacement, and congenital heart surgery.',
    procedures: ['Coronary Artery Bypass Grafting (CABG)', 'Heart Valve Replacement / Repair', 'Aortic Aneurysm Repair', 'Pacemaker & ICD Implantation', 'Minimally Invasive Cardiac Surgery (MICS)'],
    benefits: ['Senior Cardiothoracic Surgeons', 'Dedicated Cardiac ICU & Monitoring', 'Second Opinion & Package Comparison'],
    hospitalStay: '4 to 7 Days',
    recoveryTime: 'Structured Cardiac Rehab Program'
  },
  { 
    id: 'neurosurgery', 
    name: 'Neurosurgery', 
    iconName: 'Brain',
    description: 'Specialized surgical care for brain tumors, cerebrovascular disorders, aneurysms, head trauma, and peripheral nerve conditions using image-guided navigation.',
    procedures: ['Brain Tumor Resection', 'Cerebral Aneurysm Clipping / Coiling', 'Hydrocephalus VP Shunt', 'Craniotomy for Trauma', 'Stereotactic Radiosurgery'],
    benefits: ['3D Image-Guided Neuronavigation', 'Dedicated Neuro-Intensive Care Unit', 'Multidisciplinary Tumor Board Review'],
    hospitalStay: '3 to 7 Days',
    recoveryTime: 'Comprehensive Neuro-Rehab Support'
  },
  { 
    id: 'general-surgery', 
    name: 'General & Laparoscopic Surgery', 
    iconName: 'Stethoscope',
    description: 'Keyhole/laparoscopic abdominal surgeries for gallbladder stones, hernias, appendicitis, and gastrointestinal conditions with minimal scarring and fast recovery.',
    procedures: ['Laparoscopic Cholecystectomy (Gallbladder)', 'Hernia Repair (Inguinal / Ventral)', 'Laparoscopic Appendectomy', 'Bariatric / Weight Loss Surgery', 'Piles & Fissure Laser Treatment'],
    benefits: ['Single-Day & Short Stay Procedures', 'Keyhole Laparoscopic & Laser Tech', 'Quick Return to Daily Routine'],
    hospitalStay: '24 Hours to 2 Days',
    recoveryTime: '3 to 7 Days'
  },
  { 
    id: 'gastrointestinal', 
    name: 'Gastrointestinal Surgery', 
    iconName: 'Activity',
    description: 'Surgical management of complex GI tract conditions, liver, pancreas, spleen, intestine, and colorectal diseases by specialized GI surgeons.',
    procedures: ['Colorectal Resection & Surgery', 'Pancreaticoduodenectomy (Whipple)', 'Liver Resection & Biliary Surgery', 'Splenectomy', 'GERD & Hiatal Hernia Surgery'],
    benefits: ['Specialized GI Surgical Gastroenterologists', 'Advanced Endoscopic & Laparoscopic Suites', 'Post-Op Nutritionist Guidance'],
    hospitalStay: '2 to 5 Days',
    recoveryTime: '1 to 3 Weeks'
  },
  { 
    id: 'urology', 
    name: 'Urology', 
    iconName: 'Shield',
    description: 'Minimally invasive laser and endoscopic treatment for kidney stones, prostate enlargement (BPH), urinary incontinence, and urological oncology.',
    procedures: ['Laser Kidney Stone Surgery (RIRS / PCNL)', 'Prostate Surgery (TURP / Laser)', 'Stricture Urethra Surgery', 'Bladder & Kidney Cancer Surgery', 'Varicocelectomy'],
    benefits: ['Stitchless Laser & Endoscopic Surgery', 'Same-Day / Overnight Discharge Options', 'Immediate Pain & Stone Relief'],
    hospitalStay: 'Same-Day to 2 Days',
    recoveryTime: '2 to 5 Days'
  },
  { 
    id: 'oncology', 
    name: 'Oncology & Cancer Surgery', 
    iconName: 'ShieldAlert',
    description: 'Surgical oncology care including tumor removal, organ-preserving surgeries, lymph node dissection, and multidisciplinary cancer care planning.',
    procedures: ['Breast Cancer Surgery (Mastectomy / Lumpectomy)', 'GI & Colorectal Cancer Resection', 'Gynecological Cancer Surgery', 'Head & Neck Tumor Resection', 'Lung & Thoracic Cancer Surgery'],
    benefits: ['Senior Surgical Oncologists', 'Tumor Board Opinion & Chemotherapy Planning', 'Organ-Preserving Surgical Techniques'],
    hospitalStay: '2 to 5 Days',
    recoveryTime: '2 to 4 Weeks Care Plan'
  },
  { 
    id: 'gynaecology', 
    name: 'Gynaecological Surgery', 
    iconName: 'HeartPulse',
    description: 'Laparoscopic and minimally invasive procedures for uterine fibroids, ovarian cysts, endometriosis, hysterectomy, and pelvic floor disorders.',
    procedures: ['Laparoscopic Hysterectomy', 'Fibroid Removal (Myomectomy)', 'Ovarian Cystectomy', 'Endometriosis Excision', 'Pelvic Organ Prolapse Repair'],
    benefits: ['Keyhole Laparoscopic Micro-Incision', 'Female Gynaec-Surgeon Options', 'Preservation of Reproductive Health Options'],
    hospitalStay: '1 to 2 Days',
    recoveryTime: '5 to 10 Days'
  },
  { 
    id: 'ent', 
    name: 'ENT Surgery', 
    iconName: 'UserCheck',
    description: 'Microscopic and endoscopic procedures for ear, nose, throat, sinus, thyroid, and head & neck disorders.',
    procedures: ['Functional Endoscopic Sinus Surgery (FESS)', 'Tympanoplasty & Mastoidectomy', 'Tonsillectomy & Adenoidectomy', 'Septoplasty & Nasal Surgery', 'Thyroidectomy'],
    benefits: ['Stitchless Micro-Endoscopic Techniques', 'Day-Care / Overnight Discharge', 'Preservation of Voice & Hearing'],
    hospitalStay: 'Day Care to 1 Day',
    recoveryTime: '3 to 7 Days'
  },
  { 
    id: 'ophthalmology', 
    name: 'Ophthalmic Surgery', 
    iconName: 'Eye',
    description: 'Advanced eye surgical procedures for cataracts, vision correction, retina, glaucoma, and corneal conditions using robotic & laser tech.',
    procedures: ['Phaco & Robotic Cataract Surgery', 'LASIK & Contoura Vision', 'Retinal Detachment & Vitrectomy', 'Glaucoma Valve / Trabeculectomy', 'Corneal Transplant'],
    benefits: ['Blade-Free Robotic Laser Precision', 'Walk-In Walk-Out Daycare Procedures', 'Rapid Visual Rehabilitation'],
    hospitalStay: 'Day Care (Walk-In Walk-Out)',
    recoveryTime: '24 to 48 Hours'
  },
  { 
    id: 'plastic-reconstructive', 
    name: 'Plastic & Reconstructive Surgery', 
    iconName: 'Sparkles',
    description: 'Reconstructive procedures for trauma, burn care, scar revision, post-cancer tissue reconstruction, and congenital anomaly repairs.',
    procedures: ['Post-Mastectomy Breast Reconstruction', 'Facial Trauma & Fracture Fixation', 'Burn Scar Revision & Microvascular Flaps', 'Cleft Lip & Palate Repair', 'Hand & Tendon Reconstruction'],
    benefits: ['Board-Certified Reconstructive Plastic Surgeons', 'Aesthetic & Functional Restoration', 'Advanced Microvascular Techniques'],
    hospitalStay: '1 to 4 Days',
    recoveryTime: '1 to 3 Weeks'
  },
  { 
    id: 'transplant', 
    name: 'Transplant', 
    iconName: 'CheckCircle2',
    description: 'Comprehensive solid organ transplant coordination including living donor workups, recipient surgery, and post-transplant immunosuppression management.',
    procedures: ['Kidney (Renal) Transplant', 'Liver Transplant (Living / Deceased Donor)', 'Heart Transplant', 'Lung Transplant', 'Bone Marrow / Stem Cell Transplant'],
    benefits: ['State-of-the-Art Transplant ICU Suites', 'Dedicated Transplant Coordination Team', 'Legal & Authorization Support Assistance'],
    hospitalStay: '7 to 14 Days',
    recoveryTime: 'Structured Post-Transplant Monitoring'
  },
  { 
    id: 'ivf-fertility', 
    name: 'IVF & Fertility', 
    iconName: 'Dna',
    description: 'Advanced assisted reproductive technology (ART) including IVF, ICSI, IUI, egg freezing, and male/female fertility treatments.',
    procedures: ['In-Vitro Fertilization (IVF) & ICSI', 'Intrauterine Insemination (IUI)', 'Egg & Embryo Freezing', 'TESE / PESA Male Fertility Procedures', 'Hysteroscopic & Laparoscopic Fertility Surgery'],
    benefits: ['NABL Accredited IVF Laboratories', 'Experienced Reproductive Endocrinologists', 'High Success Rate Protocols & Transparent Packages'],
    hospitalStay: 'Day Care Procedures',
    recoveryTime: 'Immediate Return to Daily Activities'
  },
  { 
    id: 'aesthetic-cosmetic', 
    name: 'Aesthetic & Cosmetic Surgery', 
    iconName: 'Sparkles',
    description: 'Body contouring, facial rejuvenation, rhinoplasty, breast enhancement, and liposuction performed by certified cosmetic surgeons.',
    procedures: ['Rhinoplasty (Nose Reshaping)', 'Liposuction & Body Contouring', 'Breast Augmentation & Reduction', 'Gynecomastia (Male Breast Reduction)', 'Facelift & Abdominoplasty (Tummy Tuck)'],
    benefits: ['Certified Senior Cosmetic Surgeons', 'Private Discreet Hospital Suites', 'Natural Aesthetic Results & High Patient Satisfaction'],
    hospitalStay: 'Day Care to 1 Day',
    recoveryTime: '5 to 10 Days'
  },
  { 
    id: 'hair-aesthetic', 
    name: 'Hair & Aesthetic Treatments', 
    iconName: 'UserCheck',
    description: 'Advanced hair restoration, FUE/FUT hair transplantation, PRP therapy, and non-surgical clinical aesthetic treatments.',
    procedures: ['FUE Hair Transplantation', 'Direct Hair Implantation (DHI)', 'PRP & GFC Hair Growth Therapy', 'Scalp Micropigmentation', 'Laser Skin & Scar Treatments'],
    benefits: ['Stitchless High-Density Hair Transplants', 'Natural Hairline Design & Maximum Graft Survival', 'Painless Local Anesthesia Techniques'],
    hospitalStay: 'Day Care (Walk-In Walk-Out)',
    recoveryTime: '2 to 3 Days'
  }
];

export const POPULAR_SURGERIES_CATEGORIES = [
  {
    category: 'Transplant',
    items: [
      { name: 'Kidney Transplant', slug: 'kidney-transplant' },
      { name: 'Liver Transplant', slug: 'liver-transplant' },
      { name: 'Heart Transplant', slug: 'heart-transplant' },
      { name: 'Lung Transplant', slug: 'lung-transplant' }
    ]
  },
  {
    category: 'IVF & Fertility',
    items: [
      { name: 'IVF Treatment', slug: 'ivf-treatment' },
      { name: 'IUI Treatment', slug: 'iui-treatment' },
      { name: 'Egg Freezing', slug: 'egg-freezing' },
      { name: 'Embryo Freezing', slug: 'embryo-freezing' },
      { name: 'Fertility Preservation', slug: 'fertility-preservation' }
    ]
  },
  {
    category: 'Spine Surgery',
    items: [
      { name: 'Spinal Fusion', slug: 'spinal-fusion' },
      { name: 'Disc Replacement', slug: 'disc-replacement' },
      { name: 'Laminectomy', slug: 'laminectomy' },
      { name: 'Microdiscectomy', slug: 'microdiscectomy' }
    ]
  },
  {
    category: 'Orthopaedics',
    items: [
      { name: 'Knee Replacement', slug: 'knee-replacement' },
      { name: 'Hip Replacement', slug: 'hip-replacement' },
      { name: 'ACL Surgery', slug: 'acl-surgery' }
    ]
  },
  {
    category: 'Cardiac',
    items: [
      { name: 'Heart Bypass Surgery', slug: 'heart-bypass-surgery' },
      { name: 'Valve Replacement', slug: 'valve-replacement' },
      { name: 'Cardiac Surgery', slug: 'cardiac-surgery' }
    ]
  },
  {
    category: 'General Surgery',
    items: [
      { name: 'Hernia Surgery', slug: 'hernia-surgery' },
      { name: 'Gallbladder Surgery', slug: 'gallbladder-surgery' },
      { name: 'Appendix Surgery', slug: 'appendix-surgery' }
    ]
  },
  {
    category: 'Urology',
    items: [
      { name: 'Kidney Stone Surgery', slug: 'kidney-stone-surgery' },
      { name: 'Prostate Surgery', slug: 'prostate-surgery' },
      { name: 'Kidney Surgery', slug: 'kidney-surgery' }
    ]
  },
  {
    category: 'Ophthalmology',
    items: [
      { name: 'Cataract Surgery', slug: 'cataract-surgery' },
      { name: 'LASIK', slug: 'lasik' },
      { name: 'Retinal Surgery', slug: 'retinal-surgery' }
    ]
  },
  {
    category: 'Oncology',
    items: [
      { name: 'Breast Cancer Surgery', slug: 'breast-cancer-surgery' },
      { name: 'Lung Cancer Surgery', slug: 'lung-cancer-surgery' },
      { name: 'Colorectal Cancer Surgery', slug: 'colorectal-cancer-surgery' }
    ]
  },
  {
    category: 'Gynaecology',
    items: [
      { name: 'Hysterectomy', slug: 'hysterectomy' },
      { name: 'Fibroid Surgery', slug: 'fibroid-surgery' },
      { name: 'Endometriosis Surgery', slug: 'endometriosis-surgery' },
      { name: 'Ovarian Surgery', slug: 'ovarian-surgery' }
    ]
  },
  {
    category: 'Plastic & Reconstructive Surgery',
    items: [
      { name: 'Reconstructive Surgery', slug: 'reconstructive-surgery' },
      { name: 'Breast Reconstruction', slug: 'breast-reconstruction' },
      { name: 'Facial Reconstruction', slug: 'facial-reconstruction' },
      { name: 'Burn Reconstruction', slug: 'burn-reconstruction' }
    ]
  },
  {
    category: 'Aesthetics & Cosmetic Surgery',
    items: [
      { name: 'Rhinoplasty', slug: 'rhinoplasty' },
      { name: 'Liposuction', slug: 'liposuction' },
      { name: 'Breast Augmentation', slug: 'breast-augmentation' },
      { name: 'Facelift', slug: 'facelift' },
      { name: 'Hair Transplantation', slug: 'hair-transplantation' }
    ]
  },
  {
    category: 'Hair & Aesthetic Treatments',
    items: [
      { name: 'Hair Transplantation', slug: 'hair-transplantation-treatment' },
      { name: 'Hair Restoration', slug: 'hair-restoration' },
      { name: 'PRP Hair Treatment', slug: 'prp-hair-treatment' },
      { name: 'Scalp Treatments', slug: 'scalp-treatments' }
    ]
  }
];

export const SURGERIES_FAQ = [
  {
    question: "What types of surgeries can Health Express help with?",
    answer: "Health Express can help you explore surgical care across major specialities, including orthopaedics, spine surgery, cardiac surgery, neurosurgery, general surgery, gastroenterology, urology, oncology, gynaecology, ophthalmology, ENT, transplant, IVF and fertility, plastic and reconstructive surgery, and aesthetic and cosmetic procedures. You can explore relevant procedures, specialists, hospitals and treatment options based on your needs."
  },
  {
    question: "How can Health Express help me find a specialist for surgery?",
    answer: "Health Express helps you explore and connect with relevant specialists based on your condition, recommended procedure, speciality and location. You can review available doctors and hospitals and request assistance with consultation scheduling and coordination."
  },
  {
    question: "Can I compare surgery costs between hospitals?",
    answer: "Where verified pricing information is available, Health Express can help you understand and compare estimated treatment costs across available hospital options. Actual costs may vary depending on the procedure, surgeon, hospital, location, implants, investigations, length of stay and individual clinical requirements."
  },
  {
    question: "Can I get a second opinion before surgery?",
    answer: "Yes. If you have already been advised to undergo surgery, Health Express can help you explore options for a second specialist opinion. You can share your medical reports and relevant documents to help us identify an appropriate specialist for consultation. A second opinion does not replace your treating doctor's clinical assessment."
  },
  {
    question: "How much does surgery cost in India?",
    answer: "Surgery costs in India vary significantly depending on the procedure, hospital, city, surgeon, technology used, implants, room category and individual patient requirements. Health Express can help you obtain an estimated cost based on the specific procedure and available treatment options."
  },
  {
    question: "Can I upload my medical reports to get surgery assistance?",
    answer: "Yes. You can upload your prescription, diagnosis, medical reports or doctor's recommendation through Health Express. Our team can use the information to understand your requirement and help you explore relevant specialists, hospitals, treatment options and estimated costs. Final diagnosis and treatment decisions should always be made by a qualified treating specialist."
  }
];

export function getSurgeryBySlug(slug) {
  // Return formatted procedure object or fallback default
  const allProcedures = POPULAR_SURGERIES_CATEGORIES.flatMap(cat => 
    cat.items.map(item => ({
      ...item,
      category: cat.category,
      priceNotice: "Custom package estimate based on hospital & insurance",
      description: `Comprehensive evaluation, specialist selection, and hospital coordination for ${item.name} in India.`,
      whyDone: `Recommended by surgical specialists for clinical management and restoration of function or aesthetic outcome.`,
      preparation: `Pre-operative investigations, blood work, anaesthesia assessment, and specialist consultation.`
    }))
  );

  return allProcedures.find(p => p.slug === slug) || {
    name: 'Surgical & Treatment Option',
    slug: 'surgery-option',
    category: 'Specialist Surgical Care',
    priceNotice: 'Custom package estimate based on hospital & insurance',
    description: 'Explore surgical options, top hospital partners, and experienced specialists in India with Health Express.',
    whyDone: 'Comprehensive surgical guidance tailored to individual clinical requirements.',
    preparation: 'Pre-operative health assessment, doctor consultation, and diagnostic evaluations.'
  };
}
