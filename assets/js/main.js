/* =============================================
   RUMBAM ENGINEERS LIMITED — Main JavaScript
   ============================================= */

document.addEventListener('DOMContentLoaded', function () {

  // ---- Sticky Header shadow on scroll ----
  const header = document.getElementById('siteHeader');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 10) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // ---- Mobile Navigation Toggle ----
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('navMenu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('open');
      navMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', navMenu.classList.contains('open'));
    });

    // Close nav when a link is clicked
    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('open');
        navMenu.classList.remove('open');
      });
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!header.contains(e.target)) {
        hamburger.classList.remove('open');
        navMenu.classList.remove('open');
      }
    });
  }

  // ---- Scroll-based Animation (data-aos) ----
  const animElements = document.querySelectorAll('[data-aos]');
  if (animElements.length > 0) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    animElements.forEach(function (el, i) {
      // Stagger delay for sibling elements
      el.style.transitionDelay = (i % 6) * 0.07 + 's';
      observer.observe(el);
    });
  }

  // ---- Projects Filter ----
  const filterBar   = document.getElementById('filterBar');
  const projectGrid = document.getElementById('projectsGrid');
  if (filterBar && projectGrid) {
    filterBar.addEventListener('click', function (e) {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      filterBar.querySelectorAll('.filter-btn').forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      projectGrid.querySelectorAll('.project-card').forEach(function (card) {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = '';
          card.style.animation = 'fadeIn 0.3s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // ---- Contact Form Validation & Submission ----
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const successMsg = document.getElementById('formSuccess');
      const errorMsg   = document.getElementById('formError');
      const submitBtn  = contactForm.querySelector('[type="submit"]');

      // Hide any previous messages
      successMsg.style.display = 'none';
      errorMsg.style.display   = 'none';

      // Basic validation
      const required = contactForm.querySelectorAll('[required]');
      let valid = true;
      required.forEach(function (field) {
        field.style.borderColor = '';
        if (!field.value.trim()) {
          field.style.borderColor = '#E55200';
          valid = false;
        }
      });

      if (!valid) {
        errorMsg.style.display = 'block';
        errorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
      }

      // Simulate form submission (replace with real backend/FormSubmit/EmailJS)
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

      setTimeout(function () {
        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Enquiry';
        successMsg.style.display = 'block';
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 1200);
    });

    // Clear error highlight on input
    contactForm.querySelectorAll('input, select, textarea').forEach(function (field) {
      field.addEventListener('input', function () {
        field.style.borderColor = '';
      });
    });
  }

  // ---- Animated counters on highlights band ----
  const counters = document.querySelectorAll('.highlight-item .num');
  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const el   = entry.target;
          const span = el.querySelector('span');
          const suffix = span ? span.textContent : '';
          const rawText = el.textContent.replace(suffix, '').trim();
          const target  = parseInt(rawText.replace(/\D/g, ''), 10);

          if (isNaN(target)) return;

          let current  = 0;
          const step   = Math.ceil(target / 40);
          const timer  = setInterval(function () {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            el.childNodes[0].textContent = current;
          }, 35);

          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (counter) {
      counterObserver.observe(counter);
    });
  }

  // ---- Smooth scroll for anchor links ----
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 88; // header height
        const top    = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

});

// ---- Inject CSS for fade-in animation ----
(function () {
  const style = document.createElement('style');
  style.textContent = '@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }';
  document.head.appendChild(style);
})();
