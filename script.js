// Basic interactions for the new finance landing page
document.addEventListener('DOMContentLoaded', () => {
    // Smooth hover effects for buttons
    const buttons = document.querySelectorAll('.nav-cta, .primary-cta');
    buttons.forEach(btn => {
        btn.addEventListener('mousedown', () => btn.style.transform = 'scale(0.98)');
        btn.addEventListener('mouseup', () => btn.style.transform = 'scale(1)');
        btn.addEventListener('mouseleave', () => btn.style.transform = 'scale(1)');
    });

    // iPad 3D Scroll Animation (Vanilla JS implementation of Framer Motion effect)
    const ipad = document.getElementById('hero-ipad');
    if (ipad) {
        // Complete the animation over the first 600px of scrolling
        const animationDistance = 600;

        window.addEventListener('scroll', () => {
            let scrollY = window.scrollY;
            if (scrollY > animationDistance) scrollY = animationDistance;

            // Progress from 0 to 1
            const progress = scrollY / animationDistance;

            const isMobile = window.innerWidth <= 768;

            // React dimensions: isMobile ? [0.7, 0.9] : [1.05, 1];
            const startScale = isMobile ? 0.7 : 1.05;
            const endScale = isMobile ? 0.9 : 1;
            const currentScale = startScale + (progress * (endScale - startScale));

            // React rotation: rotateX from 20 to 0
            const currentRotate = 20 - (progress * 20);

            // Apply transform (adding a slight translateY to compensate for the perspective shift if needed, but sticking to exact React rotate/scale first)
            ipad.style.transform = `rotateX(${currentRotate}deg) scale(${currentScale})`;
        });

        // Trigger once to set initial state if page is loaded already scrolled
        window.dispatchEvent(new Event('scroll'));
    }

    // Accordion Logic
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;

            // Optional: Close all other accordion items (uncomment if desired)
            // document.querySelectorAll('.accordion-item').forEach(otherItem => {
            //     if (otherItem !== item) {
            //         otherItem.classList.remove('active');
            //     }
            // });

            item.classList.toggle('active');
        });
    });
});
