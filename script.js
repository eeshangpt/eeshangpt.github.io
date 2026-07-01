// Scroll-reveal
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  // Hero benchmark bar fill on load
  window.addEventListener('load', () => {
    document.querySelectorAll('.bench-fill').forEach(fill => {
      const w = fill.getAttribute('data-width');
      requestAnimationFrame(() => { fill.style.width = w + '%'; });
    });
  });
