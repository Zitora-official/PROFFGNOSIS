document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(18px)';
        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 + index * 80);
    });

    const primaryBtn = document.getElementById('getStartedBtn');
    const secondaryBtn = document.getElementById('exploreBtn');

    primaryBtn.addEventListener('click', () => {
        primaryBtn.style.transform = 'scale(0.96)';
        setTimeout(() => {
            primaryBtn.style.transform = 'scale(1)';
        }, 150);
    });

    secondaryBtn.addEventListener('click', () => {
        secondaryBtn.style.transform = 'scale(0.96)';
        setTimeout(() => {
            secondaryBtn.style.transform = 'scale(1)';
        }, 150);
    });
});