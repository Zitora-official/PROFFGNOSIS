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

    // 4. Subtle Scroll-Triggered Reveals (Respects prefers-reduced-motion)
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