/**
 * PROFFGNOSIS — One-Time Student Registration Script
 * Vanilla JS + Supabase JS v2
 */

(function () {
  "use strict";

  /* ========================================================================
     1. SUPABASE CONFIGURATION (Existing project credentials)
     ======================================================================== */
  const SUPABASE_URL = "https://spwghoursvkbjpvxerlr.supabase.co/";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_E8QPlpZqDBlT7nSF-Q2pLg_OzfLcw30";

  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    console.error("Supabase JS v2 SDK failed to load.");
    return;
  }

  const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );

  /* ========================================================================
     2. CONFIGURABLE ACADEMIC & INSTITUTION RULES
     ======================================================================== */

  /**
   * VERIFIED_MEDICAL_COLLEGES:
   * Intentionally left EMPTY per administrator instructions.
   * Registration cannot be submitted until you add verified college names here
   * (or load them from a verified database table).
   * Example when ready: ["All India Institute of Medical Sciences, New Delhi", ...]
   */
  const VERIFIED_MEDICAL_COLLEGES = Object.freeze([]);

  /**
   * Exact allowed MBBS Professional Year labels.
   */
  const PROFESSIONAL_YEARS = Object.freeze({
    FIRST: "First Professional",
    SECOND: "Second Professional",
    THIRD_PART_1: "Third Professional Part I",
    THIRD_PART_2: "Third Professional Part II",
    FINAL: "Final Professional"
  });

  const ALLOWED_GENDERS = Object.freeze([
    "Male",
    "Female",
    "Other",
    "Prefer not to say"
  ]);

  const AGE_LIMITS = Object.freeze({
    MIN: 16,
    MAX: 65
  });

  /**
   * ACADEMIC_PROGRESSION_RULES:
   * Explicit cohort-to-professional-year mapping for Indian MBBS batches.
   *
   * ASSUMPTION NOTE:
   * Because Indian MBBS academic calendars vary due to NMC guidelines,
   * COVID-era batch delays (2020–2022), counselling delays, and supplementary
   * exam schedules across universities, a single rigid subtraction formula
   * (currentYear - admissionYear) is inaccurate.
   *
   * Each admission year maps explicitly to the plausible professional years
   * a student from that batch can currently be enrolled in (accounting for
   * standard progression and up to 1–2 years of university/batch variance).
   * Update this object whenever a new academic session begins or shifts.
   */
  const ACADEMIC_PROGRESSION_RULES = Object.freeze({
    2026: [
      PROFESSIONAL_YEARS.FIRST
    ],
    2025: [
      PROFESSIONAL_YEARS.FIRST,
      PROFESSIONAL_YEARS.SECOND
    ],
    2024: [
      PROFESSIONAL_YEARS.SECOND,
      PROFESSIONAL_YEARS.THIRD_PART_1
    ],
    2023: [
      PROFESSIONAL_YEARS.THIRD_PART_1,
      PROFESSIONAL_YEARS.THIRD_PART_2,
      PROFESSIONAL_YEARS.FINAL
    ],
    2022: [
      PROFESSIONAL_YEARS.THIRD_PART_2,
      PROFESSIONAL_YEARS.FINAL
    ],
    2021: [
      PROFESSIONAL_YEARS.THIRD_PART_2,
      PROFESSIONAL_YEARS.FINAL
    ],
    2020: [
      PROFESSIONAL_YEARS.FINAL
    ]
  });

  /* ========================================================================
     3. DEDICATED VALIDATION FUNCTIONS
     ======================================================================== */

  /**
   * Returns valid professional years for a given admission year.
   * Returns an empty array if the admission year is not in ACADEMIC_PROGRESSION_RULES.
   */
  function getAllowedProfessionalYears(admissionYear) {
    const parsedYear = Number(admissionYear);
    if (!Number.isInteger(parsedYear)) {
      return [];
    }
    const allowed = ACADEMIC_PROGRESSION_RULES[parsedYear];
    return Array.isArray(allowed) ? [...allowed] : [];
  }

  /**
   * Dedicated validator for Admission Year + Current MBBS Professional Year.
   * Prevents impossible combinations and rejects tampered DOM values.
   */
  function validateAcademicProgression(admissionYearInput, professionalYearInput) {
    const admissionYear = Number(admissionYearInput);

    if (
      !admissionYearInput ||
      !Number.isInteger(admissionYear) ||
      !Object.prototype.hasOwnProperty.call(ACADEMIC_PROGRESSION_RULES, admissionYear)
    ) {
      return {
        valid: false,
        field: "admission_year",
        message: "Please select a valid MBBS admission year."
      };
    }

    const allowedProfYears = getAllowedProfessionalYears(admissionYear);

    if (!professionalYearInput || typeof professionalYearInput !== "string") {
      return {
        valid: false,
        field: "professional_year",
        message: "Please select your current MBBS professional year."
      };
    }

    if (!allowedProfYears.includes(professionalYearInput)) {
      return {
        valid: false,
        field: "professional_year",
        message: `Selected professional year is not consistent with the ${admissionYear} admission batch.`
      };
    }

    return { valid: true };
  }

  /**
   * Validates the selected medical college against the configured allowlist.
   * Blocks empty lists and arbitrary browser-injected option values.
   */
  function validateMedicalCollege(collegeValue) {
    if (VERIFIED_MEDICAL_COLLEGES.length === 0) {
      return {
        valid: false,
        message: "Registration is temporarily unavailable until verified medical colleges are configured."
      };
    }

    if (
      typeof collegeValue !== "string" ||
      collegeValue.trim() === "" ||
      !VERIFIED_MEDICAL_COLLEGES.includes(collegeValue)
    ) {
      return {
        valid: false,
        message: "Please select a verified medical college from the list."
      };
    }

    return { valid: true };
  }

  /**
   * Validates all form fields holistically before any database operation.
   */
  function validateRegistrationPayload(rawInput) {
    const errors = {};

    // 1. Student Full Name
    const cleanName = typeof rawInput.student_name === "string"
      ? rawInput.student_name.trim().replace(/\s+/g, " ")
      : "";

    if (!cleanName) {
      errors.student_name = "Please enter your full name.";
    } else if (cleanName.length < 2 || cleanName.length > 120) {
      errors.student_name = "Full name must be between 2 and 120 characters.";
    }

    // 2. Medical College
    const collegeCheck = validateMedicalCollege(rawInput.medical_college);
    if (!collegeCheck.valid) {
      errors.medical_college = collegeCheck.message;
    }

    // 3. Admission Year & 4. Professional Year
    const progressionCheck = validateAcademicProgression(
      rawInput.admission_year,
      rawInput.professional_year
    );
    if (!progressionCheck.valid) {
      errors[progressionCheck.field] = progressionCheck.message;
    }

    // 5. Age (Strict integer check)
    const rawAgeStr = String(rawInput.age ?? "").trim();
    const parsedAge = Number(rawAgeStr);
    if (
      rawAgeStr === "" ||
      !/^\d+$/.test(rawAgeStr) ||
      !Number.isInteger(parsedAge) ||
      parsedAge < AGE_LIMITS.MIN ||
      parsedAge > AGE_LIMITS.MAX
    ) {
      errors.age = `Please enter a valid whole-number age between ${AGE_LIMITS.MIN} and ${AGE_LIMITS.MAX}.`;
    }

    // 6. Gender
    if (!ALLOWED_GENDERS.includes(rawInput.gender)) {
      errors.gender = "Please select a valid gender option.";
    }

    const isValid = Object.keys(errors).length === 0;

    return {
      isValid,
      errors,
      sanitizedData: isValid
        ? {
            student_name: cleanName,
            medical_college: rawInput.medical_college,
            admission_year: Number(rawInput.admission_year),
            professional_year: rawInput.professional_year,
            age: parsedAge,
            gender: rawInput.gender
          }
        : null
    };
  }

  /* ========================================================================
     4. DOM REFERENCES & UI HELPERS
     ======================================================================== */
  const els = {
    authLoadingCard: document.getElementById("auth-loading-card"),
    registrationContent: document.getElementById("registration-content"),
    formBanner: document.getElementById("form-banner"),
    form: document.getElementById("registration-form"),
    studentName: document.getElementById("student-name"),
    medicalCollege: document.getElementById("medical-college"),
    collegeHint: document.getElementById("college-status-hint"),
    admissionYear: document.getElementById("admission-year"),
    professionalYear: document.getElementById("professional-year"),
    studentAge: document.getElementById("student-age"),
    studentGender: document.getElementById("student-gender"),
    submitBtn: document.getElementById("submit-btn"),
    submitBtnText: document.getElementById("submit-btn-text"),
    submitBtnSpinner: document.getElementById("submit-btn-spinner"),
    fieldErrors: {
      student_name: document.getElementById("error-student-name"),
      medical_college: document.getElementById("error-medical-college"),
      admission_year: document.getElementById("error-admission-year"),
      professional_year: document.getElementById("error-professional-year"),
      age: document.getElementById("error-student-age"),
      gender: document.getElementById("error-student-gender")
    },
    fieldInputs: {
      student_name: document.getElementById("student-name"),
      medical_college: document.getElementById("medical-college"),
      admission_year: document.getElementById("admission-year"),
      professional_year: document.getElementById("professional-year"),
      age: document.getElementById("student-age"),
      gender: document.getElementById("student-gender")
    }
  };

  let authenticatedUser = null;
  let isSubmitting = false;

  function showBanner(type, message) {
    els.formBanner.textContent = message;
    els.formBanner.className = `banner ${type}`;
  }

  function clearBanner() {
    els.formBanner.textContent = "";
    els.formBanner.className = "banner hidden";
  }

  function clearFieldErrors() {
    Object.keys(els.fieldErrors).forEach((key) => {
      const errorEl = els.fieldErrors[key];
      const inputEl = els.fieldInputs[key];
      if (errorEl) {
        errorEl.textContent = "";
        errorEl.classList.add("hidden");
      }
      if (inputEl) {
        inputEl.classList.remove("is-invalid");
      }
    });
  }

  function renderFieldErrors(errors) {
    clearFieldErrors();
    Object.entries(errors).forEach(([fieldKey, message]) => {
      const errorEl = els.fieldErrors[fieldKey];
      const inputEl = els.fieldInputs[fieldKey];
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove("hidden");
      }
      if (inputEl) {
        inputEl.classList.add("is-invalid");
      }
    });
  }

  function setSubmittingState(submitting) {
    isSubmitting = submitting;
    els.submitBtn.disabled = submitting;
    if (submitting) {
      els.submitBtnText.textContent = "Completing Registration...";
      els.submitBtnSpinner.classList.remove("hidden");
    } else {
      els.submitBtnText.textContent = "Complete Registration";
      els.submitBtnSpinner.classList.add("hidden");
    }
  }

  /* ========================================================================
     5. DROPDOWN INITIALIZATION & DEPENDENT UPDATES
     ======================================================================== */

  function populateMedicalColleges() {
    els.medicalCollege.innerHTML = "";

    if (VERIFIED_MEDICAL_COLLEGES.length === 0) {
      const placeholderOption = document.createElement("option");
      placeholderOption.value = "";
      placeholderOption.textContent = "College list will be available soon";
      placeholderOption.selected = true;
      placeholderOption.disabled = true;
      els.medicalCollege.appendChild(placeholderOption);
      els.medicalCollege.disabled = true;
      els.collegeHint.classList.remove("hidden");
      return;
    }

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select your medical college";
    defaultOption.selected = true;
    defaultOption.disabled = true;
    els.medicalCollege.appendChild(defaultOption);

    VERIFIED_MEDICAL_COLLEGES.forEach((collegeName) => {
      const opt = document.createElement("option");
      opt.value = collegeName;
      opt.textContent = collegeName;
      els.medicalCollege.appendChild(opt);
    });

    els.medicalCollege.disabled = false;
    els.collegeHint.classList.add("hidden");
  }

  function populateAdmissionYears() {
    const years = Object.keys(ACADEMIC_PROGRESSION_RULES)
      .map(Number)
      .sort((a, b) => b - a); // Most recent admission year first

    years.forEach((year) => {
      const opt = document.createElement("option");
      opt.value = String(year);
      opt.textContent = String(year);
      els.admissionYear.appendChild(opt);
    });
  }

  function updateProfessionalYearOptions(selectedAdmissionYear) {
    const allowedYears = getAllowedProfessionalYears(selectedAdmissionYear);
    els.professionalYear.innerHTML = "";

    if (allowedYears.length === 0) {
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "Select admission year first";
      placeholder.selected = true;
      placeholder.disabled = true;
      els.professionalYear.appendChild(placeholder);
      els.professionalYear.disabled = true;
      return;
    }

    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.textContent = "Select current professional year";
    defaultOpt.selected = true;
    defaultOpt.disabled = true;
    els.professionalYear.appendChild(defaultOpt);

    allowedYears.forEach((profYearLabel) => {
      const opt = document.createElement("option");
      opt.value = profYearLabel;
      opt.textContent = profYearLabel;
      els.professionalYear.appendChild(opt);
    });

    els.professionalYear.disabled = false;
  }

  /* ========================================================================
     6. AUTHENTICATION & EXISTING PROFILE CHECK
     ======================================================================== */

  async function initializePage() {
    try {
      // 1. Verify active Supabase session
      const { data: sessionData, error: sessionError } =
        await supabaseClient.auth.getSession();

      if (sessionError || !sessionData || !sessionData.session || !sessionData.session.user) {
        window.location.replace("/auth.html");
        return;
      }

      // Re-verify user with Supabase Auth server
      const { data: userData, error: userError } = await supabaseClient.auth.getUser();
      if (userError || !userData || !userData.user) {
        window.location.replace("/auth.html");
        return;
      }

      authenticatedUser = userData.user;

      // 2. Check if user already has a completed profile to prevent duplicate creation
      const { data: existingProfile, error: profileError } = await supabaseClient
        .from("profiles")
        .select("id, registration_completed, student_name")
        .eq("id", authenticatedUser.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error checking existing profile:", profileError);
        // Do not expose raw SQL/RLS details; allow safe fallback or alert user
      }

      if (existingProfile && existingProfile.registration_completed === true) {
        window.location.replace("/dashboard.html");
        return;
      }

      // Pre-fill full name from Google OAuth metadata if available (editable by student)
      const googleFullName =
        authenticatedUser.user_metadata?.full_name ||
        authenticatedUser.user_metadata?.name ||
        "";
      if (googleFullName && !els.studentName.value) {
        els.studentName.value = googleFullName;
      }

      // 3. Populate dropdowns & reveal form
      populateMedicalColleges();
      populateAdmissionYears();

      els.authLoadingCard.classList.add("hidden");
      els.registrationContent.classList.remove("hidden");
    } catch (err) {
      console.error("Initialization error:", err);
      window.location.replace("/auth.html");
    }
  }

  /* ========================================================================
     7. FORM SUBMISSION HANDLER
     ======================================================================== */

  async function handleFormSubmit(event) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    clearBanner();
    clearFieldErrors();

    // Collect raw values from DOM
    const rawPayload = {
      student_name: els.studentName.value,
      medical_college: els.medicalCollege.value,
      admission_year: els.admissionYear.value,
      professional_year: els.professionalYear.value,
      age: els.studentAge.value,
      gender: els.studentGender.value
    };

    // Run full client-side validation (including tampered-value protection)
    const validationResult = validateRegistrationPayload(rawPayload);

    if (!validationResult.isValid) {
      renderFieldErrors(validationResult.errors);
      showBanner("error", "Please review and correct the highlighted fields below.");
      return;
    }

    setSubmittingState(true);

    try {
      // Re-verify authenticated session immediately before writing
      const { data: authCheck, error: authCheckError } =
        await supabaseClient.auth.getUser();

      if (authCheckError || !authCheck || !authCheck.user) {
        window.location.replace("/auth.html");
        return;
      }

      const verifiedUserId = authCheck.user.id;

      // Re-check profile completion status to prevent duplicate submissions across tabs
      const { data: currentProfile, error: checkError } = await supabaseClient
        .from("profiles")
        .select("id, registration_completed")
        .eq("id", verifiedUserId)
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      if (currentProfile && currentProfile.registration_completed === true) {
        window.location.replace("/dashboard.html");
        return;
      }

      // Prepare exact row matching public.profiles schema
      const profileRecord = {
        id: verifiedUserId,
        student_name: validationResult.sanitizedData.student_name,
        medical_college: validationResult.sanitizedData.medical_college,
        admission_year: validationResult.sanitizedData.admission_year,
        professional_year: validationResult.sanitizedData.professional_year,
        age: validationResult.sanitizedData.age,
        gender: validationResult.sanitizedData.gender,
        registration_completed: true,
        updated_at: new Date().toISOString()
      };

      // If an incomplete profile row already exists (e.g., created by an auth trigger),
      // update it; otherwise insert a new row.
      let dbError = null;

      if (currentProfile && currentProfile.id === verifiedUserId) {
        const { error } = await supabaseClient
          .from("profiles")
          .update({
            student_name: profileRecord.student_name,
            medical_college: profileRecord.medical_college,
            admission_year: profileRecord.admission_year,
            professional_year: profileRecord.professional_year,
            age: profileRecord.age,
            gender: profileRecord.gender,
            registration_completed: true,
            updated_at: profileRecord.updated_at
          })
          .eq("id", verifiedUserId);
        dbError = error;
      } else {
        const { error } = await supabaseClient
          .from("profiles")
          .insert([profileRecord]);
        dbError = error;
      }

      if (dbError) {
        throw dbError;
      }

      showBanner("success", "Registration completed! Redirecting to your dashboard...");
      window.location.replace("/dashboard.html");
    } catch (err) {
      console.error("Profile save failed:", err);
      showBanner(
        "error",
        "We could not save your registration right now. Please check your connection and try again."
      );
      setSubmittingState(false);
    }
  }

  /* ========================================================================
     8. EVENT LISTENERS
     ======================================================================== */

  els.admissionYear.addEventListener("change", function () {
    clearFieldErrors();
    clearBanner();
    updateProfessionalYearOptions(els.admissionYear.value);
  });

  els.professionalYear.addEventListener("change", function () {
    const check = validateAcademicProgression(
      els.admissionYear.value,
      els.professionalYear.value
    );
    if (!check.valid) {
      renderFieldErrors({ [check.field]: check.message });
    } else {
      clearFieldErrors();
    }
  });

  els.form.addEventListener("submit", handleFormSubmit);

  // Listen for sign-out events in other tabs
  supabaseClient.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
      window.location.replace("/auth.html");
    }
  });

  // Boot
  document.addEventListener("DOMContentLoaded", initializePage);
})();