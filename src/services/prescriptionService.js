import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { validateAndNormalizeInternationalPhone } from '../utils/phone.js';
import { generateEnquiryCode } from '../utils/enquiryCode.js';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'doc', 'docx'];

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Validates prescription file type and size
 */
export function validatePrescriptionFile(file) {
  if (!file) {
    return { isValid: false, error: 'Please select a prescription file.' };
  }

  if (file.size <= 0) {
    return { isValid: false, error: 'The selected file appears to be empty.' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { isValid: false, error: 'File size exceeds 10MB limit. Please upload a smaller file.' };
  }

  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    return { 
      isValid: false, 
      error: `Invalid file format (.${extension}). Supported formats: PDF, JPG, PNG, WEBP, DOC, DOCX.` 
    };
  }

  // Validate MIME type
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return { 
      isValid: false, 
      error: 'Invalid file MIME type. Please upload a valid document or image.' 
    };
  }

  return { isValid: true, error: null };
}

/**
 * Submits guest prescription and creates backend system-of-record entries
 */
export async function submitGuestPrescription({ file, files, fullName, phone, countryCode = '+91', city = 'Bengaluru', notes = '', email = '' }) {
  // 1. Validate Patient Name
  if (!fullName || fullName.trim().length < 2) {
    return { success: false, error: 'Please enter your full name (minimum 2 characters).' };
  }

  // 2. Validate & Normalize Phone Number
  const phoneValidation = validateAndNormalizeInternationalPhone(phone, countryCode);
  if (!phoneValidation.isValid) {
    return { success: false, error: phoneValidation.error };
  }
  const phone_e164 = phoneValidation.phone_e164;

  // Normalize input to an array of files
  const fileList = files && Array.isArray(files) && files.length > 0 
    ? files 
    : (file ? [file] : []);

  // 3. Validate Files
  if (fileList.length === 0) {
    return { success: false, error: 'Please select at least one prescription file.' };
  }

  for (const f of fileList) {
    const fileValidation = validatePrescriptionFile(f);
    if (!fileValidation.isValid) {
      return { success: false, error: `${f.name}: ${fileValidation.error}` };
    }
  }

  // 4. Generate Human-Readable Enquiry Code
  const enquiryCode = generateEnquiryCode();

  // REQUIRE CONFIGURED SUPABASE BACKEND (NO FAKE SUCCESS IN PRODUCTION)
  if (!isSupabaseConfigured) {
    return {
      success: false,
      error: '[Error NO_SUPABASE_CONFIG] Supabase backend is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.'
    };
  }

  // PRODUCTION SUPABASE SUBMISSION FLOW:
  // 1. Phone Normalization (Completed in Step 2 above)
  // 2. Get / Create Patient Record
  // 3. Enquiry Record Creation
  // 4. Private Prescription Storage Upload
  // 5. Prescription Metadata Record Creation

  try {
    // ----------------------------------------------------
    // STEP A: GET OR CREATE PATIENT RECORD
    // ----------------------------------------------------
    let patientId = null;

    // 1. Primary path: SECURITY DEFINER RPC call
    try {
      const { data: rpcPatientId, error: rpcError } = await supabase.rpc('get_or_create_guest_patient', {
        p_full_name: fullName.trim(),
        p_phone_e164: phone_e164,
        p_city: city,
        p_email: email.trim() || null
      });

      if (!rpcError && rpcPatientId) {
        patientId = rpcPatientId;
      } else if (rpcError) {
        console.warn('RPC get_or_create_guest_patient warning:', rpcError.message);
      }
    } catch (rpcErr) {
      console.warn('RPC execution exception:', rpcErr);
    }

    // 2. Fallback path 1: Direct select by phone_e164
    if (!patientId) {
      try {
        const { data: existingPatients } = await supabase
          .from('patients')
          .select('id')
          .eq('phone_e164', phone_e164)
          .limit(1);

        if (existingPatients && existingPatients.length > 0) {
          patientId = existingPatients[0].id;
        }
      } catch (lookupErr) {
        console.warn('Direct lookup catch:', lookupErr);
      }
    }

    // 3. Fallback path 2: Direct insert with 23505 duplicate constraint recovery
    if (!patientId) {
      const newPatientId = generateUUID();
      const { error: createPatientError } = await supabase
        .from('patients')
        .insert({
          id: newPatientId,
          full_name: fullName.trim(),
          phone_e164: phone_e164,
          city: city,
          email: email.trim() || null,
          user_id: null,
          is_verified: false
        });

      if (createPatientError) {
        // If PostgreSQL error 23505 (unique constraint violation on phone_e164), fetch existing patient record
        if (createPatientError.code === '23505' || createPatientError.message?.includes('patients_phone_e164_key')) {
          console.info('Caught Postgres 23505 unique constraint error for phone_e164. Fetching existing patient ID...');
          const { data: retryPatients } = await supabase
            .from('patients')
            .select('id')
            .eq('phone_e164', phone_e164)
            .limit(1);

          if (retryPatients && retryPatients.length > 0) {
            patientId = retryPatients[0].id;
          }
        }

        if (!patientId) {
          console.error('Create Patient Error:', createPatientError);
          const errCode = createPatientError.code || 'DB_ERROR';
          const errMsg = createPatientError.message || 'Failed to create patient record.';
          return {
            success: false,
            error: `[Error ${errCode}] Patient Database Error: ${errMsg}. Please execute 'supabase/schema.sql' in your Supabase SQL Editor.`
          };
        }
      } else {
        patientId = newPatientId;
      }
    }

    // ----------------------------------------------------
    // STEP B: CREATE ENQUIRY RECORD
    // ----------------------------------------------------
    const enquiryId = generateUUID();
    const { error: enquiryError } = await supabase
      .from('enquiries')
      .insert({
        id: enquiryId,
        enquiry_code: enquiryCode,
        patient_id: patientId,
        source: 'website',
        status: 'pending_review',
        notes: notes.trim() || null
      });

    if (enquiryError) {
      console.error('Enquiry Insert Error:', enquiryError);
      const errCode = enquiryError.code || 'DB_ERROR';
      const errMsg = enquiryError.message || 'Failed to create enquiry record.';
      return {
        success: false,
        error: `[Error ${errCode}] Enquiry Database Error: ${errMsg}. Please execute 'supabase/schema.sql' in your Supabase SQL Editor.`
      };
    }

    // ----------------------------------------------------
    // STEP C: PRIVATE PRESCRIPTION STORAGE UPLOAD
    // ----------------------------------------------------
    const uploadedFiles = [];
    const uploadErrors = [];
    const timeStamp = Date.now();

    for (let idx = 0; idx < fileList.length; idx++) {
      const f = fileList[idx];
      const cleanFileName = f.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `guest/${enquiryCode}/${timeStamp}_${idx + 1}_${cleanFileName}`;

      const { error: uploadErr } = await supabase.storage
        .from('prescriptions')
        .upload(filePath, f, {
          cacheControl: '3600',
          upsert: false
        });

      if (!uploadErr) {
        uploadedFiles.push({ filePath, name: f.name, type: f.type, size: f.size });
      } else {
        console.error(`Storage Upload Error for ${f.name}:`, uploadErr);
        uploadErrors.push(uploadErr);
      }
    }

    if (uploadedFiles.length === 0 && fileList.length > 0) {
      const firstErr = uploadErrors[0];
      const errCode = firstErr?.statusCode || firstErr?.code || 'STORAGE_ERROR';
      const errMsg = firstErr?.message || 'Storage upload failed.';
      return {
        success: false,
        error: `[Error ${errCode}] Storage Upload Failed: ${errMsg}`
      };
    }

    // ----------------------------------------------------
    // STEP D: PRESCRIPTION METADATA RECORD CREATION
    // ----------------------------------------------------
    let currentAuthUserId = null;
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      currentAuthUserId = authSession?.user?.id || null;
    } catch (e) {
      // Ignore
    }

    for (const item of uploadedFiles) {
      const { error: prescriptionError } = await supabase
        .from('prescriptions')
        .insert({
          id: generateUUID(),
          enquiry_id: enquiryId,
          patient_id: patientId,
          file_path: item.filePath,
          file_name: item.name,
          file_type: item.type || 'application/octet-stream',
          file_size: item.size || 0,
          user_id: currentAuthUserId
        });

      if (prescriptionError) {
        console.error(`Prescription Record Error for ${item.name}:`, prescriptionError);
        const errCode = prescriptionError.code || 'DB_ERROR';
        const errMsg = prescriptionError.message || 'Failed to create prescription record.';
        return {
          success: false,
          error: `[Error ${errCode}] Prescription Metadata Database Error: ${errMsg}. Please execute 'supabase/schema.sql' in your Supabase SQL Editor.`
        };
      }
    }

    // Log non-PII analytics event for admin operations tracking
    try {
      const { logAnalyticsEvent } = await import('../utils/analytics.js');
      logAnalyticsEvent('PRESCRIPTION_UPLOADED', {
        pagePath: '/services',
        metadata: { enquiry_code: enquiryCode, file_count: uploadedFiles.length },
        patientId: patientId
      });
      logAnalyticsEvent('PRESCRIPTION_SUBMITTED', {
        pagePath: '/services',
        metadata: { enquiry_code: enquiryCode, file_count: uploadedFiles.length },
        patientId: patientId
      });
    } catch (anErr) {
      console.warn('Analytics event warning:', anErr);
    }

    // Return successful Enquiry Registration
    return {
      success: true,
      enquiry_code: enquiryCode,
      enquiry_id: enquiryId,
      patient_id: patientId,
      phone_e164: phone_e164,
      patient_name: fullName.trim(),
      file_count: uploadedFiles.length
    };

  } catch (err) {
    console.error('Submission processing failure:', err);
    return {
      success: false,
      error: `[Error EXCEPTION] ${err.message || 'We couldn\'t submit your prescription right now. Please try again.'}`
    };
  }
}
