/* ================================================
   Piscine & Aménagement Bordeaux Médoc
   Main JavaScript
   ================================================ */

/* ---- Navbar scroll behavior ---- */
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;

  // Add scrolled class after 50px
  if (currentScroll > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Hide/show on scroll direction (only on mobile)
  if (window.innerWidth < 768) {
    if (currentScroll > lastScroll && currentScroll > 200) {
      navbar.style.transform = 'translateY(-100%)';
    } else {
      navbar.style.transform = 'translateY(0)';
    }
  }

  lastScroll = currentScroll;
}, { passive: true });

/* ---- Mobile Menu ---- */
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const menuIconOpen = document.getElementById('menu-icon-open');
const menuIconClose = document.getElementById('menu-icon-close');

if (menuBtn) {
  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    menuIconOpen.classList.toggle('hidden');
    menuIconClose.classList.toggle('hidden');
  });

  // Close menu when link clicked
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      menuIconOpen.classList.remove('hidden');
      menuIconClose.classList.add('hidden');
    });
  });
}

/* ---- Active nav link on scroll ---- */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link[data-section]');

function updateActiveLink() {
  const scrollY = window.scrollY + 100;
  sections.forEach(section => {
    const top    = section.offsetTop;
    const height = section.offsetHeight;
    const id     = section.getAttribute('id');
    if (scrollY >= top && scrollY < top + height) {
      navLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-link[data-section="${id}"]`);
      if (active) active.classList.add('active');
    }
  });
}

window.addEventListener('scroll', updateActiveLink, { passive: true });

/* ---- Scroll Reveal ---- */
const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Don't unobserve — keep it visible
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -60px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

/* ---- Animated Counters ---- */
function animateCounter(el) {
  const target   = parseFloat(el.dataset.target);
  const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
  const suffix   = el.dataset.suffix || '';
  const prefix   = el.dataset.prefix || '';
  const duration = 2000;
  const start    = performance.now();

  function update(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = target * eased;
    el.textContent = prefix + value.toFixed(decimals) + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = prefix + target.toFixed(decimals) + suffix;
  }

  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.counted) {
      entry.target.dataset.counted = 'true';
      animateCounter(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number[data-target]').forEach(el => {
  counterObserver.observe(el);
});

/* ---- Floating particles (hero) ---- */
function createParticles() {
  const hero = document.querySelector('.hero-section');
  if (!hero) return;

  const container = document.createElement('div');
  container.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;';

  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.cssText = `
      left: ${Math.random() * 100}%;
      bottom: ${Math.random() * 20}%;
      width: ${Math.random() * 4 + 2}px;
      height: ${Math.random() * 4 + 2}px;
      animation-duration: ${Math.random() * 15 + 10}s;
      animation-delay: ${Math.random() * 10}s;
    `;
    container.appendChild(particle);
  }

  hero.appendChild(container);
}

createParticles();

/* ---- Contact Form Handling (PHP mail) ---- */

function setupForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = form.querySelector('[type="submit"]');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<span class="inline-flex items-center gap-2">
      <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>Envoi en cours…</span>`;
    btn.disabled = true;

    try {
      const fd = new FormData(form);
      const data = Object.fromEntries(fd.entries());
      data.form_type = formId.replace('form-', '');

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.ok) {
        showToast('✅ Message envoyé ! Nous vous contacterons sous 24h.');
        form.reset();
        form.querySelectorAll('textarea').forEach(ta => ta.dispatchEvent(new Event('input')));
      } else {
        showToast(`⚠️ ${result.error || 'Erreur inconnue.'} Contactez-nous directement au 06 41 73 28 53.`);
      }
    } catch {
      showToast('⚠️ Connexion impossible. Contactez-nous au 06 41 73 28 53 ou par WhatsApp.');
    } finally {
      btn.innerHTML = originalHTML;
      btn.disabled = false;
    }
  });
}

setupForm('form-contact');
setupForm('form-devis');
setupForm('form-piscines');

/* ---- Toast notification ---- */
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 5000);
}

/* ---- Floating CTA (appears after scroll) ---- */
const floatingCTA = document.querySelector('.floating-cta');
if (floatingCTA) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      floatingCTA.classList.add('show');
    } else {
      floatingCTA.classList.remove('show');
    }
  }, { passive: true });
}

/* ---- Smooth scroll for all anchor links ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const navHeight = navbar ? navbar.offsetHeight : 80;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ---- Pool card modal (piscines page) ---- */
const modal = document.getElementById('pool-modal');
const modalContent = document.getElementById('modal-content');
const modalClose = document.getElementById('modal-close');

function closeModal() {
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow = '';
}

function selectModelInForm(modelName) {
  const select = document.querySelector('#form-piscines select[name="modele"]');
  if (select) select.value = modelName;
}

function scrollToForm() {
  const formSection = document.getElementById('devis-piscines');
  if (formSection) {
    const navHeight = navbar ? navbar.offsetHeight : 80;
    const top = formSection.getBoundingClientRect().top + window.scrollY - navHeight;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

if (modal && modalClose) {
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  /* "Voir les détails" — affiche l'image en plein écran */
  document.querySelectorAll('.btn-voir-details').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.pool-card');
      const name   = card.dataset.name || '';
      const imgEl  = card.querySelector('img');
      const imgSrc = imgEl ? imgEl.getAttribute('src') : '';
      const waText = encodeURIComponent(`Bonjour, je m'intéresse au modèle ${name} — pouvez-vous me donner plus d'informations ?`);

      modalContent.innerHTML = `
        <h3 class="font-serif text-2xl font-semibold mb-5" style="color:#0D2444;">${name}</h3>
        <div class="rounded-2xl overflow-hidden mb-6" style="background:#F4F8FF;">
          <img src="${imgSrc}" alt="${name}" class="w-full h-auto object-contain" style="max-height:58vh;" />
        </div>
        <div class="flex flex-wrap gap-3">
          <button class="btn-gold flex-1 min-w-[160px] py-3 rounded-xl text-sm font-semibold" id="modal-devis-btn">
            Demander un devis
          </button>
          <a href="https://wa.me/33641732853?text=${waText}" target="_blank" rel="noopener"
             class="btn-whatsapp flex-1 min-w-[160px] py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            WhatsApp
          </a>
        </div>
      `;

      /* Bouton devis dans la modale → pré-sélectionne + scroll */
      document.getElementById('modal-devis-btn').addEventListener('click', () => {
        selectModelInForm(name);
        closeModal();
        scrollToForm();
      });

      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        modal.style.opacity = '1';
        modal.querySelector('.modal-box').style.transform = 'scale(1)';
      });
    });
  });

  /* Boutons "Devis" sur les cartes → pré-sélectionnent le modèle dans le formulaire */
  document.querySelectorAll('.pool-card .devis-link').forEach(link => {
    link.addEventListener('click', () => {
      const card = link.closest('.pool-card');
      selectModelInForm(card.dataset.name);
    });
  });
}

/* ---- Hero typing animation ---- */
const heroSubtitle = document.getElementById('hero-subtitle');
if (heroSubtitle) {
  const texts = [
    'Experts en pose de piscines coque polyester',
    'Aménagements de jardins premium',
    'Votre espace détente sur mesure',
    'Devis gratuit sous 48h'
  ];
  let currentIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let isPaused = false;

  function typeText() {
    const current = texts[currentIndex];

    if (!isDeleting) {
      heroSubtitle.textContent = current.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length) {
        isDeleting = true;
        isPaused = true;
        setTimeout(() => { isPaused = false; }, 2500);
      }
    } else {
      heroSubtitle.textContent = current.slice(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        isDeleting = false;
        currentIndex = (currentIndex + 1) % texts.length;
      }
    }

    if (!isPaused) {
      const delay = isDeleting ? 40 : 80;
      setTimeout(typeText, delay);
    } else {
      setTimeout(typeText, 100);
    }
  }

  setTimeout(typeText, 800);
}

/* ---- Year in footer ---- */
document.querySelectorAll('.current-year').forEach(el => {
  el.textContent = new Date().getFullYear();
});

/* ---- Character counters for textareas ---- */
function setupCharCounter(textareaId, counterId, max) {
  const ta  = document.getElementById(textareaId);
  const cnt = document.getElementById(counterId);
  if (!ta || !cnt) return;

  function update() {
    const len = ta.value.length;
    cnt.textContent = len + ' / ' + max + ' caractères';
    cnt.classList.remove('warning', 'danger');
    if (len >= max * 0.9) {
      cnt.classList.add('danger');
    } else if (len >= max * 0.75) {
      cnt.classList.add('warning');
    }
  }

  ta.addEventListener('input', update);
  update(); // init
}

setupCharCounter('msg-devis',    'cnt-devis',    500);
setupCharCounter('msg-contact',  'cnt-contact',  1000);
setupCharCounter('msg-piscines', 'cnt-piscines', 600);
