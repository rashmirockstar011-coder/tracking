import confetti from 'canvas-confetti';

/**
 * Trigger confetti burst animation
 * Used for promise fulfillment celebrations
 */
export const triggerConfetti = () => {
    const count = 200;
    const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999
    };

    function fire(particleRatio, opts) {
        confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
        });
    }

    // Multi-burst effect
    fire(0.25, {
        spread: 26,
        startVelocity: 55,
    });
    fire(0.2, {
        spread: 60,
    });
    fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 45,
    });
};

/**
 * Trigger heart rain animation
 * Used when credit balance reaches zero
 */
export const triggerHeartRain = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 9999,
        colors: ['#f472b6', '#c084fc', '#fb7185', '#e879f9']
    };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Hearts falling from random positions
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            shapes: ['circle'],
            scalar: randomInRange(0.8, 1.2),
        });
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            shapes: ['circle'],
            scalar: randomInRange(0.8, 1.2),
        });
    }, 250);
};

/**
 * Subtle celebration for smaller wins
 */
export const triggerSparkles = () => {
    confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f472b6', '#c084fc', '#fbbf24'],
        zIndex: 9999,
        scalar: 0.8,
    });
};
