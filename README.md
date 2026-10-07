# Health Express — Official Public Website

> **Your personal health manager, for you and your family.**  
> Official repository for the Health Express public website.

---

## 🏥 Overview

**Health Express** helps you find, coordinate, and manage healthcare for yourself and your family — starting with diagnostics and home nursing, and growing toward a more connected healthcare experience.

This repository contains the public website, built with a focus on clear positioning, family health management, high-end commercial healthcare photography, dynamic interactive widgets, AI Healthcare Assistant with 3D Avatar, patient authentication, and a zero-friction WhatsApp prescription coordination workflow.

---

## ✨ Key Features & AI Healthcare Assistant

- **Health Express AI Healthcare Service Assistant (`HealthExpressAssistant.jsx`)**:
  - **Interactive 3D Avatar & Live Glow Ring**: Features a friendly, professional 3D Healthcare Care Manager avatar portrait (`assistant_avatar.jpg`) with an ambient pulse glow ring and online indicator.
  - **Dynamic Speech Teaser Tooltips**: Automatically rotates floating message prompt tips next to the widget button (*"💬 Need help with prescriptions?"*, *"🧪 Find lab tests in Bengaluru"*, *"🏡 Ask about Home Nursing Care"*).
  - **Conversational Service Assistant**: Context-aware AI navigation assistant built for healthcare discovery, test guidance, and Bengaluru locality availability.
  - **Natural Language & Hinglish NLP**: Understands English and Hinglish queries (*"blood test karwana hai"*, *"prescription WhatsApp pe bhejni hai"*, *"CBC test price"*, *"home collection"*).
  - **Medical Safety & Emergency Disclaimers**: Includes strict medical safety guardrails (does not diagnose symptoms or prescribe drugs; attaches clear medical disclaimers and emergency notices).
  - **Contextual WhatsApp Prefilled Message Generator**: Dynamically formats customized WhatsApp messages based on the exact test, service, or prescription intent.
  - **Quick Action Chips**: Includes 1-click interactive action buttons (`[📄 Send / Upload Prescription]`, `[🧪 Find a Test]`, `[🏡 Home Healthcare Nursing]`, `[📍 Bengaluru Locality Coverage]`).
  - **Responsive Floating Widget**: Positioned cleanly at the bottom-right of desktop screens and bottom sheet drawer on mobile viewports.
- **High-End Commercial Photography Assets**:
  - `assistant_avatar.jpg`: Friendly 3D healthcare care manager avatar portrait for the AI Assistant.
  - `hero_home_care.jpg`: Warm, professional editorial photography depicting home nursing care coordination in an Indian home.
  - `family_care.jpg`: Multi-generational Indian family portrait representing family health management with trust and care.
- **Primary Conversion CTA**: *"Send Prescription on WhatsApp"* visually prioritized across Hero, Services, and sticky mobile views.
- **Sticky Mobile WhatsApp CTA Bar (`StickyMobileCTA.jsx`)**: Floating non-intrusive mobile conversion bar for 1-tap WhatsApp prescription uploads on smartphones.
- **Official Brand Identity & Favicon**: Includes the official Health Express logo (*Everything Health - Fast Tracked*) and brand favicon (`public/favicon.png`).
- **Core Positioning**: *"Your personal health manager, for you and your family."*
- **Launch Scope**: Focused on **Diagnostics & Preventive Health Packages** and **Home Nursing** in **Bengaluru**.
- **Patient Authentication Page (`/auth`, `/login`, `/signup`)**:
  - Dual modes for **Sign In** and **Sign Up**.
  - **Indian Mobile OTP** login with 10-digit number validation, 4-digit code verification, countdown timer, and resend OTP support.
  - **Email & Password** alternative authentication with show/hide password toggle.
  - **AuthContext & Local Storage State**: Persisted patient session with user profile menu in Navbar.
- **Interactive Bengaluru Locality Checker**: Live search and quick selector tags for Koramangala, Indiranagar, HSR Layout, Whitefield, Bellandur, Jayanagar, Electronic City, Sarjapur Road, Hebbal, and JP Nagar with instant coverage status & direct locality booking.
- **Interactive Test Package Estimator**: Multi-test selector (CBC, Thyroid Profile, Vitamin D, HbA1c, Lipid Profile, Full Body Checkup) with real-time package estimation and 1-click WhatsApp order generation.
- **Dynamic Category Filter Tabs**: Filter services dynamically across Diagnostics, Care at Home, and Specialized Care with custom feature badges.
- **Glassmorphism, Mesh Gradients & Micro-Animations**:
  - **Radial Mesh Gradients (`.bg-mesh-purple`, `.bg-mesh-dark`)**: Soft purple and deep dark radial light overlays across section backgrounds.
  - **Animated Gradient Headers (`.gradient-text-purple`, `.gradient-text-light`)**: Gradient typography shifts for section titles.
  - **Glowing Card Hover Effects (`.hover-glow`, `.card-interactive`)**: Smooth 3D tilt, subtle vertical translation, and soft purple glow shadow elevation on hover.
- **Secure Guest Prescription Upload System & System of Record**:
  - **Zero-Friction Guest Flow**: Visitors can upload prescriptions without mandatory login or account creation.
  - **3-Step Interactive Wizard (`PrescriptionModal.jsx`)**: File Upload (drag & drop, MIME validation, max 10MB check) → Patient Details (Name, E.164 Mobile Normalization, Locality) → Confirmation & System of Record Registration.
  - **Human-Readable Enquiry ID Generator (`src/utils/enquiryCode.js`)**: Generates collision-safe enquiry codes (e.g. `HE-2026-89421`).
  - **Private Storage Security**: Uploaded files are stored in a Private Supabase Storage Bucket (`public = false`) and accessible only via short-lived signed URLs.
  - **Indian E.164 Phone Normalization (`src/utils/phone.js`)**: Converts 10-digit Indian numbers starting with 6,7,8,9 to standard `+91XXXXXXXXXX`.
  - **Post-OTP Account Linking Trigger**: Hardened PostgreSQL function `link_guest_records_on_otp_login` links past guest prescriptions to authenticated users upon SMS OTP verification.

---

## 🔒 Supabase Architecture & Production SQL Setup

### 1. Database Schema & RLS Setup
Run the production SQL migration script located at `supabase/schema.sql` in your Supabase SQL Editor:
- **`patients` table**: Stores patient profiles with `phone_e164` unique identifier and nullable `user_id`.
- **`enquiries` table**: System of record for patient service enquiries with human-readable `enquiry_code`.
- **`prescriptions` table**: Stores document metadata (`file_path`, `file_name`, `file_size`, `file_type`).
- **Private Storage Bucket `prescriptions`**: Configured with `public = false` and 10MB file limit.

### 2. Environment Variables Configuration

Create a `.env` file in the project root:

```env
# Public Supabase Frontend Credentials (Anon Key ONLY - NEVER Service Role)
VITE_SUPABASE_URL=https://your-supabase-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Configurable WhatsApp Coordination Number
VITE_HEALTH_EXPRESS_WHATSAPP_NUMBER=918123414120
```

> ⚠️ **SECURITY WARNING**: `SUPABASE_SERVICE_ROLE_KEY` must **NEVER** be placed in frontend `.env` files or exposed to client-side code.

---

## 🌐 Official Social Links & Contact

- **Phone / WhatsApp**: [+91 81234 14120](https://wa.me/918123414120)
- **Provider Contact Email**: `hello@healthexpress.care`
- **Instagram**: [https://www.instagram.com/healthexpress_india](https://www.instagram.com/healthexpress_india)
- **Facebook**: [https://www.facebook.com/HealthExpressIndia/](https://www.facebook.com/HealthExpressIndia/)
- **LinkedIn**: [https://www.linkedin.com/company/healthexpressindia](https://www.linkedin.com/company/healthexpressindia)
- **X (Twitter)**: [https://x.com/HealthExpressIN](https://x.com/HealthExpressIN)

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite)
- **Database & Storage**: Supabase PostgreSQL & Private Supabase Storage
- **State Management**: React Context (`AuthContext`)
- **AI & NLP Engine**: Client-side Chatbot Engine (`chatbotEngine.js` & `chatbotKnowledge.js`)
- **Styling**: Tailwind CSS, Glassmorphism, Custom Keyframes
- **Iconography**: Lucide Icons
- **Routing**: React Router

---

## 🚀 Getting Started

### Local Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Tarunmakode123/healthexpressweb.git
   cd healthexpressweb
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_HEALTH_EXPRESS_WHATSAPP_NUMBER=918123414120
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🔒 Privacy & Compliance Notice

This public website serves as a discovery and customer engagement interface. No sensitive patient health records, uploaded prescriptions, or private medical data are exposed or stored publicly. All uploaded healthcare documents are secured in a private storage bucket behind Row Level Security.

---

© 2025–2026 Health Express. All rights reserved.  
*Your personal health manager, for you and your family.*

