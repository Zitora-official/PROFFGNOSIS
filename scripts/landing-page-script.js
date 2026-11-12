document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Telegram Mini App safely (Preserved integration)
    const tg = window.Telegram && window.Telegram.WebApp;

    if (tg) {
        tg.ready();

        if (typeof tg.expand === 'function') {
            tg.expand();
        }

        if (typeof tg.requestFullscreen === 'function') {
            try {
                const request = tg.requestFullscreen();
                if (request && typeof request.catch === 'function') {
                    request.catch(() => {});
                }
            } catch (error) {
                // Continue normally if fullscreen is unavailable
            }
        }

        if (typeof tg.requestSafeArea === 'function') {
            tg.requestSafeArea();
        }

        if (typeof tg.requestContentSafeArea === 'function') {
            tg.requestContentSafeArea();
        }

        if (typeof tg.setHeaderColor === 'function') {
            tg.setHeaderColor('#FAFAFA');
        }

        if (typeof tg.setBackgroundColor === 'function') {
            tg.setBackgroundColor('#FAFAFA');
        }
    }

    // 2. Sticky Header Elevation on Scroll
    const siteHeader = document.getElementById('siteHeader');
    const handleHeaderScroll = () => {
        if (!siteHeader) return;
        if (window.scrollY > 12) {
            siteHeader.classList.add('is-scrolled');
        } else {
            siteHeader.classList.remove('is-scrolled');
        }
    };
    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll();

    // 3. Mobile Navigation Drawer
    const menuToggle = document.getElementById('mobileMenuToggle');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    const closeMobileMenu = () => {
        if (!menuToggle || !mobileDrawer) return;
        menuToggle.setAttribute('aria-expanded', 'false');
        mobileDrawer.setAttribute('aria-hidden', 'true');
        mobileDrawer.classList.remove('is-open');
        document.body.style.overflow = '';
    };

    const toggleMobileMenu = () => {
        if (!menuToggle || !mobileDrawer) return;
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
            closeMobileMenu();
        } else {
            menuToggle.setAttribute('aria-expanded', 'true');
            mobileDrawer.setAttribute('aria-hidden', 'false');
            mobileDrawer.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        }
    };

    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMobileMenu);
    }

    mobileLinks.forEach((link) => {
        link.addEventListener('click', closeMobileMenu);
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 960) {
            closeMobileMenu();
        }
    });

    // 4. Interactive Proff Curriculum Preview in Hero (Updated with precise NMC CBME subjects)
    const proffData = {
        '1': {
            phase: '1st Professional Year',
            title: 'Pre-Clinical Foundation',
            prompt: 'Ready to clarify mechanisms, high-yield topics, and 1st Proff concepts.',
            subjects: [
                { name: 'Anatomy', meta: 'Authentic Source Indexed' },
                { name: 'Physiology', meta: 'Concept & Proff Ready' },
                { name: 'Biochemistry', meta: 'Structured Revision' }
            ]
        },
        '2': {
            phase: '2nd Professional Year',
            title: 'Para-Clinical Core',
            prompt: 'Ask SHIVOID to break down mechanisms of action or systemic pathology.',
            subjects: [
                { name: 'Pathology', meta: 'Morphology & Mechanisms' },
                { name: 'Pharmacology', meta: 'Authentic Source Indexed' },
                { name: 'Microbiology', meta: 'Clinical Correlation' }
            ]
        },
        '3': {
            phase: '3rd Professional Year (Part-I)',
            title: 'Clinical Transition & Diagnostics',
            prompt: 'Forensic Medicine exam is now in 3rd Proff Part-I under NMC CBME guidelines.',
            subjects: [
                { name: 'Community Medicine', meta: 'Epidemiology & Biostatistics' },
                { name: 'Forensic Medicine & Toxicology', meta: 'NMC CBME Part-I Exam' },
                { name: 'Ophthalmology', meta: 'Proff Focused' },
                { name: 'ENT (Otorhinolaryngology)', meta: 'Surgical & Clinical' }
            ]
        },
        '4': {
            phase: '3rd Professional Year (Part-II)',
            title: 'Final Clinical Disciplines',
            prompt: 'Synthesize clinical management, allied specialties, and diagnostic reasoning.',
            subjects: [
                { name: 'General Medicine', meta: 'Inc. Derm, Psych, Resp' },
                { name: 'General Surgery', meta: 'Inc. Ortho, Anesth, Radio' },
                { name: 'Obstetrics & Gynaecology (OBG)', meta: 'Comprehensive Proff Prep' },
                { name: 'Pediatrics', meta: 'Neonatology & Growth' }
            ]
        }
    };

    const proffTabs = document.querySelectorAll('.proff-tab');
    const proffDisplay = document.getElementById('proffDisplay');
    const proffPhase = document.getElementById('proffPhase');
    const proffTitle = document.getElementById('proffTitle');
    const proffSubjects = document.getElementById('proffSubjects');
    const shivoidLivePrompt = document.getElementById('shivoidLivePrompt');

    proffTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const selectedProff = tab.getAttribute('data-proff');
            const data = proffData[selectedProff];
            if (!data || tab.classList.contains('active')) return;

            proffTabs.forEach((t) => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });

            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            if (proffDisplay) {
                proffDisplay.classList.add('is-updating');
            }

            setTimeout(() => {
                if (proffPhase) proffPhase.textContent = data.phase;
                if (proffTitle) proffTitle.textContent = data.title;
                if (shivoidLivePrompt) shivoidLivePrompt.textContent = data.prompt;

                if (proffSubjects) {
                    proffSubjects.innerHTML = data.subjects
                        .map(
                            (subj) => `
                            <div class="subject-row">
                                <span class="subject-name">${subj.name}</span>
                                <span class="subject-meta">${subj.meta}</span>
                            </div>
                        `
                        )
                        .join('');
                }

                if (proffDisplay) {
                    proffDisplay.classList.remove('is-updating');
                }
            }, 140);
        });
    });

    // 5. Subtle Scroll-Triggered Reveals (Respects prefers-reduced-motion)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealElements = document.querySelectorAll('.reveal');

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        revealElements.forEach((el) => el.classList.add('is-visible'));
    } else {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.12,
                rootMargin: '0px 0px -32px 0px'
            }
        );

        revealElements.forEach((el) => revealObserver.observe(el));
    }
});