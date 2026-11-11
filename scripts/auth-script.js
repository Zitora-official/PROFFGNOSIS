/**
 * PROFFGNOSIS Authentication Controller
 * Pure Vanilla JS logic for Supabase OAuth, Telegram WebApp & SHIVOID AI Assistant
 */

(function () {
    'use strict';

    // -------------------------------------------------------------------------
    // 1. SUPABASE CONFIGURATION PLACEHOLDERS
    // Replace these values with your actual project keys during deployment
    // -------------------------------------------------------------------------
    const SUPABASE_URL = "https://spwghoursvkbjpvxerlr.supabase.co/";
    const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_E8QPlpZqDBlT7nSF-Q2pLg_OzfLcw30";

    let supabaseClient = null;

    // Initialize Supabase Client if SDK is loaded & placeholders updated
    function initSupabase() {
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            if (SUPABASE_URL !== "YOUR_SUPABASE_PROJECT_URL" && SUPABASE_PUBLISHABLE_KEY !== "YOUR_SUPABASE_PUBLISHABLE_KEY") {
                supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
            } else {
                console.warn("[PROFFGNOSIS Auth] Supabase configuration placeholders detected. Real OAuth calls will require active credentials.");
            }
        } else {
            console.error("[PROFFGNOSIS Auth] Supabase JS v2 CDN library is not available.");
        }
    }

    // -------------------------------------------------------------------------
    // 2. SHIVOID AI ASSISTANT MESSAGES COLLECTION
    // -------------------------------------------------------------------------
    const shivoidMessage = "Hello Doctor, I'm SHIVOID, your personal AI study companion. Let's get you logged in.";

    function setShivoidMessage() {
        const messageElement = document.getElementById('shivoidMessageText');

        if (messageElement) {
            messageElement.textContent = shivoidMessage;
        }
    }

    // -------------------------------------------------------------------------
    // 3. TELEGRAM MINI APP ENVIRONMENT HANDLING
    // -------------------------------------------------------------------------
    function initTelegramMiniApp() {
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            try {
                // Signal ready state & expand viewport
                tg.ready();
                tg.expand();
                
                // Adjust body background color to match Telegram theme if applicable
                if (tg.backgroundColor) {
                    document.body.style.backgroundColor = tg.backgroundColor;
                }
            } catch (err) {
                console.warn("[PROFFGNOSIS Auth] Telegram WebApp expansion warning:", err);
            }
        }
    }

    // -------------------------------------------------------------------------
    // 4. EXISTING SESSION CHECK (PENDING PROFILE PROFILE LOOKUP Integration)
    // -------------------------------------------------------------------------
    async function checkExistingSession() {
        if (!supabaseClient) return;

        try {
            const { data: { session }, error } = await supabaseClient.auth.getSession();
            if (error) throw error;

            if (session) {
                showNotification("Existing session found. Verifying profile...", "info");
                
                /*
                   PROFILE LOOKUP INTEGRATION (PENDING PROFILE TABLE IMPLEMENTATION):
                   When the 'profiles' database table is created:
                   1. Query table: const { data: profile } = await supabaseClient.from('profiles').select('*').eq('id', session.user.id).single();
                   2. If profile complete -> window.location.href = '/dashboard.html';
                   3. If incomplete -> window.location.href = '/onboarding.html';
                */
                console.log("[PROFFGNOSIS Auth] User authenticated:", session.user.email);
            }
        } catch (err) {
            console.error("[PROFFGNOSIS Auth] Session check error:", err.message);
        }
    }

    // -------------------------------------------------------------------------
    // 5. GOOGLE OAUTH AUTHENTICATION HANDLER
    // -------------------------------------------------------------------------
    async function handleGoogleSignIn() {
        const btnGoogle = document.getElementById('btnGoogleAuth');
        const btnText = document.getElementById('btnGoogleText');
        const btnSpinner = document.getElementById('btnGoogleSpinner');

        // Prevent multiple simultaneous clicks
        if (btnGoogle.disabled) return;

        // Set Loading State UI
        setLoadingState(true, btnGoogle, btnText, btnSpinner);
        clearNotification();

        try {
            if (!supabaseClient) {
                // Fallback simulation for demonstration when credentials are placeholders
                setTimeout(() => {
                    showNotification("Demo Mode: Please replace SUPABASE_URL & PUBLISHABLE_KEY in scripts/auth-script.js to execute live OAuth.", "info");
                    setLoadingState(false, btnGoogle, btnText, btnSpinner);
                }, 1200);
                return;
            }

            const redirectUrl = window.location.origin + '/auth.html';

            const { data, error } = await supabaseClient.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl
                }
            });

            if (error) {
                throw error;
            }

            // Redirect is initiated automatically by Supabase OAuth
        } catch (err) {
            console.error("[PROFFGNOSIS Auth] Google OAuth Error:", err);
            showNotification(err.message || "Failed to connect to Google authentication. Please try again.", "error");
            setLoadingState(false, btnGoogle, btnText, btnSpinner);
        }
    }

    // Helper: UI Loading State Manager
    function setLoadingState(isLoading, button, textEl, spinnerEl) {
        if (isLoading) {
            button.disabled = true;
            textEl.textContent = "Connecting securely...";
            spinnerEl.classList.remove('hidden');
        } else {
            button.disabled = false;
            textEl.textContent = "Continue with Google";
            spinnerEl.classList.add('hidden');
        }
    }

    // Helper: Notification / Toast Feedback
    function showNotification(message, type = "info") {
        const notifContainer = document.getElementById('authNotification');
        if (notifContainer) {
            notifContainer.textContent = message;
            notifContainer.className = `auth-notification ${type}`;
        }
    }

    function clearNotification() {
        const notifContainer = document.getElementById('authNotification');
        if (notifContainer) {
            notifContainer.textContent = "";
            notifContainer.className = "auth-notification hidden";
        }
    }

    // -------------------------------------------------------------------------
    // 6. INITIALIZATION & EVENT LISTENERS
    // -------------------------------------------------------------------------
    document.addEventListener('DOMContentLoaded', () => {
        // Initialize Core Features
        initSupabase();
        setShivoidMessage();
        initTelegramMiniApp();
        checkExistingSession();

        // Bind Google Auth Button Listener
        const btnGoogle = document.getElementById('btnGoogleAuth');
        if (btnGoogle) {
            btnGoogle.addEventListener('click', handleGoogleSignIn);
        }
    });

})();