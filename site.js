/* Shared behaviour for every page. Loaded with `defer`, so the DOM is parsed. */

// Accessible hamburger toggle for mobile
(function(){
  const btn = document.querySelector('.nav__toggle');
  const nav = document.getElementById('primary-nav');
  if (!btn || !nav) return;

  function closeNav(){
    nav.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
  }
  function openNav(){
    nav.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
  }

  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    expanded ? closeNav() : openNav();
  });

  // Close on Escape or when a link is selected
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
})();

// Tap-to-preview for publication thumbnails
(function () {
  // Restart a GIF by reloading its src with a cache-busting query
  function restartGif(img){
    if(!img) return;
    const src = img.getAttribute('src') || '';
    const base = src.split('#')[0].split('?')[0]; // strip query/hash
    img.setAttribute('src', base + '?r=' + Date.now());
  }

  const cards = document.querySelectorAll('.pub-card__media');
  if (!cards.length) return;

  // Desktop: restart GIF on hover and keyboard focus
  cards.forEach(card => {
    const after = card.querySelector('img.after');
    if(!after) return;
    card.addEventListener('mouseenter', () => restartGif(after));
    card.addEventListener('focus', () => restartGif(after), true); // accessibility
  });

  // Touch-only devices: tap-to-preview + restart when preview starts
  const isTouchOnly = window.matchMedia('(hover: none)').matches;
  if (!isTouchOnly) return;

  let active = null;
  let timer = null;

  cards.forEach((a) => {
    // Improve a11y hint
    const label = a.getAttribute('aria-label') || 'Publication';
    if (!/Tap to preview/i.test(label)) {
      a.setAttribute('aria-label', label + ' — Tap to preview, tap again to open');
    }

    a.addEventListener('click', function (e) {
      // Respect modified clicks (new tab, etc.)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;

      if (active !== a) {
        // First tap → preview (don’t navigate)
        e.preventDefault();

        // Remove preview state from previously active card
        if (active) active.classList.remove('preview');

        // Enter preview and restart GIF
        a.classList.add('preview');
        const after = a.querySelector('img.after');
        if (after) restartGif(after);

        active = a;

        // Auto-close preview after 1.5s
        clearTimeout(timer);
        timer = setTimeout(() => {
          if (active === a) {
            a.classList.remove('preview');
            active = null;
          }
        }, 1500);
      } else {
        // Second tap on the same card → close preview and allow navigation
        a.classList.remove('preview');
        active = null;
      }
    }, false);
  });

  // Dismiss preview on common interactions
  ['touchstart','scroll','orientationchange'].forEach(evt => {
    window.addEventListener(evt, () => {
      if (!active) return;
      active.classList.remove('preview');
      active = null;
      clearTimeout(timer);
    }, { passive: true });
  });
})();

// Footer year (the HTML already carries a static year for crawlers)
(function(){
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
})();
