document.addEventListener('DOMContentLoaded', () => {
    // Add subtle hover effects or interactions
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.addEventListener('mousedown', () => {
            btn.style.transform = 'scale(0.98)';
        });
        btn.addEventListener('mouseup', () => {
            btn.style.transform = '';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });

    // Optional subtle parallax on image container
    const heroImg = document.querySelector('.hero-image-container');
    document.addEventListener('mousemove', (e) => {
        if (!heroImg) return;
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        heroImg.style.transform = `translateY(-50%) translate(${x}px, ${y}px)`;
    });
});
