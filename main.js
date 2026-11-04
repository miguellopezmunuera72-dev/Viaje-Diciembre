(() => {
    'use strict';

    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

    /* ---------- Vídeos: solo reproduce el que está en pantalla ---------- */
    function initVideoPlayback() {
        const videos = $$('video');

        if (!('IntersectionObserver' in window)) {
            videos.forEach((v) => v.play().catch(() => {}));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(({ target, isIntersecting }) => {
                if (isIntersecting) {
                    if (target.preload === 'none') target.preload = 'auto';
                    target.play().catch(() => {}); // el navegador puede bloquear autoplay
                } else {
                    target.pause();
                }
            });
        }, { rootMargin: '25% 0px', threshold: 0.01 });

        videos.forEach((v) => observer.observe(v));
    }

    /* ---------- Hero: botón de arranque ---------- */
    function initHero(timeline) {
        const btn = $('#start-btn');
        const subtitle = $('#hero-subtitle');
        const trigger = $('#start-trigger');
        const car = $('#car');

        const unlock = () => {
            btn.disabled = true;
            document.body.classList.remove('is-locked');

            gsap.to(trigger, {
                opacity: 0,
                duration: 0.5,
                onComplete: () => { trigger.style.display = 'none'; }
            });

            gsap.to(car, {
                y: -8,
                duration: 0.1,
                repeat: 5,
                yoyo: true,
                onComplete: () => { subtitle.textContent = 'Desliza para comenzar ↓'; }
            });
        };

        btn.addEventListener('click', unlock, { once: true });
        timeline.unlock = unlock;
    }

    /* ---------- Animaciones de scroll ---------- */
    function animateHero() {
        gsap.to('#car', {
            x: '150vw',
            scale: 0.9,
            opacity: 0.8,
            ease: 'none',
            scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
        });

        gsap.to('#hero-bg, #hero-text', {
            opacity: 0,
            y: -50,
            ease: 'none',
            scrollTrigger: { trigger: '#hero', start: 'top top', end: '60% top', scrub: true }
        });
    }

    function animateStages() {
        $$('.stage').forEach((stage) => {
            if (stage.id === 'hero') return;

            const bg = $('.stage__bg', stage);
            const content = $('.stage__content', stage);

            const scrub = (start, end) => ({
                trigger: stage, start, end, scrub: true
            });

            // Entrada. Las salidas usan immediateRender:false para no pisar el estado inicial.
            gsap.fromTo(bg,
                { scale: 1.2, opacity: 0.2 },
                { scale: 1, opacity: 1, ease: 'none', scrollTrigger: scrub('top center', 'center center') });

            gsap.fromTo(content,
                { opacity: 0, y: 100 },
                { opacity: 1, y: 0, ease: 'none', scrollTrigger: scrub('top 40%', 'center center') });

            // Salida
            gsap.to(bg, {
                scale: 0.9,
                opacity: 0.1,
                ease: 'none',
                immediateRender: false,
                scrollTrigger: scrub('center top', 'bottom top')
            });

            gsap.to(content, {
                opacity: 0,
                y: -100,
                ease: 'none',
                immediateRender: false,
                scrollTrigger: scrub('center 20%', 'bottom top')
            });
        });
    }

    /* ---------- Arranque ---------- */
    function init() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            // Sin GSAP la página sigue siendo legible: no bloqueamos nada.
            return;
        }

        gsap.registerPlugin(ScrollTrigger);
        initVideoPlayback();

        const mm = gsap.matchMedia();

        // Usuarios con movimiento normal: experiencia completa
        mm.add('(prefers-reduced-motion: no-preference)', () => {
            document.body.classList.add('is-locked');
            initHero({});
            animateHero();
            animateStages();

            return () => document.body.classList.remove('is-locked'); // limpieza
        });

        // Usuarios con movimiento reducido: layout estático, sin bloqueo ni scrub
        mm.add('(prefers-reduced-motion: reduce)', () => {
            $('#hero-subtitle').textContent = 'Desliza para comenzar ↓';
        });
    }

    document.addEventListener('DOMContentLoaded', init);
})();
