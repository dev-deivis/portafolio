import { gsap }          from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Dividir texto en palabras dentro de spans individuales sin afectar el layout.
 * Respeta etiquetas <br /> y elementos anidados con formato.
 */
function splitTextIntoWords(element: HTMLElement): HTMLElement[] {
  const wordSpans: HTMLElement[] = [];

  function processNode(node: Node): Node[] {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (!text.trim()) {
        return [document.createTextNode(text)];
      }

      const tokens = text.split(/(\s+)/);
      const resultNodes: Node[] = [];

      tokens.forEach(token => {
        if (!token) return;
        if (/^\s+$/.test(token)) {
          resultNodes.push(document.createTextNode(' '));
        } else {
          const span = document.createElement('span');
          span.className = 'word-span';
          span.textContent = token;
          wordSpans.push(span);
          resultNodes.push(span);
        }
      });

      return resultNodes;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.tagName === 'BR') {
        return [el.cloneNode(true)];
      }
      const clone = el.cloneNode(false) as HTMLElement;
      Array.from(el.childNodes).forEach(child => {
        const processed = processNode(child);
        processed.forEach(p => clone.appendChild(p));
      });
      return [clone];
    }
    return [node.cloneNode(true)];
  }

  const finalNodes: Node[] = [];
  Array.from(element.childNodes).forEach(child => {
    const processed = processNode(child);
    processed.forEach(p => finalNodes.push(p));
  });

  element.innerHTML = '';
  finalNodes.forEach(child => element.appendChild(child));

  return wordSpans;
}

export function initGSAP() {

  /* ── 1. Hero text reveal (al cargar la página en window.load) ── */
  const heroTitle = document.querySelector<HTMLElement>('.hero-name');
  if (heroTitle) {
    const spans = splitTextIntoWords(heroTitle);
    gsap.set(spans, { opacity: 0, y: 20 });

    const animateHero = () => {
      gsap.to(spans, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.07,
        ease: 'power3.out',
      });
    };

    if (document.readyState === 'complete') {
      animateHero();
    } else {
      window.addEventListener('load', animateHero, { once: true });
    }
  }

  /* ── 2. Secciones text reveal (al entrar al viewport en scroll) ── */
  const sectionTitleSelectors = [
    '#historia .historia-title',
    '#projects .projects-title',
    '#services .services-title',
    '#about .declaration',
    '#contact .contact-title',
  ];

  sectionTitleSelectors.forEach(selector => {
    const titleEl = document.querySelector<HTMLElement>(selector);
    if (!titleEl) return;

    const spans = splitTextIntoWords(titleEl);
    gsap.set(spans, { opacity: 0, y: 20 });

    gsap.to(spans, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.06,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: titleEl,
        start: 'top 85%',
        once: true,
      },
    });
  });

  /* ── Reveal sections — IntersectionObserver (nativo, ligero) ── */
  const io = new IntersectionObserver(
    (entries) => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    }),
    { threshold: 0.1 }
  );
  document.querySelectorAll('.reveal-section').forEach(el => io.observe(el));

  /* ── Helper: animación de entrada rápida ── */
  function enterFrom(
    selector: string,
    from: gsap.TweenVars,
    extra: gsap.TweenVars = {},
    stepDelay = 0.05
  ) {
    gsap.utils.toArray<HTMLElement>(selector).forEach((el, i) => {
      gsap.fromTo(el, from, {
        ...from,
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

  /* ── Historia — responsive via matchMedia ──────────────────────────
     Desktop (≥ 768px): sección pineada + track horizontal con scrub
     Mobile  (< 768px): fade-in vertical, sin pin
  ─────────────────────────────────────────────────────────────────── */
  const mm = gsap.matchMedia();

  /* DESKTOP (≥ 768px): sección pineada + track horizontal con scrub */
  mm.add('(min-width: 768px)', () => {
    const track = document.querySelector<HTMLElement>('#historia-track');
    if (!track) return;

    gsap.to(track, {
      x: () => -(track.scrollWidth - window.innerWidth),
      ease: 'none',
      scrollTrigger: {
        trigger: '#historia',
        start: 'top top',
        end: () => `+=${track.scrollWidth - window.innerWidth}`,
        pin: true,
        scrub: 0.3,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    /* Cleanup al salir del breakpoint */
    return () => {
      ScrollTrigger.getAll()
        .filter(st => st.vars?.trigger === '#historia')
        .forEach(st => st.kill());
      gsap.set(track, { clearProps: 'x' });
    };
  });

  /* MOBILE (< 768px): fade-in vertical, sin pin */
  mm.add('(max-width: 767px)', () => {
    /* Header */
    const header = document.querySelector<HTMLElement>('.historia-header');
    if (header) {
      gsap.to(header, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: 'power2.out',
        scrollTrigger: { trigger: header, start: 'top 88%', once: true },
      });
    }

    /* Hitos — escalonados */
    gsap.utils.toArray<HTMLElement>('.hito').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
        delay: i * 0.07,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });

    /* Cleanup al salir del breakpoint */
    return () => {
      const header = document.querySelector<HTMLElement>('.historia-header');
      if (header) gsap.set(header, { clearProps: 'opacity,y' });
      gsap.utils.toArray<HTMLElement>('.hito').forEach(el =>
        gsap.set(el, { clearProps: 'opacity,y' })
      );
    };
  });

  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });
}
