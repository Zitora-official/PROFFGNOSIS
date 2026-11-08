document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(12px)';
        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease, box-shadow 0.2s ease';

        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 150 + index * 100);
    });

    const primaryBtn = document.getElementById('getStartedBtn');
    const secondaryBtn = document.getElementById('exploreBtn');

    primaryBtn.addEventListener('click', () => {
        primaryBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            primaryBtn.style.transform = 'scale(1)';
        }, 150);
    });

    secondaryBtn.addEventListener('click', () => {
        secondaryBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            secondaryBtn.style.transform = 'scale(1)';
        }, 150);
    });
});