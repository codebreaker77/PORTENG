/* ═══════════════════════════════════════════════════════════
   HERO HOVER REVEAL
   
   Technique:  CSS mask-image with a radial-gradient,
               updated via CSS custom properties on mousemove.
               Zero canvas, zero toDataURL — pure GPU compositing.

   Layer logic:
     - hero-real    (z1) : real photo, always visible
     - hero-illustrated (z2) : illustration, masked on hover
     - When NO hover: illustration fully visible (mask = none)
     - On hover: mask = white everywhere EXCEPT a circle
       at cursor → illustration hidden at cursor → real photo shows
═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const hero = document.getElementById('hero');
  const illustrated = document.getElementById('heroIllustrated');
  if (!hero || !illustrated) return;

  const RADIUS = 180; // px — reveal circle radius

  let mx = -9999, my = -9999;
  let cx = -9999, cy = -9999;   // current (lerped)
  let hovering = false;
  let currentR = 0;
  let targetR = 0;
  let raf;

  function onEnter() {
    hovering = true;
    targetR = RADIUS;
  }

  function onLeave() {
    hovering = false;
    targetR = 0;
  }

  function onMove(e) {
    const rect = hero.getBoundingClientRect();
    mx = e.clientX - rect.left;
    my = e.clientY - rect.top;
  }

  hero.addEventListener('mouseenter', onEnter);
  hero.addEventListener('mouseleave', onLeave);
  hero.addEventListener('mousemove', onMove);

  // Touch support
  hero.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    const rect = hero.getBoundingClientRect();
    mx = t.clientX - rect.left;
    my = t.clientY - rect.top;
    onEnter();
  }, { passive: true });

  hero.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    const rect = hero.getBoundingClientRect();
    mx = t.clientX - rect.left;
    my = t.clientY - rect.top;
  }, { passive: true });

  hero.addEventListener('touchend', onLeave);

  function tick() {
    // Smooth follow
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;

    // Ease radius
    const rSpeed = hovering ? 0.08 : 0.06;
    currentR += (targetR - currentR) * rSpeed;

    if (currentR < 0.5 && !hovering) {
      currentR = 0;
      illustrated.style.maskImage = 'none';
      illustrated.style.webkitMaskImage = 'none';
    } else if (currentR > 0.5) {
      // Mask:
      //   black circle = transparent (hides illustration) → reveals real photo
      //   white everywhere else = opaque (shows illustration)
      //
      // CSS mask: white = show, black = hide
      // radial-gradient: transparent circle at cursor, white elsewhere
      //
      // We use a soft-edge feather of ~30px
      const r = Math.round(currentR);
      const feather = 35;
      const inner = Math.max(0, r - feather);
      const mask = `radial-gradient(circle ${r}px at ${cx.toFixed(1)}px ${cy.toFixed(1)}px, `
        + `transparent ${inner}px, rgba(255,255,255,0.15) ${inner + feather * 0.4}px, white ${r}px)`;
      illustrated.style.maskImage = mask;
      illustrated.style.webkitMaskImage = mask;
    }

    raf = requestAnimationFrame(tick);
  }

  tick();
})();


/* ═══════════════════════════════════════════════════════════
   SCROLL REVEAL — minimal IntersectionObserver
═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const targets = document.querySelectorAll(
    '.section-label, .project-card, .about-lead, .about-body, .about-block, .contact-lead, .contact-link'
  );
  targets.forEach(el => el.classList.add('fade-in'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  targets.forEach(el => io.observe(el));
})();




/* ═══════════════════════════════════════════════════════════
   NAV — subtle bg on scroll
═══════════════════════════════════════════════════════════ */
(function () {
  const nav = document.getElementById('nav');
  if (!nav) return;

  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.scrollY > window.innerHeight * 0.8) {
          nav.style.mixBlendMode = 'normal';
          nav.style.background = 'rgba(14,14,14,0.92)';
          nav.style.backdropFilter = 'blur(10px)';
          nav.style.borderBottom = '1px solid #1e1e1e';
        } else {
          nav.style.mixBlendMode = 'difference';
          nav.style.background = 'transparent';
          nav.style.backdropFilter = 'none';
          nav.style.borderBottom = 'none';
        }
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();


/* ═══════════════════════════════════════════════════════════
   SMOOTH SCROLL on anchor links
═══════════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ═══════════════════════════════════════════════════════════
   PROJECT CARDS — Mouse Tracking hover effect
═══════════════════════════════════════════════════════════ */
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  });
});
