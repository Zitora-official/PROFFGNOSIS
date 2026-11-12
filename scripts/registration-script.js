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
     2. CONFIGURABLE ACADEMIC & INSTITUTION RULES (NMC CBME 2024 Reference)
     ======================================================================== */

  /**
   * VERIFIED_MEDICAL_COLLEGES:
   * Officially verified ABVMU-affiliated Government and Private MBBS colleges in Uttar Pradesh.
   */
  const VERIFIED_MEDICAL_COLLEGES = Object.freeze([
    "Autonomous State Medical College, Firozabad",
    "Rajarshi Dashrath Autonomous State Medical College, Ayodhya",
    "Maharshi Vashishtha Autonomous State Medical College, Basti",
    "Maharaja Suhel Dev Autonomous State Medical College, Bahraich",
    "Pt. Ram Prasad Bismil Autonomous State Medical College, Shahjahanpur",
    "Veerangana Avanti Bai Lodhi Autonomous State Medical College, Etah",
    "Autonomous State Medical College, Hardoi",
    "Dr. Sone Lal Patel Autonomous State Medical College, Pratapgarh",
    "Madhav Prasad Tripathi Autonomous State Medical College, Siddharthnagar",
    "Maharshi Devraha Baba Autonomous State Medical College, Deoria",
    "Autonomous State Medical College, Ghazipur",
    "Uma Nath Singh Autonomous State Medical College, Jaunpur",
    "Autonomous State Medical College, Mirzapur",
    "Amar Shaheed Jodha Singh Attaiya Thakur Dariyao Singh Medical College, Fatehpur",
    "Autonomous State Medical College, Sultanpur",
    "Autonomous State Medical College, Kushinagar",
    "Autonomous State Medical College, Lalitpur",
    "Autonomous State Medical College, Pilibhit",
    "Kalyan Singh Government Medical College, Bulandshahr",
    "Mahatma Vidur Autonomous State Medical College, Bijnor",
    "Baba Kina Ram Autonomous State Medical College and Hospital, Chandauli",
    "Autonomous State Medical College and Hospital, Kaushambi",
    "Autonomous State Medical College, Sonebhadra",
    "Autonomous State Medical College and Hospital, Auraiya",
    "Autonomous State Medical College and Hospital, Gonda",
    "Autonomous State Medical College and Hospital, Lakhimpur Kheri",
    "Autonomous State Medical College, Amethi",
    "Autonomous State Medical College, Kanpur Dehat",
    "ESIC Medical College and Hospital, Noida",
    "ESIC Medical College and Hospital, Varanasi",
    "Ajay Sangaal Institute of Medical Sciences and Ayushman Hospital, Shamli",
    "Dr. B.S. Kushwah Institute of Medical Sciences, Kanpur",
    "Naraina Medical College & Research Centre, Kanpur",
    "KMC Medical College & Hospital, Maharajganj",
    "Shri Siddhi Vinayak Medical College & Hospital, Sambhal"
  ]);

  /**
   * Configurable academic session start month (October = 10).
   * Used as the baseline for dynamic academic progression calculations.
   */
  const ACADEMIC_SESSION_START_MONTH = 10;

  /**
   * Exact student-facing MBBS Professional Year options in required order:
   */
  const PROFESSIONAL_YEARS = Object.freeze([
    "First Professional — 1 year",
    "Second Professional — 1 year",
    "Third Professional — 1 year",
    "Final Professional — 1.5 years",
    "Compulsory Rotating Medical Internship (CRMI) — 1 year"
  ]);

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

  /* ========================================================================
     3. DYNAMIC ACADEMIC PROGRESSION CALCULATION & VALIDATION
     ======================================================================== */

  /**
   * Dynamically calculates the expected professional phase based on:
   * - Admission year selected by the student
   * - Configurable academic session start month (October 1 baseline)
   * - Current date and NMC CBME phase durations
   */
  function calculateExpectedProfessionalYear(admissionYear) {
    const parsedAdmissionYear = Number(admissionYear);
    if (!Number.isInteger(parsedAdmissionYear)) {
      return null;
    }

    const now = new Date();
    const startDate = new Date(parsedAdmissionYear, ACADEMIC_SESSION_START_MONTH - 1, 1);

    let elapsedMonths = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
    if (now.getDate() < startDate.getDate()) {
      elapsedMonths--;
    }
    if (elapsedMonths < 0) {
      elapsedMonths = 0;
    }

    if (elapsedMonths <= 11) {
      return PROFESSIONAL_YEARS[0]; // First Professional
    } else if (elapsedMonths <= 23) {
      return PROFESSIONAL_YEARS[1]; // Second Professional
    } else if (elapsedMonths <= 35) {
      return PROFESSIONAL_YEARS[2]; // Third Professional
    } else if (elapsedMonths <= 53) {
      return PROFESSIONAL_YEARS[3]; // Final Professional
    } else {
      return PROFESSIONAL_YEARS[4]; // Compulsory Rotating Medical Internship (CRMI)
    }
  }

  /**
   * Dedicated validator for Admission Year + Current MBBS Professional Year.
   */
  function validateAcademicProgression(admissionYearInput, professionalYearInput) {
    const admissionYear = Number(admissionYearInput);
    const currentYear = new Date().getFullYear();

    if (
      !admissionYearInput ||
      !Number.isInteger(admissionYear) ||
      admissionYear < currentYear - 7 ||
      admissionYear > currentYear
    ) {
      return {
        valid: false,
        field: "admission_year",
        message: "Please select a valid MBBS admission year."
      };
    }

    if (!professionalYearInput || !PROFESSIONAL_YEARS.includes(professionalYearInput)) {
      return {
        valid: false,
        field: "professional_year",
        message: "Please select a valid MBBS professional year."
      };
    }

    const expectedStage = calculateExpectedProfessionalYear(admissionYear);

    if (professionalYearInput !== expectedStage) {
      return {
        valid: false,
        field: "professional_year",
        message: `Selected professional year does not match your calculated academic progression for batch ${admissionYear}. If you have a repeat year or academic delay, please contact admin verification.`
      };
    }

    return { valid: true };
  }

  /**
   * Validates the selected medical college against the configured allowlist.
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

    const cleanName = typeof rawInput.student_name === "string"
      ? rawInput.student_name.trim().replace(/\s+/g, " ")
      : "";

    if (!cleanName) {
      errors.student_name = "Please enter your full name.";
    } else if (cleanName.length < 2 || cleanName.length > 120) {
      errors.student_name = "Full name must be between 2 and 120 characters.";
    }

    const collegeCheck = validateMedicalCollege(rawInput.medical_college);
    if (!collegeCheck.valid) {
      errors.medical_college = collegeCheck.message;
    }

    const progressionCheck = validateAcademicProgression(
      rawInput.admission_year,
      rawInput.professional_year
    );
    if (!progressionCheck.valid) {
      errors[progressionCheck.field] = progressionCheck.message;
    }

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

    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = "ABVMU-affiliated colleges have been added yet.";
    placeholderOption.selected = true;
    placeholderOption.disabled = true;
    els.medicalCollege.appendChild(placeholderOption);

    if (VERIFIED_MEDICAL_COLLEGES.length === 0) {
      els.medicalCollege.disabled = true;
      if (els.collegeHint) {
        els.collegeHint.classList.remove("hidden");
      }
      return;
    }

    VERIFIED_MEDICAL_COLLEGES.forEach((collegeName) => {
      const opt = document.createElement("option");
      opt.value = collegeName;
      opt.textContent = collegeName;
      els.medicalCollege.appendChild(opt);
    });

    els.medicalCollege.disabled = false;
    if (els.collegeHint) {
      els.collegeHint.classList.add("hidden");
    }
  }

  function populateAdmissionYears() {
    els.admissionYear.innerHTML = "";
    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.textContent = "Select your MBBS admission year";
    defaultOpt.selected = true;
    defaultOpt.disabled = true;
    els.admissionYear.appendChild(defaultOpt);

    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - 7; year--) {
      const opt = document.createElement("option");
      opt.value = String(year);
      opt.textContent = String(year);
      els.admissionYear.appendChild(opt);
    }
  }

  function updateProfessionalYearOptions(selectedAdmissionYear) {
    els.professionalYear.innerHTML = "";

    if (!selectedAdmissionYear) {
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

    PROFESSIONAL_YEARS.forEach((profYearLabel) => {
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
      const { data: sessionData, error: sessionError } =
        await supabaseClient.auth.getSession();

      if (sessionError || !sessionData || !sessionData.session || !sessionData.session.user) {
        window.location.replace("/auth.html");
        return;
      }

      const { data: userData, error: userError } = await supabaseClient.auth.getUser();
      if (userError || !userData || !userData.user) {
        window.location.replace("/auth.html");
        return;
      }

      authenticatedUser = userData.user;

      const { data: existingProfile, error: profileError } = await supabaseClient
        .from("profiles")
        .select("id, registration_completed, student_name")
        .eq("id", authenticatedUser.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error checking existing profile:", profileError);
      }

      if (existingProfile && existingProfile.registration_completed === true) {
        window.location.replace("/dashboard.html");
        return;
      }

      const googleFullName =
        authenticatedUser.user_metadata?.full_name ||
        authenticatedUser.user_metadata?.name ||
        "";
      if (googleFullName && !els.studentName.value) {
        els.studentName.value = googleFullName;
      }

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

    const rawPayload = {
      student_name: els.studentName.value,
      medical_college: els.medicalCollege.value,
      admission_year: els.admissionYear.value,
      professional_year: els.professionalYear.value,
      age: els.studentAge.value,
      gender: els.studentGender.value
    };

    const validationResult = validateRegistrationPayload(rawPayload);

    if (!validationResult.isValid) {
      renderFieldErrors(validationResult.errors);
      showBanner("error", "Please review and correct the highlighted fields below.");
      return;
    }

    setSubmittingState(true);

    try {
      const { data: authCheck, error: authCheckError } =
        await supabaseClient.auth.getUser();

      if (authCheckError || !authCheck || !authCheck.user) {
        window.location.replace("/auth.html");
        return;
      }

      const verifiedUserId = authCheck.user.id;

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

  supabaseClient.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
      window.location.replace("/auth.html");
    }
  });

  document.addEventListener("DOMContentLoaded", initializePage);
})();