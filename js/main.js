/* TARANG — main.js */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  /* ---------- Sticky header shadow state ---------- */
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (hamburger && mobileMenu) {
    const closeMenu = () => {
      hamburger.classList.remove('is-open');
      mobileMenu.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    const openMenu = () => {
      hamburger.classList.add('is-open');
      mobileMenu.classList.add('is-open');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };
    hamburger.addEventListener('click', () => {
      hamburger.classList.contains('is-open') ? closeMenu() : openMenu();
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    window.addEventListener('resize', () => { if (window.innerWidth > 860) closeMenu(); });
  }

  /* ---------- Hero Carousel ---------- */
  const carousel = document.querySelector('.carousel');
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('.slide'));
    const dotsWrap = carousel.querySelector('.carousel-dots');
    const prevBtn = carousel.querySelector('.carousel-arrow.prev');
    const nextBtn = carousel.querySelector('.carousel-arrow.next');
    let current = slides.findIndex(s => s.classList.contains('is-active'));
    if (current < 0) current = 0;
    let timer = null;
    const AUTOPLAY_MS = 5500;

    const dots = slides.map((_, i) => {
      const b = document.createElement('button');
      b.className = 'carousel-dot' + (i === current ? ' is-active' : '');
      b.setAttribute('aria-label', `Go to slide ${i + 1}`);
      b.addEventListener('click', () => goTo(i, true));
      dotsWrap.appendChild(b);
      return b;
    });

    function render() {
      slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
      dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
    }
    function goTo(i, user) {
      current = (i + slides.length) % slides.length;
      render();
      if (user) restart();
    }
    function next(user) { goTo(current + 1, user); }
    function prev(user) { goTo(current - 1, user); }
    function restart() {
      clearInterval(timer);
      timer = setInterval(() => next(false), AUTOPLAY_MS);
    }

    nextBtn && nextBtn.addEventListener('click', () => next(true));
    prevBtn && prevBtn.addEventListener('click', () => prev(true));

    carousel.addEventListener('mouseenter', () => clearInterval(timer));
    carousel.addEventListener('mouseleave', restart);

    /* touch swipe */
    let touchX = null;
    carousel.addEventListener('touchstart', e => touchX = e.touches[0].clientX, { passive: true });
    carousel.addEventListener('touchend', e => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) dx > 0 ? prev(true) : next(true);
      touchX = null;
    }, { passive: true });

    render();
    restart();
  }

  /* ---------- Gallery filter ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const masonryItems = document.querySelectorAll('.masonry-item');
  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const cat = btn.dataset.filter;
        masonryItems.forEach(item => {
          const show = cat === 'all' || item.dataset.category === cat;
          item.classList.toggle('is-hidden', !show);
        });
      });
    });
  }

  /* ---------- Lightbox ---------- */
  const lightbox = document.querySelector('.lightbox');
  if (lightbox && masonryItems.length) {
    const lbImg = lightbox.querySelector('img');
    const lbCap = lightbox.querySelector('.lightbox-cap');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    let visibleItems = [];
    let idx = 0;

    function openLB(item) {
      visibleItems = Array.from(masonryItems).filter(i => !i.classList.contains('is-hidden'));
      idx = visibleItems.indexOf(item);
      updateLB();
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    function updateLB() {
      const item = visibleItems[idx];
      const img = item.querySelector('img');
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = img.alt + ' — ' + (item.dataset.category ? item.dataset.category[0].toUpperCase() + item.dataset.category.slice(1) : '');
    }
    function closeLB() {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
    }
    masonryItems.forEach(item => item.addEventListener('click', () => openLB(item)));
    closeBtn.addEventListener('click', closeLB);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLB(); });
    prevBtn.addEventListener('click', () => { idx = (idx - 1 + visibleItems.length) % visibleItems.length; updateLB(); });
    nextBtn.addEventListener('click', () => { idx = (idx + 1) % visibleItems.length; updateLB(); });
    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLB();
      if (e.key === 'ArrowRight') nextBtn.click();
      if (e.key === 'ArrowLeft') prevBtn.click();
    });
  }

  /* ---------- Blog: Load More ---------- */
  const loadMoreBtn = document.querySelector('.js-load-more');
  if (loadMoreBtn) {
    const hiddenPosts = document.querySelectorAll('.blog-card.is-hidden');
    if (!hiddenPosts.length) loadMoreBtn.style.display = 'none';
    loadMoreBtn.addEventListener('click', () => {
      const batch = Array.from(document.querySelectorAll('.blog-card.is-hidden')).slice(0, 2);
      batch.forEach(card => card.classList.remove('is-hidden'));
      if (!document.querySelectorAll('.blog-card.is-hidden').length) {
        loadMoreBtn.textContent = 'All caught up';
        loadMoreBtn.disabled = true;
      }
    });
  }

  /* ---------- Contact form ---------- */
  const contactForm = document.querySelector('.js-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const successBox = document.querySelector('.form-success');
      successBox.classList.add('is-visible');
      contactForm.reset();
      successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

});
