import { gsap }          from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initGSAP() {

  /* ── Reveal sections — IntersectionObserver (nativo, ligero) ── */
  const io = new IntersectionObserver(
    (entries) => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    }),
    { threshold: 0.1 }
  );
  document.querySelectorAll('.reveal-section').forEach(el => io.observe(el));

  /* Helper: animación de entrada rápida y limpia */
  function enterFrom(
    selector: string,
    from: gsap.TweenVars,
    extra: gsap.TweenVars = {},
    stepDelay = 0.05
  ) {
    gsap.utils.toArray<HTMLElement>(selector).forEach((el, i) => {
      gsap.fromTo(el, from, {
        ...from,           // sobreescribir propiedades "from"
        opacity: 1, x: 0, y: 0, scale: 1,
        duration: 0.4,
        ease: 'power2.out',
        delay: i * stepDelay,
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        ...extra,
      });
    });
  }

  enterFrom('.project-card',  { opacity: 0, y: 35 });
  enterFrom('.skill-card',    { opacity: 0, scale: 0.94 }, { ease: 'back.out(1.3)' }, 0.06);
  enterFrom('.service-card',  { opacity: 0, y: 28 }, {}, 0.07);
  enterFrom('.contact-block', { opacity: 0, y: 28 }, {}, 0.08);
  enterFrom('.timeline-card', { opacity: 0, x: 30 }, {}, 0.1);

  /* ── Historia — timeline narrativo ──
     Cada .historia-item entra con fade + slide desde abajo, escalonado.
     start: 'top 88%' para que el trigger sea visible antes de que llegue al centro.
  ── */
  gsap.utils.toArray<HTMLElement>('.historia-item').forEach((el, i) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 32 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: 'power2.out',
        delay: i * 0.08,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
        },
      }
    );
  });
}
