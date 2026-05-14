export function initScrollAnimations(): void {
    const targets = document.querySelectorAll('[data-animate]');

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target as HTMLElement;
                    const delay = el.dataset.animateDelay ?? '0';
                    el.style.transitionDelay = `${delay}ms`;
                    el.classList.add('animate--in');
                    observer.unobserve(el);
                }
            });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach((el) => observer.observe(el));
}