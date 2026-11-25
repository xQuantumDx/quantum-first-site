/**
 * Quantum First - Landing Page JavaScript
 * Handles animations, interactions, and dynamic effects
 */

(function() {
    'use strict';

    // ==========================================================================
    // Utility Functions
    // ==========================================================================
    const $ = (selector, context = document) => context.querySelector(selector);
    const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const lerp = (start, end, factor) => start + (end - start) * factor;

    // ==========================================================================
    // Background Canvas - Particle System
    // ==========================================================================
    class ParticleSystem {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.particles = [];
            this.mouse = { x: 0, y: 0 };
            this.animationId = null;
            this.resize();
            this.init();
            this.bindEvents();
            this.animate();
        }

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.centerX = this.canvas.width / 2;
            this.centerY = this.canvas.height / 2;
        }

        init() {
            const particleCount = Math.min(150, Math.floor((this.canvas.width * this.canvas.height) / 15000));
            this.particles = [];

            for (let i = 0; i < particleCount; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    radius: Math.random() * 1.5 + 0.5,
                    opacity: Math.random() * 0.5 + 0.1,
                    color: this.getRandomColor()
                });
            }
        }

        getRandomColor() {
            const colors = [
                'rgba(88, 166, 255, ',
                'rgba(163, 113, 247, ',
                'rgba(247, 129, 102, ',
                'rgba(63, 185, 80, '
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        }

        bindEvents() {
            window.addEventListener('resize', () => this.resize());
            
            document.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });

            // Pause when tab is hidden
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    cancelAnimationFrame(this.animationId);
                } else {
                    this.animate();
                }
            });
        }

        update() {
            this.particles.forEach(particle => {
                // Mouse attraction
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 200 && dist > 0) {
                    const force = (200 - dist) / 200 * 0.02;
                    particle.vx += (dx / dist) * force;
                    particle.vy += (dy / dist) * force;
                }

                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;

                // Damping
                particle.vx *= 0.99;
                particle.vy *= 0.99;

                // Wrap around edges
                if (particle.x < 0) particle.x = this.canvas.width;
                if (particle.x > this.canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = this.canvas.height;
                if (particle.y > this.canvas.height) particle.y = 0;

                // Connect nearby particles
                this.particles.forEach(other => {
                    if (particle === other) return;
                    const dx = other.x - particle.x;
                    const dy = other.y - particle.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < 120) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(particle.x, particle.y);
                        this.ctx.lineTo(other.x, other.y);
                        this.ctx.strokeStyle = `rgba(88, 166, 255, ${0.05 * (1 - dist / 120)})`;
                        this.ctx.lineWidth = 0.5;
                        this.ctx.stroke();
                    }
                });
            });
        }

        draw() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.particles.forEach(particle => {
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = particle.color + particle.opacity + ')';
                this.ctx.fill();
            });
        }

        animate() {
            this.update();
            this.draw();
            this.animationId = requestAnimationFrame(() => this.animate());
        }

        destroy() {
            cancelAnimationFrame(this.animationId);
        }
    }

    // ==========================================================================
    // Counter Animation
    // ==========================================================================
    function animateCounters() {
        const counters = $$('[data-count]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseFloat(el.dataset.count);
                    const duration = 2000;
                    const startTime = performance.now();
                    
                    function updateCounter(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
                        const current = target * eased;
                        
                        // Format based on whether it's a decimal
                        if (target % 1 !== 0) {
                            el.textContent = current.toFixed(1);
                        } else {
                            el.textContent = Math.floor(current).toLocaleString();
                        }
                        
                        if (progress < 1) {
                            requestAnimationFrame(updateCounter);
                        } else {
                            el.textContent = target % 1 !== 0 ? target.toFixed(1) : target.toLocaleString();
                        }
                    }
                    
                    requestAnimationFrame(updateCounter);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    }

    // ==========================================================================
    // Scroll Reveal
    // ==========================================================================
    function initScrollReveal() {
        const reveals = $$('.reveal, .feature-card, .spec-category, .value, .metric-card, .float-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        reveals.forEach(el => observer.observe(el));
    }

    // ==========================================================================
    // Nav Scroll Effect
    // ==========================================================================
    function initNavScroll() {
        const nav = $('.nav');
        let lastScroll = 0;
        let ticking = false;

        function updateNav() {
            const scrollY = window.scrollY;
            
            if (scrollY > 100) {
                nav.style.background = 'rgba(8, 10, 15, 0.95)';
                nav.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
            } else {
                nav.style.background = 'rgba(8, 10, 15, 0.8)';
                nav.style.boxShadow = 'none';
            }
            
            lastScroll = scrollY;
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateNav);
                ticking = true;
            }
        }, { passive: true });
    }

    // ==========================================================================
    // Mobile Nav Toggle
    // ==========================================================================
    function initMobileNav() {
        const toggle = $('.nav-toggle');
        const links = $('.nav-links');
        
        if (!toggle || !links) return;

        toggle.addEventListener('click', () => {
            const expanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', !expanded);
            links.style.display = expanded ? 'none' : 'flex';
            links.style.position = 'absolute';
            links.style.top = '100%';
            links.style.left = '0';
            links.style.right = '0';
            links.style.flexDirection = 'column';
            links.style.padding = 'var(--space-4) var(--container-padding)';
            links.style.background = 'var(--color-bg-elevated)';
            links.style.borderBottom = '1px solid var(--color-border)';
            links.style.gap = 'var(--space-4)';
        });

        // Close on link click
        $$('.nav-link', links).forEach(link => {
            link.addEventListener('click', () => {
                toggle.setAttribute('aria-expanded', 'false');
                links.style.display = 'none';
            });
        });
    }

    // ==========================================================================
    // Smooth Scroll for Anchor Links
    // ==========================================================================
    function initSmoothScroll() {
        $$('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const target = $(targetId);
                if (target) {
                    e.preventDefault();
                    const headerHeight = 72;
                    const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ==========================================================================
    // Form Handling
    // ==========================================================================
    function initForm() {
        const form = $('.contact-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = $('button[type="submit"]', form);
            const originalText = submitBtn.innerHTML;
            
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <svg class="spinner" viewBox="0 0 24 24" width="18" height="18" style="animation: spin 1s linear infinite;">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="30 100" stroke-linecap="round"/>
                </svg>
                <span>Sending...</span>
            `;
            
            // Add spinner animation
            const style = document.createElement('style');
            style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
            document.head.appendChild(style);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Success state
            submitBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>Request Sent!</span>
            `;
            submitBtn.style.background = 'var(--color-accent-success)';
            
            // Reset after 3 seconds
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                submitBtn.style.background = '';
                form.reset();
            }, 3000);
        });
    }

    // ==========================================================================
    // Chip Label Interaction
    // ==========================================================================
    function initChipLabels() {
        const labels = $$('.chip-label');
        const qubits = $$('.qubit');
        
        labels.forEach(label => {
            label.addEventListener('mouseenter', () => {
                const index = label.dataset.qubit;
                const qubit = qubits[index];
                if (qubit) {
                    qubit.style.filter = 'drop-shadow(0 0 16px rgba(88, 166, 255, 0.9))';
                    qubit.style.strokeWidth = '2.5';
                }
            });
            
            label.addEventListener('mouseleave', () => {
                const index = label.dataset.qubit;
                const qubit = qubits[index];
                if (qubit) {
                    qubit.style.filter = 'drop-shadow(0 0 8px rgba(88, 166, 255, 0.6))';
                    qubit.style.strokeWidth = '1.5';
                }
            });
        });
    }

    // ==========================================================================
    // Parallax Effect on Hero
    // ==========================================================================
    function initParallax() {
        const heroVisual = $('.hero-visual');
        if (!heroVisual) return;

        let ticking = false;

        function updateParallax() {
            const scrollY = window.scrollY;
            const heroHeight = $('.hero')?.offsetHeight || 0;
            
            if (scrollY < heroHeight) {
                const progress = scrollY / heroHeight;
                heroVisual.style.transform = `translateY(${progress * 100}px)`;
                heroVisual.style.opacity = 1 - progress * 0.5;
            }
            
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });
    }

    // ==========================================================================
    // Sphere Particles
    // ==========================================================================
    function initSphereParticles() {
        const container = $('#sphere-particles');
        if (!container) return;

        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                background: ${['#58a6ff', '#a371f7', '#f78166', '#3fb950'][Math.floor(Math.random() * 4)]};
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                opacity: ${Math.random() * 0.5 + 0.2};
                animation: sphereParticleFloat ${Math.random() * 4 + 3}s ease-in-out infinite;
                animation-delay: ${Math.random() * 2}s;
            `;
            container.appendChild(particle);
        }

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes sphereParticleFloat {
                0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
                25% { transform: translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px) scale(1.2); opacity: 0.6; }
                50% { transform: translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px) scale(0.8); opacity: 0.4; }
                75% { transform: translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px) scale(1.1); opacity: 0.5; }
            }
        `;
        document.head.appendChild(style);
    }

    // ==========================================================================
    // Initialize Everything
    // ==========================================================================
    function init() {
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (!prefersReducedMotion) {
            // Background particles
            const canvas = $('#bg-canvas');
            if (canvas) {
                new ParticleSystem(canvas);
            }
            
            // Sphere particles
            initSphereParticles();
            
            // Parallax
            initParallax();
        }
        
        // Always run these
        animateCounters();
        initScrollReveal();
        initNavScroll();
        initMobileNav();
        initSmoothScroll();
        initForm();
        initChipLabels();
        
        // Add reveal classes to elements
        $$('.feature-card, .spec-category, .value, .metric-card').forEach((el, i) => {
            el.classList.add('reveal');
            el.style.transitionDelay = `${i * 50}ms`;
        });
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();