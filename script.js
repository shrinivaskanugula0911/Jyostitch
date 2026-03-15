document.addEventListener('DOMContentLoaded', () => {
    
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });

        // Close menu when a link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            });
        });
    }

    // Intersection Observer for scroll animations
    const animationElements = document.querySelectorAll('.animate-on-scroll');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const animationObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('scrolled-in');
                // Optional: stop observing once animated
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animationElements.forEach(el => {
        animationObserver.observe(el);
    });

    // File input custom logic
    const fileInput = document.getElementById('imageUpload');
    const fileNameDisplay = document.getElementById('fileName');

    if (fileInput && fileNameDisplay) {
        fileInput.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                fileNameDisplay.textContent = this.files[0].name;
            } else {
                fileNameDisplay.textContent = 'No file chosen';
            }
        });
    }

    // Form submission mock
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = orderForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending Magic...';
            btn.style.opacity = '0.8';
            
            // Mock API delay
            setTimeout(() => {
                btn.innerHTML = '<i class="fa-solid fa-check"></i> Magic Sent!';
                btn.style.background = 'var(--mint)';
                orderForm.reset();
                fileNameDisplay.textContent = 'No file chosen';
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.style.opacity = '1';
                }, 3000);
            }, 1500);
        });
    }

    // Smooth scroll for nav links (accounting for header height)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = window.innerWidth <= 768 ? 70 : 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ─────────────────────────────────────────────
    //  Apple / Framer-style Gallery Scroll Stack
    // ─────────────────────────────────────────────
    const galleryScene = document.querySelector('.gallery-scene');
    const gcards = document.querySelectorAll('.gcard');

    if (galleryScene && gcards.length) {
        const N = gcards.length;

        // Ease function: smooth step (ease-in-out)
        function easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        // Clamp helper
        function clamp(val, min, max) {
            return Math.min(Math.max(val, min), max);
        }

        function updateGallery() {
            const rect = galleryScene.getBoundingClientRect();
            const sceneTop = rect.top;          // negative when scrolled past
            const sceneHeight = rect.height;    // full scroll travel

            // Total scrollable travel within the scene
            const totalTravel = sceneHeight - window.innerHeight;

            // How far we've scrolled INTO the scene (clamped 0 → totalTravel)
            const scrolled = clamp(-sceneTop, 0, totalTravel);

            // Each card gets an equal "slot" of scroll travel
            const slotSize = totalTravel / N;

            gcards.forEach((card, i) => {
                const slotStart = i * slotSize;
                const slotEnd   = (i + 1) * slotSize;

                // Progress [0→1] within THIS card's appear slot
                const rawEnter = clamp((scrolled - slotStart) / slotSize, 0, 1);
                const enter    = easeInOutCubic(rawEnter);

                // How far through the NEXT card's slot (i.e. how much this card is pushed behind)
                const nextSlotStart = (i + 1) * slotSize;
                const rawPush = clamp((scrolled - nextSlotStart) / slotSize, 0, 1);
                const push    = easeInOutCubic(rawPush);

                let translateY, scale, zIndex;

                if (scrolled < slotStart) {
                    // ── Upcoming: card is below the stack, hidden
                    translateY = 80;
                    scale      = 0.92;
                    card.style.opacity = '0';
                    card.style.zIndex  = 10 + i;

                } else if (scrolled >= slotStart && scrolled < slotEnd) {
                    // ── Entering: card slides up from below into view
                    translateY = 80 * (1 - enter);          // 80px → 0
                    scale      = 0.92 + 0.08 * enter;        // 0.92 → 1.0
                    card.style.opacity = String(clamp(enter * 3, 0, 1)); // quick fade-in
                    card.style.zIndex  = 10 + i;

                } else {
                    // ── Active / being pushed behind by next card
                    // Stack scale: each successive card behind scales down a bit more
                    const baseScale = 1 - push * 0.06;      // 1.0 → 0.94
                    translateY = -push * 10;                  // slight upward drift
                    scale      = baseScale;
                    card.style.opacity = '1';
                    card.style.zIndex  = 10 + i;
                }

                card.style.transform = `translateY(${translateY}px) scale(${scale})`;
            });
        }

        // Use rAF for butter-smooth updates
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    updateGallery();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        // Run once on load to set initial state
        updateGallery();
    }
});
