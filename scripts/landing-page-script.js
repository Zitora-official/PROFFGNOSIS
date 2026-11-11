document.addEventListener('DOMContentLoaded', () => {
    // Initialize Telegram Mini App safely
    const tg = window.Telegram && window.Telegram.WebApp;

    if (tg) {
        tg.ready();

        const syncViewportHeight = () => {
            const height = Number(tg.viewportStableHeight);

            if (height > 0) {
                document.documentElement.style.setProperty(
                    '--app-viewport-height',
                    height + 'px'
                );
            }
        };

        syncViewportHeight();

        if (typeof tg.expand === 'function') {
            tg.expand();
        }

        // Request fullscreen only where supported
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

        // Request both device and Telegram UI safe areas
        if (typeof tg.requestSafeArea === 'function') {
            tg.requestSafeArea();
        }

        if (typeof tg.requestContentSafeArea === 'function') {
            tg.requestContentSafeArea();
        }

        if (typeof tg.setHeaderColor === 'function') {
            tg.setHeaderColor('#F2F4F8');
        }

        if (typeof tg.setBackgroundColor === 'function') {
            tg.setBackgroundColor('#F2F4F8');
        }

        if (typeof tg.onEvent === 'function') {
            tg.onEvent('viewportChanged', (event) => {
                if (!event || event.isStateStable) {
                    syncViewportHeight();
                }
            });
        }
    }
    

    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 120 + index * 90);
    });

    const primaryBtn = document.getElementById('getStartedBtn');
    const secondaryBtn = document.getElementById('exploreBtn');

    if (primaryBtn) {
        primaryBtn.addEventListener('click', () => {
            primaryBtn.style.transform = 'scale(0.96)';
            setTimeout(() => {
                primaryBtn.style.transform = 'scale(1)';
            }, 150);
        });
    }

    if (secondaryBtn) {
        secondaryBtn.addEventListener('click', () => {
            secondaryBtn.style.transform = 'scale(0.96)';
            setTimeout(() => {
                secondaryBtn.style.transform = 'scale(1)';
            }, 150);
        });
    }
});