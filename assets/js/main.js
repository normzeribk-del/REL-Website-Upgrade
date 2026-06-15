/* =============================================
   RUMBAM ENGINEERS — Main JavaScript
   With Supabase Integration
   ============================================= */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Initialize Supabase client
const supabaseUrl = 'https://fhdrvbamwthbdnpqxhtb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZHJ2YmFtd3RoYmRucHF4aHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MjIyOTEsImV4cCI6MjA5Njk5ODI5MX0.ny802RCti1ZA6zbQTFNK3kueKCKVhOcLGsKsVpgxMMI';
const supabase = createClient(supabaseUrl, supabaseKey);

// Edge function URL for contact submissions
const CONTACT_FUNCTION_URL = `${supabaseUrl}/functions/v1/contact-submit`;

document.addEventListener('DOMContentLoaded', function () {

  // ---- Sticky Header shadow on scroll + badge alignment ----
  const header = document.getElementById('siteHeader');
  function syncHeaderHeight() {
    if (header) {
      document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
    }
  }
  syncHeaderHeight();
  window.addEventListener('resize', syncHeaderHeight, { passive: true });
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

    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('open');
        navMenu.classList.remove('open');
      });
    });

    document.addEventListener('click', function (e) {
      if (header && !header.contains(e.target)) {
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
      el.style.transitionDelay = (i % 6) * 0.07 + 's';
      observer.observe(el);
    });
  }

  // ---- Back to Top Button ----
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }, { passive: true });

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      const cards = projectGrid.querySelectorAll('.project-card');
      cards.forEach(function (card) {
        const category = card.dataset.category;
        if (filter === 'all' || category === filter) {
          card.style.display = '';
          card.style.animation = 'fadeIn 0.3s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // ---- Load Projects from Database ----
  const projectsContainer = document.getElementById('projectsContainer');
  if (projectsContainer) {
    loadProjects();
  }

  async function loadProjects() {
    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'published')
        .order('display_order', { ascending: true });

      if (error) throw error;

      if (projects && projects.length > 0) {
        renderProjects(projects);
      }
    } catch (err) {
      console.error('Error loading projects:', err);
    }
  }

  function renderProjects(projects) {
    projectsContainer.innerHTML = projects.map(project => `
      <div class="project-card" data-category="${project.category}" data-aos>
        <div class="project-image">
          ${project.hero_image_url
            ? `<img src="${project.hero_image_url}" alt="${project.title}" loading="lazy">`
            : `<div class="project-image-inner"><i class="fas fa-project-diagram"></i></div>`
          }
          <span class="project-tag">${formatCategory(project.category)}</span>
          <a href="project-detail.html?slug=${project.slug}" class="project-link-btn">
            <i class="fas fa-arrow-right"></i>
          </a>
        </div>
        <div class="project-body">
          <h3>${project.title}</h3>
          <p>${project.short_description || ''}</p>
          <div class="project-meta">
            ${project.location ? `<span><i class="fas fa-map-marker-alt"></i> ${project.location}</span>` : ''}
            ${project.project_value ? `<span><i class="fas fa-coins"></i> ${project.project_value}</span>` : ''}
            ${project.duration ? `<span><i class="fas fa-clock"></i> ${project.duration}</span>` : ''}
          </div>
        </div>
      </div>
    `).join('');

    initAnimations();
  }

  // ---- Load Single Project Detail ----
  const projectDetailContent = document.getElementById('projectDetailContent');
  if (projectDetailContent) {
    loadProjectDetail();
  }

  async function loadProjectDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    if (!slug) {
      window.location.href = 'projects.html';
      return;
    }

    try {
      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error || !project) {
        window.location.href = 'projects.html';
        return;
      }

      renderProjectDetail(project);
      updatePageMeta(project);
    } catch (err) {
      console.error('Error loading project:', err);
      window.location.href = 'projects.html';
    }
  }

  function renderProjectDetail(project) {
    document.getElementById('projectTitle').textContent = project.title;
    document.getElementById('projectDescription').textContent = project.full_description || project.short_description;

    const metaContainer = document.getElementById('projectMeta');
    if (metaContainer) {
      metaContainer.innerHTML = `
        <div class="project-summary-kicker">Project Snapshot</div>
        <table class="project-summary-table">
          <tbody>
            <tr>
              <th>Client</th>
              <td>${project.client || 'Confidential'}</td>
            </tr>
            <tr>
              <th>Location</th>
              <td>${project.location || 'Various'}</td>
            </tr>
            <tr>
              <th>Year</th>
              <td>${project.year || 'Ongoing'}</td>
            </tr>
            <tr>
              <th>Project Value</th>
              <td>${project.project_value || 'Not specified'}</td>
            </tr>
            <tr>
              <th>Duration</th>
              <td>${project.duration || 'Not specified'}</td>
            </tr>
          </tbody>
        </table>
      `;
    }

    const infoGrid = document.getElementById('projectInfoGrid');
    if (infoGrid) {
      const categoryEl = document.getElementById('projectCategory');
      if (categoryEl) categoryEl.textContent = formatCategory(project.category) || '-';

      const clientEl = document.getElementById('projectClient');
      if (clientEl) clientEl.textContent = project.client || '-';

      const locationEl = document.getElementById('projectLocation');
      if (locationEl) locationEl.textContent = project.location || '-';

      const statusEl = document.getElementById('projectStatus');
      if (statusEl) {
        statusEl.textContent = project.completed_date ? 'Completed' : (project.status === 'published' ? 'Completed' : 'In Progress');
      }

      if (project.project_value) {
        const valueCard = document.createElement('div');
        valueCard.className = 'project-info-card';
        valueCard.innerHTML = `
          <div class="pic-icon-wrap"><i class="fas fa-coins"></i></div>
          <h4>Project Value</h4>
          <div class="value">${project.project_value}</div>
        `;
        infoGrid.appendChild(valueCard);
      }

      if (project.duration) {
        const durationCard = document.createElement('div');
        durationCard.className = 'project-info-card';
        durationCard.innerHTML = `
          <div class="pic-icon-wrap"><i class="fas fa-clock"></i></div>
          <h4>Duration</h4>
          <div class="value">${project.duration}</div>
        `;
        infoGrid.appendChild(durationCard);
      }

      if (project.scope && project.scope.length > 0) {
        const scopeCard = document.createElement('div');
        scopeCard.className = 'project-info-card pic-scope';
        scopeCard.innerHTML = `
          <div class="pic-icon-wrap pic-icon-accent"><i class="fas fa-list-check"></i></div>
          <h4>Project Scope</h4>
          <ul class="pic-scope-list">${project.scope.map(s => `<li>${s}</li>`).join('')}</ul>
        `;
        infoGrid.insertBefore(scopeCard, infoGrid.firstChild);
      }
    }

    const challengesSection = document.getElementById('projectChallenges');
    if (challengesSection && project.challenges) {
      challengesSection.innerHTML = `<p>${project.challenges}</p>`;
    }

    const solutionsSection = document.getElementById('projectSolutions');
    if (solutionsSection && project.solutions) {
      solutionsSection.innerHTML = `<p>${project.solutions}</p>`;
    }

    const outcomesSection = document.getElementById('projectOutcomes');
    if (outcomesSection && project.outcomes) {
      outcomesSection.innerHTML = `<p>${project.outcomes}</p>`;
    }

    const galleryContainer = document.getElementById('projectGallery');
    if (galleryContainer && project.gallery_images && project.gallery_images.length > 0) {
      galleryContainer.innerHTML = project.gallery_images.map((img, idx) => `
        <div class="project-detail-gallery-item" data-image="${img}" onclick="openLightbox(${idx}, ${JSON.stringify(project.gallery_images).replace(/"/g, '&quot;')})">
          <img src="${img}" alt="${project.title} - Image ${idx + 1}" loading="lazy">
        </div>
      `).join('');
    }

    const heroImage = document.querySelector('.project-detail-hero .hero-image');
    if (heroImage && project.hero_image_url) {
      heroImage.style.backgroundImage = `url(${project.hero_image_url})`;
    }
  }

  function updatePageMeta(project) {
    document.title = `${project.title} — Rumbam Engineers`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', project.short_description || '');
    }
  }

  // ---- Load Gallery from Database ----
  const galleryContainer = document.getElementById('galleryContainer');
  if (galleryContainer) {
    loadGallery();
  }

  async function loadGallery() {
    // Gallery uses local images from static HTML only
  }

  // ---- Gallery Filter ----
  const galleryFilter = document.getElementById('galleryFilter');
  if (galleryFilter && galleryContainer) {
    galleryFilter.addEventListener('click', function (e) {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      galleryFilter.querySelectorAll('.filter-btn').forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      galleryContainer.querySelectorAll('.gallery-item').forEach(function (item) {
        if (filter === 'all' || item.dataset.category === filter) {
          item.style.display = '';
          item.style.animation = 'fadeIn 0.3s ease forwards';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }

  // ---- Contact Form with Supabase Integration ----
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const successMsg = document.getElementById('formSuccess');
      const errorMsg   = document.getElementById('formError');
      const submitBtn  = contactForm.querySelector('[type="submit"]');

      successMsg.style.display = 'none';
      errorMsg.style.display   = 'none';

      const required = contactForm.querySelectorAll('[required]');
      let valid = true;
      required.forEach(function (field) {
        field.classList.remove('error');
        if (!field.value.trim()) {
          field.classList.add('error');
          valid = false;
        }
      });

      if (!valid) {
        errorMsg.style.display = 'flex';
        errorMsg.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please fill in all required fields.';
        errorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
      }

      const emailField = contactForm.querySelector('#email');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailField.value)) {
        emailField.classList.add('error');
        errorMsg.style.display = 'flex';
        errorMsg.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please enter a valid email address.';
        return;
      }

      const formData = {
        first_name: contactForm.querySelector('#firstName').value.trim(),
        last_name: contactForm.querySelector('#lastName').value.trim(),
        email: emailField.value.trim(),
        phone: contactForm.querySelector('#phone')?.value.trim() || null,
        company: contactForm.querySelector('#company')?.value.trim() || null,
        project_type: contactForm.querySelector('#projectType').value,
        message: contactForm.querySelector('#message').value.trim(),
        preferred_contact: contactForm.querySelector('#contactMethod')?.value || 'email'
      };

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

      try {
        const response = await fetch(CONTACT_FUNCTION_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          contactForm.reset();
          successMsg.style.display = 'flex';
          successMsg.innerHTML = '<i class="fas fa-check-circle"></i> ' + result.message;
          successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          throw new Error(result.error || 'Failed to submit form');
        }
      } catch (err) {
        console.error('Form submission error:', err);
        errorMsg.style.display = 'flex';
        errorMsg.innerHTML = '<i class="fas fa-exclamation-circle"></i> Sorry, there was an error sending your message. Please try again or contact us directly.';
        errorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Enquiry';
      }
    });

    contactForm.querySelectorAll('input, select, textarea').forEach(function (field) {
      field.addEventListener('input', function () {
        field.classList.remove('error');
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
        const offset = 88;
        const top    = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  function initAnimations() {
    const elements = document.querySelectorAll('[data-aos]:not(.aos-animate)');
    elements.forEach(function (el, i) {
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

      el.style.transitionDelay = (i % 6) * 0.07 + 's';
      observer.observe(el);
    });
  }
});

// ---- Format Category Helper ----
function formatCategory(category) {
  const categoryMap = {
    'civil': 'Civil Engineering',
    'transport': 'Transport',
    'structural': 'Structural',
    'environmental': 'Environmental',
    'airports': 'Airports & Marine'
  };
  return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
}

// ---- Lightbox Functions (global) ----
let currentImageIndex = 0;
let currentImageSet = [];

function openLightbox(index, images) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  if (images && Array.isArray(images)) {
    currentImageSet = images.map(img => typeof img === 'string' ? { image_url: img, title: '' } : img);
  } else if (window.galleryImages) {
    currentImageSet = window.galleryImages;
  }

  currentImageIndex = index;
  updateLightboxImage();
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';

  document.addEventListener('keydown', handleLightboxKeyboard);
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
  document.removeEventListener('keydown', handleLightboxKeyboard);
}

function nextImage() {
  if (currentImageSet.length === 0) return;
  currentImageIndex = (currentImageIndex + 1) % currentImageSet.length;
  updateLightboxImage();
}

function prevImage() {
  if (currentImageSet.length === 0) return;
  currentImageIndex = (currentImageIndex - 1 + currentImageSet.length) % currentImageSet.length;
  updateLightboxImage();
}

function updateLightboxImage() {
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxCounter = document.getElementById('lightboxCounter');

  if (lightboxImage && currentImageSet[currentImageIndex]) {
    const img = currentImageSet[currentImageIndex];
    lightboxImage.src = img.image_url || img;

    if (lightboxTitle) {
      lightboxTitle.textContent = img.title || '';
    }

    if (lightboxCounter) {
      lightboxCounter.textContent = `${currentImageIndex + 1} / ${currentImageSet.length}`;
    }
  }
}

function handleLightboxKeyboard(e) {
  switch (e.key) {
    case 'Escape':
      closeLightbox();
      break;
    case 'ArrowLeft':
      prevImage();
      break;
    case 'ArrowRight':
      nextImage();
      break;
  }
}

window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.nextImage = nextImage;
window.prevImage = prevImage;

// ---- Inject CSS for fade-in animation ----
(function () {
  const style = document.createElement('style');
  style.textContent = '@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }';
  document.head.appendChild(style);
})();
