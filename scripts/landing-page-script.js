document.addEventListener('DOMContentLoaded', () => {
    // Initialize Telegram Web App safely
    const tg = window.Telegram.WebApp;
    if (tg) {
        tg.ready();

        // 1. Force screen expansion
        if (typeof tg.expand === 'function') {
            tg.expand();
        }
        if (typeof tg.requestFullscreen === 'function') {
            tg.requestFullscreen();
        }

        // 2. Set Telegram header and background color to match light design (#F2F4F8)
        if (typeof tg.setHeaderColor === 'function') {
            tg.setHeaderColor('#F2F4F8');
        }
        if (typeof tg.setBackgroundColor === 'function') {
            tg.setBackgroundColor('#F2F4F8');
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