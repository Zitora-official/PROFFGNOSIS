document.addEventListener('DOMContentLoaded', () => {
    const counterElement = document.getElementById('accuracy-counter');
    const targetValue = 98.4;
    const duration = 1500;
    const steps = 60;
    const stepTime = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const currentValue = (targetValue * progress).toFixed(1);
        counterElement.textContent = `${currentValue}%`;

        if (currentStep >= steps) {
            clearInterval(timer);
            counterElement.textContent = `${targetValue}%`;
        }
    }, stepTime);

    const primaryBtn = document.getElementById('getStartedBtn');
    primaryBtn.addEventListener('click', () => {
        primaryBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            primaryBtn.style.transform = 'scale(1)';
        }, 150);
    });
});