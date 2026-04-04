// Optimized Intersection Observer for Scroll Animations
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
            if (entry.target.classList.contains('counter')) {
                animateCounter(entry.target);
            }
            // Once animated, no need to observe anymore
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('[data-aos], .counter, .section-fade').forEach(el => observer.observe(el));

// Counter Animation Logic with easing
function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'));
    const duration = 2500;
    const frameDuration = 1000 / 60;
    const totalFrames = Math.round(duration / frameDuration);
    let frame = 0;

    const count = () => {
        frame++;
        const progress = frame / totalFrames;
        const currentCount = Math.round(target * progress);

        if (frame < totalFrames) {
            el.innerText = currentCount.toLocaleString();
            requestAnimationFrame(count);
        } else {
            el.innerText = target.toLocaleString() + '+';
        }
    };

    requestAnimationFrame(count);
}

// Mobile Menu Logic
const mobileToggle = document.querySelector('.mobile-toggle');
const nav = document.querySelector('#main-nav');
const mainHeader = document.querySelector('#main-header');

if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
        const isOpen = mobileToggle.classList.toggle('open');
        nav.classList.toggle('active', isOpen);
        if (mainHeader) mainHeader.classList.toggle('nav-open', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu on link click
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('open');
            nav.classList.remove('active');
            if (mainHeader) mainHeader.classList.remove('nav-open');
            document.body.style.overflow = '';
        });
    });
}

// ─── Header Scroll Transition + Ribbon & Content Positioning ────────────────
const header      = document.querySelector('header');
const topBar      = document.querySelector('.top-bar');
const ribbon      = document.querySelector('.leadership-ribbon');
const pageSpacer  = document.getElementById('page-spacer');

let ribbonRaf    = null;
let ribbonUntil  = 0;
let lastScrolled = null;

function updateSpacer() {
    if (!ribbon || !pageSpacer) return;
    // Ribbon is position:fixed. At any scroll position,
    // getBoundingClientRect().bottom gives its viewport bottom.
    // The spacer height should equal the ribbon's viewport bottom
    // (how much space the fixed stack takes from the top of the page).
    // Since the spacer is at the top of document flow (scrollY=0 equivalent position),
    // its height = ribbon's viewport bottom position is always correct.
    const h = ribbon.getBoundingClientRect().bottom;
    pageSpacer.style.height = Math.max(0, h) + 'px';
}

function positionRibbon() {
    if (!header || !ribbon) return;
    const headerBottom = header.getBoundingClientRect().bottom;
    const tickerBottom = topBar ? topBar.getBoundingClientRect().bottom : 0;
    
    // Choose whichever stays lower to avoid overlap
    const finalTop = Math.max(0, headerBottom, tickerBottom);
    
    ribbon.style.setProperty('top', finalTop + 'px', 'important');
    updateSpacer();
}

function trackRibbonFor(ms) {
    ribbonUntil = Math.max(ribbonUntil, Date.now() + ms);
    if (ribbonRaf) return;
    (function loop() {
        positionRibbon();
        if (Date.now() < ribbonUntil) {
            ribbonRaf = requestAnimationFrame(loop);
        } else {
            ribbonRaf = null;
            positionRibbon(); // final snap
        }
    })();
}

const handleScroll = () => {
    // PREVENT GLITCH: If mobile nav is open, ignore scroll-based header/ribbon toggling
    if (nav && nav.classList.contains('active')) return;

    const isScrolled = window.scrollY > 50; /* Increased threshold for stability */
    if (isScrolled !== lastScrolled) {
        lastScrolled = isScrolled;
        if (isScrolled) {
            header.classList.add('scrolled');
            if (topBar) topBar.classList.add('hidden');
            if (ribbon) ribbon.classList.add('hidden');
            document.body.classList.add('body-scrolled');
        } else {
            header.classList.remove('scrolled');
            if (topBar) topBar.classList.remove('hidden');
            if (ribbon) ribbon.classList.remove('hidden');
            document.body.classList.remove('body-scrolled');
        }
        trackRibbonFor(600);
    }
};

window.addEventListener('scroll', handleScroll, { passive: true });
window.addEventListener('resize', () => trackRibbonFor(300));

handleScroll();
trackRibbonFor(1000);

// Immersive Hero Slider
const slides = document.querySelectorAll('.slide');
const prevBtn = document.querySelector('.prev-slide');
const nextBtn = document.querySelector('.next-slide');
const dotsContainer = document.querySelector('.slider-dots');
let currentSlide = 0;
let slideInterval;

if (slides.length > 0) {
    // Dynamically Create Dots
    slides.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            goToSlide(i);
            resetInterval();
        });
        if (dotsContainer) dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.dot');

    const goToSlide = (n) => {
        slides[currentSlide].classList.remove('active');
        if (dots[currentSlide]) dots[currentSlide].classList.remove('active');
        
        currentSlide = (n + slides.length) % slides.length;
        
        slides[currentSlide].classList.add('active');
        if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    };

    const nextSlide = () => goToSlide(currentSlide + 1);
    const prevSlide = () => goToSlide(currentSlide - 1);

    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetInterval(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetInterval(); });

    const startInterval = () => {
        slideInterval = setInterval(nextSlide, 8000);
    };

    const resetInterval = () => {
        clearInterval(slideInterval);
        startInterval();
    };

    startInterval();
}

// Smooth Scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            e.preventDefault();
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Gallery Filtering & Lightbox logic
const initGallery = () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox ? lightbox.querySelector('img') : null;

    if (tabBtns.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const category = btn.getAttribute('data-category');
                
                galleryItems.forEach(item => {
                    item.style.transition = 'all 0.5s ease';
                    if (category === 'all' || item.classList.contains(category)) {
                        item.style.display = 'block';
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'scale(1)';
                        }, 10);
                    } else {
                        item.style.opacity = '0';
                        item.style.transform = 'scale(0.8)';
                        setTimeout(() => {
                            item.style.display = 'none';
                        }, 500);
                    }
                });
            });
        });
    }

    if (lightbox) {
        const lbTrack = document.getElementById('lb-track');
        const lbPrev = document.getElementById('lb-prev');
        const lbNext = document.getElementById('lb-next');
        const lbDots = document.getElementById('lb-dots');
        const lbTitle = document.getElementById('lightbox-title');
        const lbDesc = document.getElementById('lightbox-desc');
        
        let currentLbIndex = 0;
        let lbImages = [];

        const closeLightbox = () => {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto';
        };

        const updateLbPosition = () => {
            lbTrack.style.transform = `translateX(-${currentLbIndex * 100}%)`;
            const dots = lbDots.querySelectorAll('.lb-dot');
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentLbIndex);
            });
        };

        const renderLbSlider = () => {
            lbTrack.innerHTML = lbImages.map(src => `<img src="${src}" alt="Gallery Detail">`).join('');
            lbDots.innerHTML = lbImages.map((_, i) => `<div class="lb-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`).join('');
            updateLbPosition();
        };

        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const mainImg = item.querySelector('img').src;
                const titleText = item.querySelector('h4') ? item.querySelector('h4').textContent : '';
                const descText = item.querySelector('p') ? item.querySelector('p').textContent : '';
                
                lbImages = [mainImg, mainImg, mainImg]; 

                currentLbIndex = 0;
                lbTitle.textContent = titleText;
                lbDesc.textContent = descText;
                
                renderLbSlider();
                lightbox.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            });
        });

        if (lbPrev) lbPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            currentLbIndex = (currentLbIndex > 0) ? currentLbIndex - 1 : lbImages.length - 1;
            updateLbPosition();
        });

        if (lbNext) lbNext.addEventListener('click', (e) => {
            e.stopPropagation();
            currentLbIndex = (currentLbIndex < lbImages.length - 1) ? currentLbIndex + 1 : 0;
            updateLbPosition();
        });

        if (lbDots) lbDots.addEventListener('click', (e) => {
            if (e.target.classList.contains('lb-dot')) {
                e.stopPropagation();
                currentLbIndex = parseInt(e.target.getAttribute('data-index'));
                updateLbPosition();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (lightbox.style.display === 'flex') {
                if (e.key === 'ArrowLeft') lbPrev.click();
                if (e.key === 'ArrowRight') lbNext.click();
                if (e.key === 'Escape') closeLightbox();
            }
        });

        const closeBtn = document.getElementById('close-lightbox');
        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
        
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
                closeLightbox();
            }
        });
    }
};

// Synced Slider for Our Leaders & Office Bearers
const initLeadersSlider = () => {
    const track = document.getElementById('leadersTrack');
    if (!track) return;

    const cards = Array.from(track.querySelectorAll('.leader-card'));
    const prevBtn = document.querySelector('.prev-leader-btn');
    const nextBtn = document.querySelector('.next-leader-btn');
    const obGrid = document.getElementById('officeBearersGrid');
    
    // Database of Office Bearers (8 per leader)
    const officeBearersDB = [];
    for(let i=0; i<5; i++) {
        let members = [];
        for(let j=0; j<8; j++) {
            const picId = (i * 8 + j) % 20 + 1; // 20 placeholder images
            members.push({
                name: `Sri Committe Member ${i+1}-${j+1}`,
                role: `Regional Secretary`,
                img: `img/presidents/p${picId}.webp`
            });
        }
        officeBearersDB.push(members);
    }

    let activeLeaderIndex = 0;
    let itemsPerView = 4;

    const getItemsPerView = () => {
        if(window.innerWidth <= 768) return 1;
        if(window.innerWidth <= 1024) return 2;
        return 4;
    };

    const updateSlider = () => {
        itemsPerView = getItemsPerView();
        const maxOffset = Math.max(0, cards.length - itemsPerView);
        
        if (activeLeaderIndex >= cards.length) activeLeaderIndex = cards.length - 1;
        if (activeLeaderIndex < 0) activeLeaderIndex = 0;

        let offsetIndex = activeLeaderIndex;
        // Keep within slider track bounds
        if (offsetIndex > maxOffset) offsetIndex = maxOffset; 
        
        const cardWidth = 100 / itemsPerView;
        track.style.transform = `translateX(-${offsetIndex * cardWidth}%)`;

        cards.forEach((c, idx) => {
            if (idx === activeLeaderIndex) c.classList.add('active');
            else c.classList.remove('active');
        });

        populateOfficeBearers(activeLeaderIndex);
    };

    const populateOfficeBearers = (leaderIndex) => {
        obGrid.classList.remove('fade-in');
        
        setTimeout(() => {
            obGrid.innerHTML = '';
            const members = officeBearersDB[leaderIndex];
            if(members) {
                members.forEach(m => {
                    obGrid.innerHTML += `
                        <div class="ob-card">
                            <img src="${m.img}" alt="${m.name}" loading="lazy">
                            <h5>${m.name}</h5>
                            <span>${m.role}</span>
                        </div>
                    `;
                });
            }
            obGrid.classList.add('fade-in');
        }, 300);
    };

    const startAutoSlide = () => {
        clearInterval(track.autoSlide);
        track.autoSlide = setInterval(() => {
            activeLeaderIndex++;
            if (activeLeaderIndex >= cards.length) {
                activeLeaderIndex = 0; // Loop back to start
            }
            updateSlider();
        }, 2000); // 2 second interval
    };

    const stopAutoSlide = () => clearInterval(track.autoSlide);

    if(prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (activeLeaderIndex > 0) {
                activeLeaderIndex--;
                updateSlider();
                startAutoSlide(); // reset timer on interaction
            }
        });
    }

    if(nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (activeLeaderIndex < cards.length - 1) {
                activeLeaderIndex++;
                updateSlider();
                startAutoSlide(); // reset timer on interaction
            }
        });
    }

    cards.forEach((c, idx) => {
        c.addEventListener('click', () => {
            activeLeaderIndex = idx;
            updateSlider();
            startAutoSlide(); // reset timer on interaction
        });
    });

    const leadersSection = document.querySelector('.our-leaders-section');
    if (leadersSection) {
        leadersSection.addEventListener('mouseenter', stopAutoSlide);
        leadersSection.addEventListener('mouseleave', startAutoSlide);
    }

    window.addEventListener('resize', updateSlider);
    updateSlider(); // render initial state
    startAutoSlide(); // start the loop
};

document.addEventListener('DOMContentLoaded', () => {
    initGallery();
    initLeadersSlider(); // Mount our new slider
    
    // Scroll to Top functionality
    const scrollToTopBtn = document.getElementById('scrollToTop');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
