/* ========================================
   JABR Publication Consultancy
   Frontend JavaScript v3.0 -- Performance Optimised
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ---- Preloader ----
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => preloader?.classList.add('hidden'), 1800);
    });
    setTimeout(() => preloader?.classList.add('hidden'), 3500);

    // ================================================================
    // MERGED SCROLL HANDLER - single rAF-throttled listener
    // ================================================================
    const scrollProgress = document.getElementById('scrollProgress');
    const navbar         = document.getElementById('navbar');
    const backToTop      = document.getElementById('backToTop');
    const sections       = document.querySelectorAll('section[id]');
    const navAnchors     = document.querySelectorAll('.nav-links a');

    let rafPending = false;
    let sectionCache = [];
    let currentActiveLink = null;

    function cacheSections() {
        sectionCache = Array.from(sections).map(sec => ({
            link: document.querySelector('.nav-links a[href="#' + sec.id + '"]'),
            top: sec.offsetTop,
            height: sec.offsetHeight
        }));
    }
    cacheSections();
    window.addEventListener('resize', cacheSections, { passive: true });
    window.addEventListener('load',   cacheSections, { passive: true });

    function onScroll() {
        if (rafPending) return;
        rafPending = true;
        requestAnimationFrame(() => {
            rafPending = false;
            const scrollY = window.scrollY;
            const docH    = document.documentElement.scrollHeight - window.innerHeight;

            if (scrollProgress && docH > 0) {
                const targetW = (scrollY / docH * 100) + '%';
                if (scrollProgress.style.width !== targetW) {
                    scrollProgress.style.width = targetW;
                }
            }

            const isScrolled = scrollY > 20;
            if (navbar && navbar.classList.contains('scrolled') !== isScrolled) {
                navbar.classList.toggle('scrolled', isScrolled);
            }

            const isBTTVisible = scrollY > 500;
            if (backToTop && backToTop.classList.contains('visible') !== isBTTVisible) {
                backToTop.classList.toggle('visible', isBTTVisible);
            }

            const scrollPos = scrollY + 120;
            let activeSec = null;
            for (let i = 0; i < sectionCache.length; i++) {
                const sec = sectionCache[i];
                if (scrollPos >= sec.top && scrollPos < sec.top + sec.height) {
                    activeSec = sec;
                    break;
                }
            }

            if (activeSec && activeSec.link !== currentActiveLink) {
                if (currentActiveLink) currentActiveLink.classList.remove('active');
                activeSec.link?.classList.add('active');
                currentActiveLink = activeSec.link;
            }
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // ---- Mobile toggle ----
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks     = document.getElementById('navLinks');
    mobileToggle?.addEventListener('click', () => {
        navLinks?.classList.toggle('open');
        mobileToggle.classList.toggle('active');
    });
    document.querySelectorAll('.nav-links a').forEach(a => {
        a.addEventListener('click', () => {
            navLinks?.classList.remove('open');
            mobileToggle?.classList.remove('active');
        });
    });

    // ---- Typing Text ----
    const typingEl = document.getElementById('typingText');
    if (typingEl) {
        const words = ['Ambitious Scholars', 'PhD Researchers', 'Global Academics', 'Emerging Scientists', 'University Faculty'];
        let wordIdx = 0;
        let charIdx = 0;
        let isDeleting = false;
        let typingTimer = null;
        let isTypingVisible = true;

        const heroSection = document.getElementById('home');
        if (heroSection && 'IntersectionObserver' in window) {
            const typingObserver = new IntersectionObserver((entries) => {
                isTypingVisible = entries[0]?.isIntersecting ?? true;
            }, { threshold: 0.1 });
            typingObserver.observe(heroSection);
        }

        const updateCursor = () => {
            typingEl.classList.toggle('cursor-visible', Math.floor(Date.now() / 500) % 2 === 0);
        };

        const typeText = () => {
            if (!isTypingVisible) {
                typingTimer = window.setTimeout(typeText, 220);
                return;
            }

            const current = words[wordIdx];
            if (!isDeleting) {
                charIdx++;
                typingEl.textContent = current.substring(0, charIdx);
                if (charIdx === current.length) {
                    isDeleting = true;
                    typingTimer = window.setTimeout(typeText, 2200);
                    return;
                }
            } else {
                charIdx--;
                typingEl.textContent = current.substring(0, charIdx);
                if (charIdx === 0) {
                    isDeleting = false;
                    wordIdx = (wordIdx + 1) % words.length;
                    typingTimer = window.setTimeout(typeText, 800);
                    return;
                }
            }

            typingTimer = window.setTimeout(typeText, isDeleting ? 45 : 85);
        };

        updateCursor();
        setInterval(updateCursor, 500);
        typeText();
    }

    // ---- Count-Up Animation ----
    const statNumbers = document.querySelectorAll('.stat-number');
    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el     = entry.target;
            const target = parseInt(el.dataset.target);
            const start  = performance.now();
            const dur    = 1800;
            function animate(now) {
                const p = Math.min((now - start) / dur, 1);
                el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
                if (p < 1) requestAnimationFrame(animate);
            }
            requestAnimationFrame(animate);
            const barFill = el.closest('.stat-card')?.querySelector('.stat-bar-fill');
            if (barFill) setTimeout(() => { barFill.style.width = barFill.dataset.width + '%'; }, 300);
            countObserver.unobserve(el);
        });
    }, { threshold: 0.15 });
    statNumbers.forEach(n => countObserver.observe(n));

    // ---- Service Cards Scroll Animation ----
    const serviceCards = document.querySelectorAll('.service-card');
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('visible'), i * 80);
                cardObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    serviceCards.forEach(c => cardObserver.observe(c));

    // ---- Timeline Animation ----
    const timelineItems = document.querySelectorAll('.timeline-h-item');
    const timelineFill  = document.getElementById('timelineHFill');
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                timelineItems.forEach((item, i) => setTimeout(() => item.classList.add('visible'), i * 200));
                if (timelineFill) setTimeout(() => { timelineFill.style.width = '100%'; }, 200);
                timelineObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    if (timelineItems.length > 0)
        timelineObserver.observe(timelineItems[0].closest('.timeline-horizontal'));

    // ---- FAQ Accordion ----
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item     = btn.closest('.faq-item');
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });

    // ---- Global Map SVG (CSS-animated only, no SMIL, 4 pulsing rings max) ----
    const mapContainer = document.getElementById('globalMap');
    if (mapContainer) {
        const locations = [
            { name: 'India',        cx: 540, cy: 145, r: 6, pulse: true  },
            { name: 'UAE',          cx: 480, cy: 135, r: 5, pulse: true  },
            { name: 'Saudi Arabia', cx: 460, cy: 130, r: 5, pulse: false },
            { name: 'Singapore',    cx: 590, cy: 175, r: 4, pulse: false },
            { name: 'Malaysia',     cx: 585, cy: 170, r: 4, pulse: false },
            { name: 'UK',           cx: 370, cy: 75,  r: 5, pulse: true  },
            { name: 'Germany',      cx: 395, cy: 80,  r: 4, pulse: false },
            { name: 'Egypt',        cx: 430, cy: 125, r: 5, pulse: false },
            { name: 'USA',          cx: 180, cy: 100, r: 5, pulse: true  },
            { name: 'Canada',       cx: 175, cy: 75,  r: 4, pulse: false },
            { name: 'Japan',        cx: 650, cy: 105, r: 4, pulse: false },
            { name: 'China',        cx: 610, cy: 115, r: 5, pulse: false },
            { name: 'France',       cx: 380, cy: 85,  r: 4, pulse: false },
            { name: 'Qatar',        cx: 475, cy: 132, r: 4, pulse: false },
            { name: 'Australia',    cx: 640, cy: 220, r: 4, pulse: false },
        ];

        let dots = '';
        locations.forEach(loc => {
            dots += loc.pulse
                ? '<circle cx="' + loc.cx + '" cy="' + loc.cy + '" r="' + (loc.r + 4) + '" fill="none" stroke="#0d9488" stroke-width="1.5" class="dot-ring" />'
                : '';
            dots += '<circle cx="' + loc.cx + '" cy="' + loc.cy + '" r="' + loc.r + '" fill="#0d9488" opacity="0.9"/>';
            dots += '<circle cx="' + loc.cx + '" cy="' + loc.cy + '" r="2.5" fill="#14b8a6"/>';
            dots += '<text x="' + loc.cx + '" y="' + (loc.cy - loc.r - 5) + '" text-anchor="middle" font-size="8" fill="#ffffff" font-family="Inter,sans-serif" font-weight="700">' + loc.name + '</text>';
        });

        const connections = [
            { from: 'India', to: 'UK' }, { from: 'India', to: 'USA' },
            { from: 'India', to: 'UAE' }, { from: 'India', to: 'Singapore' },
            { from: 'India', to: 'Australia' }, { from: 'India', to: 'Japan' },
            { from: 'India', to: 'Saudi Arabia' }
        ];
        let linesSvg = '';
        connections.forEach(conn => {
            const f = locations.find(l => l.name === conn.from);
            const t = locations.find(l => l.name === conn.to);
            if (f && t) {
                const mx = (f.cx + t.cx) / 2;
                const my = (f.cy + t.cy) / 2 - 30;
                linesSvg += '<path d="M ' + f.cx + ' ' + f.cy + ' Q ' + mx + ' ' + my + ' ' + t.cx + ' ' + t.cy + '" class="connection-line" />';
            }
        });

        mapContainer.innerHTML =
            '<svg viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg" class="map-svg">' +
            '<defs><style>' +
            '.map-grid-line{stroke:rgba(255,255,255,0.08);stroke-width:0.5;stroke-dasharray:4,4;}' +
            '.connection-line{stroke:#e0b840;stroke-width:1.5;stroke-dasharray:6,4;fill:none;opacity:0.6;animation:connectionFlow 30s linear infinite;will-change:stroke-dashoffset;}' +
            '@keyframes connectionFlow{to{stroke-dashoffset:-500;}}' +
            '.dot-ring{animation:dotPulse 2.8s ease-out infinite;will-change:opacity;}' +
            '@keyframes dotPulse{0%{r:4;opacity:0.8;}70%{r:11;opacity:0;}100%{r:11;opacity:0;}}' +
            '</style></defs>' +
            '<line x1="20" y1="150" x2="780" y2="150" class="map-grid-line"/>' +
            '<line x1="400" y1="20" x2="400" y2="280" class="map-grid-line"/>' +
            '<line x1="200" y1="20" x2="200" y2="280" class="map-grid-line"/>' +
            '<line x1="600" y1="20" x2="600" y2="280" class="map-grid-line"/>' +
            '<line x1="20" y1="80" x2="780" y2="80" class="map-grid-line"/>' +
            '<line x1="20" y1="220" x2="780" y2="220" class="map-grid-line"/>' +
            linesSvg + dots + '</svg>';
    }

    // ================================================================
    // EMAILJS CONTACT FORM
    // ================================================================
    const EMAILJS_CONFIG = {
        publicKey:  'cEsQcXQnUSyKhV9Yg',
        serviceId:  'service_jabr',
        templateId: 'template_ekyfz1q'
    };
    if (typeof emailjs !== 'undefined') emailjs.init(EMAILJS_CONFIG.publicKey);

    function validateForm(formData) {
        const errors = [];
        if (!formData.get('fullName')?.trim()) errors.push('Full name is required');
        if (!formData.get('email')?.trim()) errors.push('Email is required');
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.get('email'))) errors.push('Invalid email format');
        if (!formData.get('country')?.trim()) errors.push('Country is required');
        if (!formData.get('service')?.trim()) errors.push('Please select a service');
        return errors;
    }

    function setupContactForm() {
        const contactForm = document.getElementById('contactForm');
        const submitBtn   = document.getElementById('submitBtn');
        const formSuccess = document.getElementById('formSuccess');
        if (!contactForm) return;

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const errs = validateForm(formData);
            if (errs.length) { alert('Please fix:\n\n' + errs.join('\n')); return; }

            let dateInput = contactForm.querySelector('input[name="submissionDate"]');
            if (!dateInput) {
                dateInput = document.createElement('input');
                dateInput.type = 'hidden'; dateInput.name = 'submissionDate';
                contactForm.appendChild(dateInput);
            }
            dateInput.value = new Date().toLocaleString();

            let msInput = contactForm.querySelector('input[name="manuscriptName"]');
            if (!msInput) {
                msInput = document.createElement('input');
                msInput.type = 'hidden'; msInput.name = 'manuscriptName';
                contactForm.appendChild(msInput);
            }
            msInput.value = 'N/A';

            submitBtn.disabled = true;
            const btnText   = submitBtn.querySelector('.btn-text');
            const btnLoader = submitBtn.querySelector('.btn-loader');
            if (btnText)   btnText.style.display   = 'none';
            if (btnLoader) btnLoader.style.display = 'inline';

            try {
                if (typeof emailjs === 'undefined') throw new Error('EmailJS SDK not loaded.');
                await emailjs.sendForm(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, contactForm, { publicKey: EMAILJS_CONFIG.publicKey });
                formSuccess?.classList.add('active');
                contactForm.reset();
                setTimeout(() => formSuccess?.classList.remove('active'), 5000);
            } catch (err) {
                console.error(err);
                alert('An error occurred. Please try again or contact us at +91 8309992766');
            } finally {
                submitBtn.disabled = false;
                if (btnText)   btnText.style.display   = 'inline';
                if (btnLoader) btnLoader.style.display = 'none';
            }
        });
    }
    setupContactForm();

    // ---- General scroll-reveal ----
    const revealElements = document.querySelectorAll(
        '.section-header, .about-feature, .feature-box, .region-card, .faq-item, .team-card, .partner-card, .contact-info-card, .review-card'
    );
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                target.style.opacity   = '1';
                target.style.transform = 'translateY(0)';
                
                // Free GPU compositing memory after animation completes
                target.addEventListener('transitionend', function handler() {
                    target.style.transition = '';
                    target.style.willChange = '';
                    target.removeEventListener('transitionend', handler);
                }, { once: true });

                revealObserver.unobserve(target);
            }
        });
    }, { threshold: 0.08 });

    revealElements.forEach(el => {
        el.style.opacity    = '0';
        el.style.transform  = 'translateY(18px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        el.style.willChange = 'opacity, transform';
        revealObserver.observe(el);
    });
});
