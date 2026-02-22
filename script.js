/* ========================================
   JABR Publication Consultancy
   Frontend JavaScript v2.0
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ---- Preloader ----
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => preloader?.classList.add('hidden'), 2200);
    });
    // Fallback
    setTimeout(() => preloader?.classList.add('hidden'), 4000);

    // ---- Cursor Glow ----
    const cursorGlow = document.getElementById('cursorGlow');
    if (cursorGlow && window.innerWidth > 768) {
        document.addEventListener('mousemove', e => {
            cursorGlow.style.left = e.clientX + 'px';
            cursorGlow.style.top = e.clientY + 'px';
        });
    }

    // ---- Scroll Progress ----
    const scrollProgress = document.getElementById('scrollProgress');
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollProgress && docH > 0) {
            scrollProgress.style.width = (scrollTop / docH * 100) + '%';
        }
    });

    // ---- Navbar scroll effect ----
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar?.classList.toggle('scrolled', window.scrollY > 20);
    });

    // ---- Mobile toggle ----
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');
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

    // ---- Active nav link on scroll ----
    const sections = document.querySelectorAll('section[id]');
    const navAnchors = document.querySelectorAll('.nav-links a');
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY + 120;
        sections.forEach(sec => {
            const top = sec.offsetTop;
            const height = sec.offsetHeight;
            const id = sec.getAttribute('id');
            const link = document.querySelector(`.nav-links a[href="#${id}"]`);
            if (scrollY >= top && scrollY < top + height) {
                navAnchors.forEach(a => a.classList.remove('active'));
                link?.classList.add('active');
            }
        });
    });

    // ---- Hero Particles Canvas ----
    const canvas = document.getElementById('heroParticles');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const resize = () => {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.speedY = (Math.random() - 0.5) * 0.3;
                this.opacity = Math.random() * 0.4 + 0.1;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(59, 130, 246, ${this.opacity})`;
                ctx.fill();
            }
        }

        const count = Math.min(80, Math.floor(canvas.width * canvas.height / 12000));
        for (let i = 0; i < count; i++) particles.push(new Particle());

        function drawLines() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(59, 130, 246, ${0.06 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            drawLines();
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }

    // ---- Typing Text ----
    const typingEl = document.getElementById('typingText');
    if (typingEl) {
        const words = ['Ambitious Scholars', 'PhD Researchers', 'Global Academics', 'Emerging Scientists', 'University Faculty'];
        let wordIdx = 0, charIdx = 0, isDeleting = false;
        function type() {
            const current = words[wordIdx];
            if (!isDeleting) {
                typingEl.textContent = current.substring(0, charIdx + 1);
                charIdx++;
                if (charIdx === current.length) {
                    isDeleting = true;
                    setTimeout(type, 2000);
                    return;
                }
                setTimeout(type, 80);
            } else {
                typingEl.textContent = current.substring(0, charIdx);
                charIdx--;
                if (charIdx < 0) {
                    isDeleting = false;
                    charIdx = 0;
                    wordIdx = (wordIdx + 1) % words.length;
                    setTimeout(type, 400);
                    return;
                }
                setTimeout(type, 40);
            }
        }
        setTimeout(type, 1000);
    }

    // ---- Count-Up Animation ----
    const statNumbers = document.querySelectorAll('.stat-number');
    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target);
                const duration = 2000;
                const start = performance.now();
                function animate(now) {
                    const elapsed = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    el.textContent = Math.floor(eased * target);
                    if (progress < 1) requestAnimationFrame(animate);
                }
                requestAnimationFrame(animate);

                // Animate stat bars
                const card = el.closest('.stat-card');
                const barFill = card?.querySelector('.stat-bar-fill');
                if (barFill) {
                    setTimeout(() => { barFill.style.width = barFill.dataset.width + '%'; }, 300);
                }

                countObserver.unobserve(el);
            }
        });
    }, { threshold: 0.4 });
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
    }, { threshold: 0.15 });
    serviceCards.forEach(c => cardObserver.observe(c));

    // ---- Timeline Animation ----
    const timelineItems = document.querySelectorAll('.timeline-h-item');
    const timelineFill = document.getElementById('timelineHFill');
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                timelineItems.forEach((item, i) => {
                    setTimeout(() => item.classList.add('visible'), i * 200);
                });
                if (timelineFill) {
                    setTimeout(() => { timelineFill.style.width = '100%'; }, 200);
                }
                timelineObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    if (timelineItems.length > 0) {
        timelineObserver.observe(timelineItems[0].closest('.timeline-horizontal'));
    }

    // ---- Testimonial Slider ----
    const track = document.getElementById('testimonialTrack');
    const dotsContainer = document.getElementById('testimonialDots');
    const prevBtn = document.getElementById('prevTestimonial');
    const nextBtn = document.getElementById('nextTestimonial');
    if (track) {
        const cards = track.querySelectorAll('.testimonial-card');
        let currentSlide = 0;
        const totalSlides = cards.length;

        // Create dots
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer?.appendChild(dot);
        }

        function goToSlide(n) {
            currentSlide = n;
            track.style.transform = `translateX(-${currentSlide * 100}%)`;
            document.querySelectorAll('.testimonial-dots .dot').forEach((d, i) => {
                d.classList.toggle('active', i === currentSlide);
            });
        }
        prevBtn?.addEventListener('click', () => goToSlide((currentSlide - 1 + totalSlides) % totalSlides));
        nextBtn?.addEventListener('click', () => goToSlide((currentSlide + 1) % totalSlides));

        // Auto advance
        let autoSlide = setInterval(() => goToSlide((currentSlide + 1) % totalSlides), 5000);
        track.closest('.testimonial-slider')?.addEventListener('mouseenter', () => clearInterval(autoSlide));
        track.closest('.testimonial-slider')?.addEventListener('mouseleave', () => {
            autoSlide = setInterval(() => goToSlide((currentSlide + 1) % totalSlides), 5000);
        });
    }

    // ---- FAQ Accordion ----
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });

    // ---- Global Map SVG ----
    const mapContainer = document.getElementById('globalMap');
    if (mapContainer) {
        const locations = [
            { name: 'India', cx: 540, cy: 145, r: 6 },
            { name: 'UAE', cx: 480, cy: 135, r: 5 },
            { name: 'Saudi Arabia', cx: 460, cy: 130, r: 5 },
            { name: 'Singapore', cx: 590, cy: 175, r: 4 },
            { name: 'Malaysia', cx: 585, cy: 170, r: 4 },
            { name: 'UK', cx: 370, cy: 75, r: 5 },
            { name: 'Germany', cx: 395, cy: 80, r: 4 },
            { name: 'Egypt', cx: 430, cy: 125, r: 5 },
            { name: 'USA', cx: 180, cy: 100, r: 5 },
            { name: 'Canada', cx: 175, cy: 75, r: 4 },
            { name: 'Japan', cx: 650, cy: 105, r: 4 },
            { name: 'China', cx: 610, cy: 115, r: 5 },
            { name: 'France', cx: 380, cy: 85, r: 4 },
            { name: 'Qatar', cx: 475, cy: 132, r: 4 },
            { name: 'Australia', cx: 640, cy: 220, r: 4 },
        ];

        let dots = '';
        locations.forEach((loc, i) => {
            dots += `
        <circle cx="${loc.cx}" cy="${loc.cy}" r="${loc.r}" fill="#0d9488" opacity="0.8">
          <animate attributeName="r" values="${loc.r};${loc.r + 3};${loc.r}" dur="${2 + i * 0.3}s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="${2 + i * 0.3}s" repeatCount="indefinite"/>
        </circle>
        <circle cx="${loc.cx}" cy="${loc.cy}" r="2" fill="#14b8a6"/>
        <text x="${loc.cx}" y="${loc.cy - loc.r - 6}" text-anchor="middle" font-size="8" fill="#475569" font-family="Inter, sans-serif" font-weight="600">${loc.name}</text>
      `;
        });

        mapContainer.innerHTML = `
      <svg viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="mapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#e2e8f0;stop-opacity:0.3"/>
            <stop offset="100%" style="stop-color:#f1f5f9;stop-opacity:0.5"/>
          </linearGradient>
        </defs>
        <!-- Simplified world outline -->
        <ellipse cx="400" cy="150" rx="380" ry="130" fill="url(#mapGrad)" stroke="#e2e8f0" stroke-width="1"/>
        <!-- Grid lines -->
        <line x1="20" y1="150" x2="780" y2="150" stroke="#e2e8f0" stroke-width="0.5" stroke-dasharray="4,4"/>
        <line x1="400" y1="20" x2="400" y2="280" stroke="#e2e8f0" stroke-width="0.5" stroke-dasharray="4,4"/>
        <line x1="200" y1="20" x2="200" y2="280" stroke="#e2e8f0" stroke-width="0.3" stroke-dasharray="4,4"/>
        <line x1="600" y1="20" x2="600" y2="280" stroke="#e2e8f0" stroke-width="0.3" stroke-dasharray="4,4"/>
        <line x1="20" y1="80" x2="780" y2="80" stroke="#e2e8f0" stroke-width="0.3" stroke-dasharray="4,4"/>
        <line x1="20" y1="220" x2="780" y2="220" stroke="#e2e8f0" stroke-width="0.3" stroke-dasharray="4,4"/>
        ${dots}
      </svg>
    `;
    }

    // ---- Contact Form ----
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    const submitBtn = document.getElementById('submitBtn');

    contactForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';
        submitBtn.disabled = true;

        try {
            const formData = new FormData(contactForm);
            const response = await fetch('/api/contact', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                formSuccess?.classList.add('active');
                contactForm.reset();
                document.getElementById('fileName').textContent = 'No file chosen';
            } else {
                // Fallback: just show success for demo
                formSuccess?.classList.add('active');
                contactForm.reset();
            }
        } catch (err) {
            // If backend not available, show success anyway for demo
            formSuccess?.classList.add('active');
            contactForm.reset();
        }

        btnText.style.display = 'inline-flex';
        btnLoader.style.display = 'none';
        submitBtn.disabled = false;
    });

    // ---- File Upload Name ----
    const fileInput = document.getElementById('manuscript');
    const fileNameDisplay = document.getElementById('fileName');
    fileInput?.addEventListener('change', () => {
        fileNameDisplay.textContent = fileInput.files[0]?.name || 'No file chosen';
    });

    // ---- Newsletter Form ----
    const newsletterForm = document.getElementById('newsletterForm');
    newsletterForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = newsletterForm.querySelector('input');
        const email = emailInput?.value;
        try {
            await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
        } catch (err) { /* demo fallback */ }
        emailInput.value = '';
        alert('Thank you for subscribing!');
    });

    // ---- Back to Top ----
    const backToTop = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        backToTop?.classList.toggle('visible', window.scrollY > 500);
    });
    backToTop?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ---- General scroll-reveal for sections ----
    const revealElements = document.querySelectorAll('.section-header, .about-feature, .feature-box, .blog-card, .region-card, .faq-item');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        revealObserver.observe(el);
    });
});
