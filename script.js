/* ============================================================
   YGMB Landing Page - Global Animation Engine
   Pure Vanilla JS - Ultra Premium Interactive Experience
   ============================================================ */

(function () {
  'use strict';

  // =========================================================
  // UTILITIES
  // =========================================================
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
  const mapRange = (value, inMin, inMax, outMin, outMax) =>
    ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;

  // Store mouse position globally
  const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const smoothMouse = { x: mouse.x, y: mouse.y };

  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // =========================================================
  // 1. CUSTOM CURSOR
  // =========================================================
  function initCursor() {
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursorFollower');
    if (!cursor || !follower) return;

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      cursor.style.display = 'none';
      follower.style.display = 'none';
      document.body.style.cursor = 'auto';
      return;
    }

    let cursorPos = { x: mouse.x, y: mouse.y };
    let followerPos = { x: mouse.x, y: mouse.y };

    const interactiveEls = 'a, button, [data-magnetic], input, textarea, select, .tilt-card';

    document.addEventListener('mouseenter', () => {
      cursor.style.opacity = '1';
      follower.style.opacity = '0.5';
    });

    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
      follower.style.opacity = '0';
    });

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveEls)) {
        document.body.classList.add('cursor-hover');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveEls)) {
        document.body.classList.remove('cursor-hover');
      }
    });

    function updateCursor() {
      cursorPos.x = lerp(cursorPos.x, mouse.x, 0.2);
      cursorPos.y = lerp(cursorPos.y, mouse.y, 0.2);
      followerPos.x = lerp(followerPos.x, mouse.x, 0.08);
      followerPos.y = lerp(followerPos.y, mouse.y, 0.08);

      cursor.style.left = cursorPos.x + 'px';
      cursor.style.top = cursorPos.y + 'px';
      follower.style.left = followerPos.x + 'px';
      follower.style.top = followerPos.y + 'px';

      requestAnimationFrame(updateCursor);
    }

    requestAnimationFrame(updateCursor);
  }

  // =========================================================
  // 2. HEADER / NAVBAR - Glassmorphism on Scroll + Logo Rotate
  // =========================================================
  function initHeader() {
    const header = document.getElementById('header');
    const logoSvg = document.getElementById('logoSvg');
    if (!header) return;

    let lastScroll = 0;

    function onScroll() {
      const scrollY = window.scrollY;

      // Glassmorphism toggle
      if (scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      // Logo rotation based on scroll
      if (logoSvg) {
        logoSvg.style.transform = `rotate(${scrollY * 0.3}deg)`;
      }

      lastScroll = scrollY;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // =========================================================
  // 3. MAGNETIC ELEMENTS
  // =========================================================
  function initMagnetic() {
    const magneticEls = document.querySelectorAll('[data-magnetic]');

    magneticEls.forEach((el) => {
      const strength = el.classList.contains('hero-cta') ? 0.35 : 0.25;

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * strength;
        const dy = (e.clientY - cy) * strength;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0, 0)';
        el.style.transition = 'transform 0.5s var(--ease-out-expo)';
        setTimeout(() => {
          el.style.transition = '';
        }, 500);
      });
    });
  }

  // =========================================================
  // 4. HERO - Mouse Parallax for Abstract Text + Particles
  // =========================================================
  function initHeroParallax() {
    const abstracts = document.querySelectorAll('.hero-abstract');
    if (!abstracts.length) return;

    function update() {
      const cx = (mouse.x / window.innerWidth - 0.5) * 2;  // -1 to 1
      const cy = (mouse.y / window.innerHeight - 0.5) * 2;

      abstracts.forEach((el) => {
        const speed = parseFloat(el.dataset.parallaxSpeed) || 0.02;
        const moveX = cx * speed * 100;
        const moveY = cy * speed * 80;
        el.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });

      requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  function initHeroParticles() {
    const container = document.getElementById('heroParticles');
    if (!container) return;

    for (let i = 0; i < 40; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 6 + 's';
      particle.style.animationDuration = 4 + Math.random() * 4 + 's';
      particle.style.width = 1 + Math.random() * 3 + 'px';
      particle.style.height = particle.style.width;
      container.appendChild(particle);
    }
  }

  function initHeroTitle() {
    const title = document.querySelector('.hero-title');
    if (title) {
      // Trigger after a small delay
      setTimeout(() => {
        title.classList.add('is-visible');
      }, 200);
    }
  }

  // =========================================================
  // 5. TENTANG - Image Parallax on Scroll
  // =========================================================
  function initScrollParallax() {
    const parallaxEls = document.querySelectorAll('[data-parallax-scroll]');
    if (!parallaxEls.length) return;

    function update() {
      const scrollY = window.scrollY;

      parallaxEls.forEach((el) => {
        const speed = parseFloat(el.dataset.parallaxScroll) || 0.05;
        const rect = el.getBoundingClientRect();
        const offsetY = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
        el.style.transform = `translateY(${offsetY}px)`;
      });

      requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  // =========================================================
  // 6. PROGRAM TABS - Switch between Tahunan/Bulanan/Mingguan
  // =========================================================
  function initProgramTabs() {
    const tabs = document.querySelectorAll('.program-tab');
    const panels = document.querySelectorAll('.program-panel');
    if (!tabs.length || !panels.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;

        // Update active tab
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        // Update active panel
        panels.forEach((p) => p.classList.remove('active'));
        const targetPanel = document.getElementById('panel-' + targetTab);
        if (targetPanel) {
          targetPanel.classList.add('active');

          // Re-trigger animations for cards in the new panel
          const cards = targetPanel.querySelectorAll('.program-card');
          cards.forEach((card, i) => {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.9)';
            setTimeout(() => {
              card.style.transition = 'opacity 0.6s var(--ease-out-expo), transform 0.6s var(--ease-out-expo)';
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
            }, i * 100 + 50);
          });

          // Re-init tilt for new cards
          initTiltCards();

          // Re-init counters for new panel
          const counters = targetPanel.querySelectorAll('[data-count]');
          counters.forEach((c) => {
            c.textContent = '0';
            animateCount(c, 0, parseInt(c.dataset.count, 10), 2000);
          });
        }
      });
    });
  }

  // =========================================================
  // 7. PROGRAM CARDS - 3D Tilt + Glow Spotlight
  // =========================================================
  function initTiltCards() {
    const cards = document.querySelectorAll('[data-tilt]');

    cards.forEach((card) => {
      const glowEl = card.querySelector('.card-glow');
      const maxTilt = 12; // degrees

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;

        const rotateX = ((y - cy) / cy) * -maxTilt;
        const rotateY = ((x - cx) / cx) * maxTilt;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

        // Glow spotlight
        if (glowEl) {
          glowEl.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(255, 107, 53, 0.08), transparent 40%)`;
        }
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        card.style.transition = 'transform 0.6s var(--ease-out-expo)';
        if (glowEl) {
          glowEl.style.background = 'transparent';
        }
        setTimeout(() => {
          card.style.transition = '';
        }, 600);
      });

      card.addEventListener('mouseenter', () => {
        card.style.transition = '';
      });
    });
  }

  // =========================================================
  // 7. STAT COUNTER ANIMATION
  // =========================================================
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.count, 10);
            animateCount(el, 0, target, 2000);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((c) => observer.observe(c));
  }

  function animateCount(el, start, end, duration) {
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out expo
      const easedProgress = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(start + (end - start) * easedProgress);
      el.textContent = current.toLocaleString('id-ID');

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  // =========================================================
  // 8. MARQUEE SPEED CONTROL
  // =========================================================
  function initMarquee() {
    const track = document.getElementById('marqueeTrack');
    if (!track) return;

    let baseSpeed = 1;
    let currentSpeed = baseSpeed;
    let lastScrollY = window.scrollY;
    let scrollDelta = 0;

    window.addEventListener('scroll', () => {
      const newScrollY = window.scrollY;
      scrollDelta = Math.abs(newScrollY - lastScrollY);
      lastScrollY = newScrollY;
    }, { passive: true });

    let position = 0;

    function updateMarquee() {
      // Speed up based on scroll velocity
      const targetSpeed = baseSpeed + scrollDelta * 0.15;
      currentSpeed = lerp(currentSpeed, targetSpeed, 0.05);
      scrollDelta = lerp(scrollDelta, 0, 0.02);

      position -= currentSpeed;

      // Reset position when half the track has scrolled
      const halfWidth = track.scrollWidth / 2;
      if (Math.abs(position) >= halfWidth) {
        position = 0;
      }

      track.style.transform = `translateX(${position}px)`;
      requestAnimationFrame(updateMarquee);
    }

    // Disable CSS animation, use JS instead
    track.style.animation = 'none';
    requestAnimationFrame(updateMarquee);
  }

  // =========================================================
  // 9. BACK TO TOP
  // =========================================================
  function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > window.innerHeight) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // =========================================================
  // 10. GLOBAL SCROLL ANIMATIONS (Intersection Observer)
  // =========================================================
  function initScrollAnimations() {
    const animatedEls = document.querySelectorAll(
      '.animate-fade-in, .animate-slide-up, .animate-zoom'
    );

    const revealEls = document.querySelectorAll('.animate-reveal');

    if (!animatedEls.length && !revealEls.length) return;

    // Standard animations observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    animatedEls.forEach((el) => observer.observe(el));

    // Text reveal: observe the PARENT container (.text-reveal-line)
    // since the child is translated out of its overflow:hidden parent
    revealEls.forEach((el) => {
      const parentLine = el.closest('.text-reveal-line') || el.parentElement;
      const revObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              el.classList.add('is-visible');
              revObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.01, rootMargin: '0px 0px -20px 0px' }
      );
      revObserver.observe(parentLine);
    });
  }

  // =========================================================
  // 11. SMOOTH ANCHOR SCROLL
  // =========================================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          const offset = 80;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }

  // =========================================================
  // 12. MOBILE MENU TOGGLE
  // =========================================================
  function initMobileMenu() {
    const toggle = document.getElementById('mobileToggle');
    const navLinks = document.querySelector('.nav-links');
    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      navLinks.classList.toggle('mobile-open');
    });
  }

  // =========================================================
  // 13. MODAL SYSTEM (reusable for Program + Peduli)
  // =========================================================
  function initModal() {
    const overlay = document.getElementById('modalOverlay');
    const closeBtn = document.getElementById('modalClose');
    const body = document.getElementById('modalBody');
    if (!overlay || !closeBtn || !body) return;

    function openModal(content) {
      body.innerHTML = content;
      overlay.classList.add('is-open');
      document.body.classList.add('modal-open');
      // Animate progress bars inside modal
      body.querySelectorAll('.peduli-prog-fill').forEach((bar) => {
        setTimeout(() => bar.classList.add('animated'), 100);
      });
    }

    function closeModal() {
      overlay.classList.remove('is-open');
      document.body.classList.remove('modal-open');
    }

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    // Wire Program Cards
    document.querySelectorAll('.program-card[data-modal-content]').forEach((card) => {
      card.setAttribute('tabindex', '0');
      const handler = () => openModal('<div class="modal-article">' + card.dataset.modalContent + '</div>');
      card.addEventListener('click', handler);
      card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') handler(); });
    });

    // Wire Peduli & Other Template Triggers
    document.querySelectorAll('.peduli-card[data-modal-target], [data-modal-target]').forEach((card) => {
      const handler = (e) => {
        const tmpl = document.getElementById(card.dataset.modalTarget);
        if (tmpl) openModal(tmpl.innerHTML);
      };
      card.addEventListener('click', handler);
      card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') handler(); });
    });

    // Wire Berita Cards
    document.querySelectorAll('.berita-card').forEach((card) => {
      card.setAttribute('tabindex', '0');
      card.style.cursor = 'pointer';
      const handler = () => {
        const title = card.querySelector('h3') ? card.querySelector('h3').innerHTML : '';
        const text = card.querySelector('p') ? card.querySelector('p').innerHTML : '';
        const badgeHTML = card.querySelector('.berita-card-badge') ? card.querySelector('.berita-card-badge').outerHTML : '';
        openModal(`<div class="modal-article" style="text-align: left;">${badgeHTML}<h2 style="margin-top:16px;">${title}</h2><p style="font-size:1.05rem; line-height:1.8;">${text}</p></div>`);
      };
      card.addEventListener('click', handler);
      card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') handler(); });
    });
  }

  // =========================================================
  // 14. NEWS SLIDER
  // =========================================================
  function initNewsSlider() {
    const slider = document.getElementById('beritaSlider');
    const prevBtn = document.getElementById('beritaPrev');
    const nextBtn = document.getElementById('beritaNext');
    const dots = document.querySelectorAll('.berita-dot');
    if (!slider) return;

    let currentSlide = 0;
    const cards = slider.querySelectorAll('.berita-card');
    const total = cards.length;
    let autoPlayInterval;

    function slideTo(index) {
      if (index >= total) index = 0; // Loop back to start
      if (index < 0) index = total - 1; // Loop to end
      currentSlide = index;
      
      const cardWidth = cards[0] ? cards[0].offsetWidth + 24 : 0; // gap = 24px
      slider.scrollTo({ left: currentSlide * cardWidth, behavior: 'smooth' });
      dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
    }

    function startAutoPlay() {
      stopAutoPlay(); // Clear existing interval just in case
      autoPlayInterval = setInterval(() => {
        slideTo(currentSlide + 1);
      }, 3000); // 3 seconds
    }

    function stopAutoPlay() {
      clearInterval(autoPlayInterval);
    }

    // Reset auto-play on manual interaction
    function resetAutoPlay() {
      startAutoPlay();
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        slideTo(currentSlide - 1);
        resetAutoPlay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        slideTo(currentSlide + 1);
        resetAutoPlay();
      });
    }

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        slideTo(parseInt(dot.dataset.slide, 10));
        resetAutoPlay();
      });
    });

    // Pause auto-play on hover
    slider.addEventListener('mouseenter', stopAutoPlay);
    slider.addEventListener('mouseleave', startAutoPlay);

    // Sync dots on manual scroll
    slider.addEventListener('scroll', () => {
      const cardWidth = cards[0] ? cards[0].offsetWidth + 24 : 1;
      const idx = Math.round(slider.scrollLeft / cardWidth);
      if (idx !== currentSlide) {
        currentSlide = idx;
        dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
        resetAutoPlay();
      }
    }, { passive: true });

    // Start initial auto-play
    startAutoPlay();
  }

  // =========================================================
  // 15. PROGRESS BAR ANIMATION (Peduli Section)
  // =========================================================
  function initProgressBars() {
    const bars = document.querySelectorAll('.peduli-bar-fill, .peduli-prog-fill');
    if (!bars.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    bars.forEach((bar) => observer.observe(bar));
  }

  // =========================================================
  // 16. QUOTE SECTION OBSERVER
  // =========================================================
  function initQuoteObserver() {
    const quote = document.querySelector('.quote-content');
    if (!quote) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            quote.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(quote);
  }

  // =========================================================
  // INIT ALL
  // =========================================================
  function init() {
    initCursor();
    initHeader();
    initMagnetic();
    initHeroParallax();
    initHeroParticles();
    initHeroTitle();
    initScrollParallax();
    initProgramTabs();
    initTiltCards();
    initCounters();
    initMarquee();
    initBackToTop();
    initScrollAnimations();
    initSmoothScroll();
    initMobileMenu();
    // New modules
    initModal();
    initNewsSlider();
    initProgressBars();
    initQuoteObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

