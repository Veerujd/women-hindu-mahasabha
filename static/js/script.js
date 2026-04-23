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

        // Dynamically adjust nav padding-top to match actual header height
        // This ensures the menu clears the header both at page-load (top-bar visible)
        // and after scrolling (top-bar hidden, header compact)
        if (isOpen && mainHeader) {
            const hdrHeight = mainHeader.getBoundingClientRect().height;
            nav.style.paddingTop = (hdrHeight + 20) + 'px';
        } else {
            nav.style.paddingTop = '';
        }
    });

    // Close menu on link click
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('open');
            nav.classList.remove('active');
            if (mainHeader) mainHeader.classList.remove('nav-open');
            document.body.style.overflow = '';
            nav.style.paddingTop = '';
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
    if (!pageSpacer) return;
    const headerBottom = header ? header.getBoundingClientRect().height : 0;
    const tickerHeight = (topBar && !topBar.classList.contains('hidden')) ? topBar.getBoundingClientRect().height : 0;
    const h = headerBottom + tickerHeight;
    
    // We use height sum instead of bottom coordinates to be more resilient during transitions.
    // Subtracting 2px to ensure overlap with the navbar bottom border.
    pageSpacer.style.setProperty('height', Math.floor(h - 2) + 'px', 'important');
}

function positionRibbon() {
    // Ribbon is now static/relative in index.html, no positioning needed.
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

    const isScrolled = window.scrollY > 10; /* Increased threshold for stability */
    if (isScrolled !== lastScrolled) {
        lastScrolled = isScrolled;
        if (isScrolled) {
            header.classList.add("scrolled");
            if (topBar) topBar.classList.add("hidden");
            if (ribbon) ribbon.classList.add("hidden");
            document.body.classList.add("body-scrolled");
        } else {
            header.classList.remove("scrolled");
            if (topBar) topBar.classList.remove("hidden");
            if (ribbon) ribbon.classList.remove("hidden");
            document.body.classList.remove("body-scrolled");
        }
        trackRibbonFor(200);
    }
};

window.addEventListener('scroll', handleScroll, { passive: true });
window.addEventListener('resize', () => trackRibbonFor(300));

handleScroll();
updateSpacer(); // Immediate initialization
trackRibbonFor(1000);

// Fix for dynamic image loading affecting header height
const logo = header ? header.querySelector('img') : null;
if (logo) {
    logo.addEventListener('load', () => updateSpacer());
    // Fallback for cached images
    if (logo.complete) updateSpacer();
}

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

// Modern Gallery & Simplified Filter logic
const initGallery = () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const yearBtns = document.querySelectorAll('.year-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');

    let activeCategory = 'all';
    let activeYear = 'all';

    const filterGallery = () => {
        galleryItems.forEach(item => {
            const itemDate = item.getAttribute('data-full-date') || "";
            const itemYear = itemDate.split('-')[0];
            
            const categoryMatch = activeCategory === 'all' || item.classList.contains(activeCategory);
            const yearMatch = activeYear === 'all' || itemYear === activeYear;

            item.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            if (categoryMatch && yearMatch) {
                item.style.display = 'inline-block';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0) scale(1)';
                }, 10);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'translateY(30px) scale(0.95)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 500);
            }
        });
    };

    // Category Buttons
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategory = btn.getAttribute('data-category');
            filterGallery();
        });
    });

    // Year Buttons
    yearBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            yearBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeYear = btn.getAttribute('data-year');
            filterGallery();
        });
    });

    // Initial Filter
    filterGallery();

    if (lightbox) {
        const lbMainImg = document.getElementById('lb-main-img');
        const lbTitle = document.getElementById('lb-title');
        const lbDesc = document.getElementById('lb-desc');
        const lbCounter = document.getElementById('lb-counter');
        const lbMiniSlider = document.getElementById('lb-mini-slider');
        const lbPrev = document.getElementById('lb-prev');
        const lbNext = document.getElementById('lb-next');
        const closeBtn = document.getElementById('close-lightbox');

        let currentImages = [];
        let currentTitles = [];
        let currentDescs = [];
        let currentIdx = 0;

        const updateLightbox = (index) => {
            currentIdx = index;
            
            // Update Main Display
            lbMainImg.style.opacity = '0.3';
            setTimeout(() => {
                lbMainImg.src = currentImages[currentIdx];
                lbMainImg.style.opacity = '1';
            }, 150);

            // Update Text
            lbTitle.innerText = currentTitles[currentIdx] || "Gallery";
            lbDesc.innerText = currentDescs[currentIdx] || "";
            lbCounter.innerText = `${currentIdx + 1} / ${currentImages.length}`;

            // Update Thumbnails
            const thumbs = lbMiniSlider.querySelectorAll('.mini-thumb');
            thumbs.forEach((t, i) => {
                t.classList.toggle('active', i === currentIdx);
                if (i === currentIdx) {
                    t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            });
        };

        const openLightbox = (item) => {
            try {
                currentImages = JSON.parse(item.getAttribute('data-images'));
                currentTitles = JSON.parse(item.getAttribute('data-titles'));
                currentDescs = JSON.parse(item.getAttribute('data-descs'));
            } catch (e) {
                console.error("Gallery data parsing failed", e);
                return;
            }

            // Populate thumbnails
            lbMiniSlider.innerHTML = currentImages.map((src, i) => `
                <div class="mini-thumb" data-idx="${i}">
                    <img src="${src}" alt="Thumb ${i+1}">
                </div>
            `).join('');

            lbMiniSlider.querySelectorAll('.mini-thumb').forEach(thumb => {
                thumb.addEventListener('click', () => {
                    updateLightbox(parseInt(thumb.getAttribute('data-idx')));
                });
            });

            lightbox.classList.add('active');
            updateLightbox(0);
            document.body.style.overflow = 'hidden';
            document.body.classList.add('lightbox-open');
        };

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
            document.body.classList.remove('lightbox-open');
        };

        document.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('click', () => openLightbox(item));
        });

        lbPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            let prevIdx = (currentIdx - 1 + currentImages.length) % currentImages.length;
            updateLightbox(prevIdx);
        });

        lbNext.addEventListener('click', (e) => {
            e.stopPropagation();
            let nextIdx = (currentIdx + 1) % currentImages.length;
            updateLightbox(nextIdx);
        });

        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
        
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-overlay')) closeLightbox();
        });

        document.addEventListener('keydown', (e) => {
            if (lightbox.classList.contains('active')) {
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowLeft') lbPrev.click();
                if (e.key === 'ArrowRight') lbNext.click();
            }
        });
    }
};



document.addEventListener('DOMContentLoaded', () => {
    initGallery();
    
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

/* ==========================================================================
   FOUNDER BIO TOGGLE (ABOUT PAGE)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggle-founder-bio');
    const fullContent = document.getElementById('founder-full-content');
    
    if (toggleBtn && fullContent) {
        toggleBtn.addEventListener('click', () => {
            const isCollapsed = fullContent.classList.toggle('collapsed');
            toggleBtn.classList.toggle('active', !isCollapsed);
            
            if (isCollapsed) {
                toggleBtn.innerHTML = 'Read More <i class="fas fa-chevron-down"></i>';
                // Scroll back to summary start for better experience if content was long
                setTimeout(() => {
                    toggleBtn.closest('.founder-wrap-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 300);
            } else {
                toggleBtn.innerHTML = 'Read Less <i class="fas fa-chevron-up"></i>';
            }
        });
    }
});

/* ==========================================================================
   LOAD MORE PRESIDENTS (ABOUT PAGE)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const loadMoreBtn = document.getElementById('btn-load-more-presidents');
    const timelineItems = document.querySelectorAll('#about-presidents-timeline .load-more-item');
    let currentIndex = 0;
    const batchSize = 6;

    if (loadMoreBtn && timelineItems.length > 0) {
        loadMoreBtn.addEventListener('click', () => {
            const nextBatch = Array.from(timelineItems).slice(currentIndex, currentIndex + batchSize);
            
            nextBatch.forEach((item, index) => {
                setTimeout(() => {
                    item.style.display = 'block';
                    // Re-trigger AOS if necessary or add simple fade
                    item.style.opacity = '0';
                    item.style.transition = 'opacity 0.5s ease';
                    requestAnimationFrame(() => {
                        item.style.opacity = '1';
                    });
                }, index * 100);
            });

            currentIndex += batchSize;

            if (currentIndex >= timelineItems.length) {
                loadMoreBtn.parentElement.style.display = 'none'; // Hide the entire button wrapper
            }
        });
    }
});

/* ==========================================================================
   GENERIC TOGGLE FUNCTIONALITY (Read More / Less)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const setupToggle = (btnId, contentId, parentSelector) => {
        const toggleBtn = document.getElementById(btnId);
        const fullContent = document.getElementById(contentId);
        
        if (toggleBtn && fullContent) {
            toggleBtn.addEventListener('click', () => {
                const isCollapsed = fullContent.classList.toggle('collapsed');
                toggleBtn.classList.toggle('active', !isCollapsed);
                
                if (isCollapsed) {
                    toggleBtn.innerHTML = 'Read More <i class="fas fa-chevron-down"></i>';
                    setTimeout(() => {
                        toggleBtn.closest(parentSelector).scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 300);
                } else {
                    toggleBtn.innerHTML = 'Read Less <i class="fas fa-chevron-up"></i>';
                }
            });
        }
    };

    // Setup toggles for various pages
    setupToggle('toggle-intro-content', 'intro-full-content', '.intro-section');
    setupToggle('toggle-home-intro', 'home-intro-full-content', '.intro-section');
});

/* ==========================================================================
   DYNAMIC EVENTS CALENDAR WIDGET
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const calendarDaysGrid = document.getElementById('calendar-days-grid');
    if (!calendarDaysGrid) return; // Only run on Events page if grid exists

    const monthYearTitle = document.getElementById('calendar-month-year');
    const prevBtn = document.getElementById('cal-btn-prev');
    const nextBtn = document.getElementById('cal-btn-next');
    const eventsList = document.getElementById('calendar-upcoming-events-list');

    // Mock Events Data across multiple months/years
    const calendarEvents = [
        { date: '2026-04-24', type: 'Program', title: 'National Women and Youth Divisions Inauguration Program', icon: 'fa-users', bgClass: 'festival-bg', tagClass: 'festival-tag', dotClass: 'festival-dot' },
        { date: '2026-04-02', type: 'Special', title: 'Highlight Event', icon: 'fa-star', bgClass: 'festival-bg', tagClass: 'festival-tag', dotClass: 'festival-dot' },
        { date: '2026-04-06', type: 'Festival', title: 'Sri Rama Navami', icon: 'fa-gift', bgClass: 'festival-bg', tagClass: 'festival-tag', dotClass: 'festival-dot' },
        { date: '2026-04-20', type: 'Jayanthi', title: 'Basavanna Jayanthi', icon: 'fa-birthday-cake', bgClass: 'jayanthi-bg', tagClass: 'jayanthi-tag', dotClass: 'jayanthi-dot' },
        { date: '2026-05-18', type: 'Festival', title: 'Global Mahasammelan', icon: 'fa-om', bgClass: 'festival-bg', tagClass: 'festival-tag', dotClass: 'festival-dot' },
        { date: '2026-05-25', type: 'Vrata', title: 'Ekadashi Vrata', icon: 'fa-pray', bgClass: 'jayanthi-bg', tagClass: 'jayanthi-tag', dotClass: 'vrata-dot' }, 
        { date: '2026-06-12', type: 'Festival', title: 'Start of Chaturmasya', icon: 'fa-cloud-sun', bgClass: 'festival-bg', tagClass: 'festival-tag', dotClass: 'festival-dot' },
        { date: '2026-07-28', type: 'Vrata', title: 'Shravana Somavara Vrata', icon: 'fa-leaf', bgClass: 'jayanthi-bg', tagClass: 'jayanthi-tag', dotClass: 'vrata-dot' },
        { date: '2026-08-15', type: 'Festival', title: 'Independence Day', icon: 'fa-flag', bgClass: 'festival-bg', tagClass: 'festival-tag', dotClass: 'festival-dot' },
        { date: '2026-09-05', type: 'Jayanthi', title: 'Teachers Day', icon: 'fa-book-open', bgClass: 'jayanthi-bg', tagClass: 'jayanthi-tag', dotClass: 'jayanthi-dot' },
        { date: '2026-10-21', type: 'Festival', title: 'Deepavali', icon: 'fa-fire', bgClass: 'festival-bg', tagClass: 'festival-tag', dotClass: 'festival-dot' },
        { date: '2026-11-20', type: 'Jayanthi', title: 'Kanakadasa Jayanthi', icon: 'fa-music', bgClass: 'jayanthi-bg', tagClass: 'jayanthi-tag', dotClass: 'jayanthi-dot' },
    ];

    let currentDate = new Date(2026, 3, 1); // Start at April 2026 
    let today = new Date(); 

    function renderCalendar() {
        calendarDaysGrid.innerHTML = '';
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();

        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        monthYearTitle.innerText = `${monthNames[month]} ${year}`;

        // Get first day of month index (0: Sun, 1: Mon, ..., 6: Sat)
        const firstDay = new Date(year, month, 1).getDay();
        // Adjust for Mon starting week
        let blankDays = firstDay === 0 ? 6 : firstDay - 1;

        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Inject empty spaces
        for (let i = 0; i < blankDays; i++) {
            const emptySpan = document.createElement('span');
            emptySpan.className = 'empty';
            calendarDaysGrid.appendChild(emptySpan);
        }

        // Filter events for this month
        const monthEvents = calendarEvents.filter(ev => {
            const evDate = new Date(ev.date);
            return evDate.getFullYear() === year && evDate.getMonth() === month;
        });

        // Inject days
        for (let i = 1; i <= daysInMonth; i++) {
            const daySpan = document.createElement('span');
            daySpan.innerText = i;
            daySpan.classList.add('cal-day');

            // Format date string for matching: YYYY-MM-DD
            const m = (month + 1).toString().padStart(2, '0');
            const d = i.toString().padStart(2, '0');
            const dateStr = `${year}-${m}-${d}`;

            // Check if day has event
            const dayEvents = monthEvents.filter(ev => ev.date === dateStr);
            if (dayEvents.length > 0) {
                daySpan.classList.add('event-day');
                // Use the style of the first event if multiple
                const mainEvent = dayEvents[0];
                
                const dot = document.createElement('span');
                dot.className = `event-dot ${mainEvent.dotClass}`;
                daySpan.appendChild(dot);
            }

            // Highlight chosen/today dates
            if (year === 2026 && month === 3 && i === 2) {
                daySpan.classList.add('selected-day');
            } else if (today.getFullYear() === year && today.getMonth() === month && today.getDate() === i && (year !== 2026 || month !== 3)) {
                 daySpan.classList.add('selected-day');
            }

            calendarDaysGrid.appendChild(daySpan);
        }

        renderUpcomingEvents(monthEvents);
    }

    function renderUpcomingEvents(events) {
        eventsList.innerHTML = '';
        
        if (events.length === 0) {
            eventsList.innerHTML = `<p style="text-align: center; color: #888; padding: 20px;">No upcoming events scheduled for this month.</p>`;
            return;
        }

        events.forEach(ev => {
            // Format nice date e.g., '6 Apr, 2026'
            const dt = new Date(ev.date);
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const formattedDate = `${dt.getDate()} ${monthNames[dt.getMonth()]}, ${dt.getFullYear()}`;

            // Construct Card
            const cardHTML = `
                <div class="cal-event-card white-card" style="animation: fade-in 0.3s ease;">
                    <div class="cal-event-icon ${ev.bgClass}"><i class="fas ${ev.icon}"></i></div>
                    <div class="cal-event-details">
                        <h5>${ev.title}</h5>
                        <p><i class="far fa-calendar"></i> ${formattedDate} <span class="cal-tag ${ev.tagClass}">${ev.type}</span></p>
                    </div>
                </div>
            `;
            eventsList.innerHTML += cardHTML;
        });
    }

    prevBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // Initialize display
    renderCalendar();
});
