// ============================================
// ANIMATED BACKGROUND PARTICLES
// ============================================
function initParticles() {
    const particlesContainer = document.getElementById('bgParticles');
    if (!particlesContainer) return;

    // Vérifier si l'utilisateur préfère réduire les animations
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        // Créer quelques particules statiques seulement
        const staticParticles = window.innerWidth < 768 ? 10 : 20;
        for (let i = 0; i < staticParticles; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.opacity = '0.3';
            particlesContainer.appendChild(particle);
        }
        return;
    }

    const particleCount = window.innerWidth < 768 ? 30 : 50;
    const particles = [];

    // Créer les particules avec différentes tailles
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // Tailles variées pour plus de profondeur
        const size = Math.random() * 2 + 1; // 1-3px
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';

        // Opacité variée
        const opacity = Math.random() * 0.4 + 0.4; // 0.4-0.8
        particle.style.opacity = opacity;

        particlesContainer.appendChild(particle);
        particles.push(particle);
    }

    // Animer les particules avec des trajectoires fluides
    function animateParticles() {
        particles.forEach((particle, index) => {
            // Position initiale aléatoire
            const startX = Math.random() * window.innerWidth;
            const startY = Math.random() * window.innerHeight;

            particle.style.left = startX + 'px';
            particle.style.top = startY + 'px';

            // Créer une trajectoire circulaire ou sinusoïdale
            const trajectoryType = Math.random() > 0.5 ? 'circular' : 'sinusoidal';
            const duration = 15000 + Math.random() * 15000; // 15-30s
            const radius = 50 + Math.random() * 100; // 50-150px
            const speed = Math.random() * 0.02 + 0.01; // Vitesse de rotation

            let startTime = null;
            let angle = Math.random() * Math.PI * 2;

            function animate(currentTime) {
                if (!startTime) startTime = currentTime;
                const elapsed = (currentTime - startTime) / duration;

                if (elapsed >= 1) {
                    // Réinitialiser
                    startTime = currentTime;
                    angle = Math.random() * Math.PI * 2;
                    return;
                }

                let x, y;
                if (trajectoryType === 'circular') {
                    angle += speed;
                    x = Math.cos(angle) * radius;
                    y = Math.sin(angle) * radius;
                } else {
                    // Sinusoïdal
                    x = Math.sin(angle) * radius;
                    y = Math.cos(angle * 2) * radius * 0.5;
                    angle += speed;
                }

                // Ajouter un mouvement de dérive lent
                const driftX = Math.sin(elapsed * Math.PI * 2) * 30;
                const driftY = Math.cos(elapsed * Math.PI * 2) * 20;

                particle.style.transform = `translate(${x + driftX}px, ${y + driftY}px)`;

                // Variation d'opacité
                const baseOpacity = parseFloat(particle.style.opacity);
                const opacityVariation = Math.sin(elapsed * Math.PI * 4) * 0.2;
                particle.style.opacity = Math.max(0.2, Math.min(0.8, baseOpacity + opacityVariation));

                requestAnimationFrame(animate);
            }

            requestAnimationFrame(animate);
        });
    }

    // Initialiser les particules
    animateParticles();

    // Réinitialiser au redimensionnement (avec debounce)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            particles.forEach(p => p.remove());
            initParticles();
        }, 300);
    });
}

// ============================================
// PARALLAX EFFECT SUR SCROLL (subtile)
// ============================================
function initParallax() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const orbs = document.querySelectorAll('.orb');
    const mesh = document.querySelector('.bg-mesh');

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * 0.1; // Facteur de parallaxe très subtil

                orbs.forEach((orb, index) => {
                    const speed = (index + 1) * 0.05;
                    orb.style.transform = `translateY(${rate * speed}px)`;
                });

                if (mesh) {
                    mesh.style.transform = `translateY(${rate * 0.03}px)`;
                }

                ticking = false;
            });
            ticking = true;
        }
    });
}

// ============================================
// NAVIGATION MOBILE
// ============================================
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !isExpanded);
        navMenu.setAttribute('aria-hidden', isExpanded);
    });

    // Fermer le menu au clic sur un lien
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.setAttribute('aria-expanded', 'false');
            navMenu.setAttribute('aria-hidden', 'true');
        });
    });

    // Fermer le menu avec Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
            navToggle.setAttribute('aria-expanded', 'false');
            navMenu.setAttribute('aria-hidden', 'true');
            navToggle.focus();
        }
    });
}

// ============================================
// SMOOTH SCROLL
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();
        const target = document.querySelector(href);

        if (target) {
            const offsetTop = target.offsetTop - 60; // Compenser la nav fixe
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// PORTFOLIO AUTO-LOAD FROM JSON
// ============================================
// ============================================
// PORTFOLIO DATA (Embedded to fix local CORS issues)
// ============================================
const portfolioData = {
    "images": [
        {
            "filename": "Chromatic-Resonance.jpg",
            "category": "graphics",
            "title": "Chromatique résonance",
            "award": "1ère place @ Rsync 2024",
            "year": 2024
        },
        {
            "filename": "Callisto_Pascals-lemur-leap_step-finale-2048x1152.jpg",
            "category": "graphics",
            "title": "Pascal's lemur leap",
            "award": "10ème place @ Revision 2025",
            "year": 2025
        },
        {
            "filename": "cropped-elevation-finale-scaled-1.jpg",
            "category": "graphics",
            "title": "Elevation 2079",
            "award": "1ère place @ Inercia 2022",
            "year": 2022
        },
        {
            "filename": "paintover2024_callisto_refresh_step05.jpg",
            "category": "graphics",
            "title": "Refresh",
            "award": "12ème place @ Revision 2024",
            "year": 2024
        },
        {
            "filename": "Luna-fly-by-callisto-finale-1-scaled.jpg",
            "category": "animation",
            "title": "Luna Fly",
            "award": "5ème place @ Session 2023",
            "year": 2023
        },
        {
            "filename": "IMG_0899-scaled.jpg",
            "category": "digital",
            "title": "Sky code",
            "award": "Participation @ Inercia 2025",
            "year": 2025
        },
        {
            "filename": "339435602_905924634051246_6940335715669469411_n.jpg",
            "category": "animation",
            "title": "Animation Demoscene",
            "year": 2023
        },
        {
            "filename": "344736827_755458082626458_6207407694818355725_n.jpg",
            "category": "animation",
            "title": "Animation Demoscene",
            "year": 2023
        },
        {
            "filename": "407845946_398297489188178_8033467046376857047_n.jpg",
            "category": "animation",
            "title": "Animation Demoscene",
            "year": 2024
        },
        {
            "filename": "Callisto_photo_revision2023-1024x547.jpg",
            "category": "photo",
            "title": "Photo @ Revision 2023",
            "year": 2023
        },
        {
            "filename": "Callisto_convergence-1024x510.jpg",
            "category": "digital",
            "title": "Convergence",
            "year": 2023
        },
        {
            "filename": "PresentationCallisto2022-5.jpg",
            "category": "digital",
            "title": "Présentation 2022",
            "year": 2022
        },
        {
            "filename": "Callisto_finale-6.jpg",
            "category": "digital",
            "title": "Digital Painting",
            "year": 2022
        },
        {
            "filename": "2fb0.356160_ori-2048x1910.jpg",
            "category": "graphics",
            "title": "Symphony of the abyss",
            "year": 2025,
            "award": "2ème place @ Rsync 2025"
        },
        {
            "filename": "eb9a.315530-2048x1150.jpg",
            "category": "digital",
            "title": "Digital Painting",
            "year": 2023
        },
        {
            "filename": "376688281_353500107001250_6102064824076954240_n.jpg",
            "category": "digital",
            "title": "Digital Painting",
            "year": 2023
        },
        {
            "filename": "74410909_1244316935752931_2378795365198462976_n.jpg",
            "category": "digital",
            "title": "Digital Painting",
            "year": 2022
        },
        {
            "filename": "312518226_10228185642768590_4918581913671770871_n-1024x652.jpg",
            "category": "digital",
            "title": "Digital Painting",
            "year": 2023
        },
        {
            "filename": "94688130_1733793336752338_604221269126152192_n.jpg",
            "category": "gaming",
            "title": "Gaming Artwork",
            "year": 2020
        },
        {
            "filename": "183407402_10225214914982252_8102507980517360390_n-1024x768.jpg",
            "category": "photo",
            "title": "Photo",
            "year": 2021
        },
        {
            "filename": "183672347_10225215575758771_3763955342084286418_n-1024x690.jpg",
            "category": "photo",
            "title": "Photo",
            "year": 2021
        },
        {
            "filename": "00d2.309107-1024x683.jpg",
            "category": "photo",
            "title": "Photo",
            "year": 2022
        },
        {
            "filename": "logo-cllisto.png",
            "category": "logo",
            "title": "Logo Callisto",
            "isLogo": true
        }
    ]
};

// ============================================
// PORTFOLIO LOAD (Simulated fetch)
// ============================================
async function loadPortfolioImages() {
    try {
        // En local, on utilise les données statiques
        const data = portfolioData;
        const portfolioGrid = document.getElementById('portfolioGrid');

        if (!portfolioGrid) return;

        // Filtrer les images (exclure les logos)
        const images = data.images.filter(img => img.category !== 'logo');

        // Créer les éléments portfolio
        images.forEach(image => {
            const item = document.createElement('div');
            item.className = 'portfolio-item glass-card';
            item.setAttribute('data-category', image.category);
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'button');
            item.setAttribute('data-image-data', JSON.stringify(image));

            const imageDiv = document.createElement('div');
            imageDiv.className = 'portfolio-image';

            const img = document.createElement('img');
            img.src = `assets/images/${image.filename}`;
            img.alt = image.title || image.filename;
            img.loading = 'lazy';

            const overlay = document.createElement('div');
            overlay.className = 'portfolio-overlay';

            const title = document.createElement('h3');
            title.className = 'portfolio-title';
            title.textContent = image.title || 'Œuvre';

            const category = document.createElement('p');
            category.className = 'portfolio-category';
            const categoryNames = {
                'digital': 'Digital Painting',
                'animation': 'Animation/Video',
                'graphics': 'Graphics',
                'photo': 'Photo',
                'gaming': 'Gaming Artwork',
                'traditional': 'Traditional Arts'
            };
            category.textContent = categoryNames[image.category] || image.category;

            overlay.appendChild(title);
            overlay.appendChild(category);

            // Ajouter le badge de récompense si présent
            if (image.award) {
                const badge = document.createElement('span');
                badge.className = 'portfolio-badge award';
                badge.textContent = image.award;
                overlay.appendChild(badge);
            }

            imageDiv.appendChild(img);
            imageDiv.appendChild(overlay);
            item.appendChild(imageDiv);
            portfolioGrid.appendChild(item);
        });

        // Réinitialiser les filtres après le chargement
        initPortfolioFilters();

        // Attacher les événements lightbox
        attachLightboxEvents();

        // Charger les récompenses
        loadAwards(data.images);

    } catch (error) {
        console.error('Erreur lors du chargement des images:', error);
    }
}

// ============================================
// LOAD AWARDS FROM JSON
// ============================================
function loadAwards(images) {
    const awardsGrid = document.getElementById('awardsGrid');
    if (!awardsGrid) return;

    // Filtrer seulement les images avec des récompenses
    const awardedImages = images.filter(img => img.award && img.year);

    // Trier par année (plus récent en premier)
    awardedImages.sort((a, b) => (b.year || 0) - (a.year || 0));

    awardedImages.forEach(image => {
        const card = document.createElement('div');
        card.className = 'award-card glass-card';

        const year = document.createElement('div');
        year.className = 'award-year';
        year.textContent = image.year || '';

        const title = document.createElement('h3');
        title.className = 'award-title';
        title.textContent = image.title || 'Œuvre';

        // Extraire l'événement depuis l'award
        const awardText = image.award || '';
        const eventMatch = awardText.match(/@\s*(.+?)(?:\s+\d{4})?$/);
        const event = eventMatch ? eventMatch[1] : 'Demoscene';

        const eventP = document.createElement('p');
        eventP.className = 'award-event';
        eventP.textContent = event;

        // Extraire le rang depuis l'award
        const rankMatch = awardText.match(/(\d+(?:ère|ème|er|e))\s+place/);
        const rank = rankMatch ? rankMatch[1] + ' place' : awardText;

        const rankSpan = document.createElement('span');
        rankSpan.className = 'award-rank';
        rankSpan.textContent = rank;

        card.appendChild(year);
        card.appendChild(title);
        card.appendChild(eventP);
        card.appendChild(rankSpan);

        awardsGrid.appendChild(card);
    });
}

// ============================================
// PORTFOLIO FILTERS
// ============================================
function initPortfolioFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Mettre à jour les états actifs
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });

            button.classList.add('active');
            button.setAttribute('aria-selected', 'true');

            // Filtrer les items
            const filter = button.getAttribute('data-filter');

            portfolioItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
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
                    }, 300);
                }
            });
        });
    });

    // Initialiser les styles de transition
    portfolioItems.forEach(item => {
        item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    });
}

// ============================================
// LIGHTBOX MODAL
// ============================================
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxDescription = document.getElementById('lightbox-description');
const lightboxClose = document.querySelector('.lightbox-close');

function openLightbox(item) {
    const img = item.querySelector('img');

    // Récupérer les données JSON stockées dans l'élément
    const imageDataStr = item.getAttribute('data-image-data');
    let imageData = null;

    if (imageDataStr) {
        try {
            imageData = JSON.parse(imageDataStr);
        } catch (e) {
            console.error('Erreur parsing image data:', e);
        }
    }

    // Fallback sur les éléments DOM si pas de données JSON
    const title = imageData?.title || item.querySelector('.portfolio-title')?.textContent || '';
    const category = imageData?.category || item.querySelector('.portfolio-category')?.textContent || '';
    const badge = imageData?.award || item.querySelector('.portfolio-badge')?.textContent || '';

    if (img && lightboxImage) {
        lightboxImage.src = img.src;
        lightboxImage.alt = img.alt || title;
    }

    if (lightboxTitle) {
        lightboxTitle.textContent = title;
    }

    if (lightboxDescription) {
        const categoryNames = {
            'digital': 'Digital Painting',
            'animation': 'Animation/Video',
            'graphics': 'Graphics',
            'photo': 'Photo',
            'gaming': 'Gaming Artwork',
            'traditional': 'Traditional Arts'
        };
        const categoryText = categoryNames[category] || category;
        lightboxDescription.textContent = `${categoryText}${badge ? ' • ' + badge : ''}`;
    }

    if (lightbox) {
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        lightboxClose?.focus();
    }
}

function closeLightbox() {
    if (lightbox) {
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
}

// Fonction pour attacher les événements lightbox aux items portfolio
function attachLightboxEvents() {
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    portfolioItems.forEach(item => {
        // Retirer les anciens listeners s'ils existent
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);

        newItem.addEventListener('click', () => {
            openLightbox(newItem);
        });

        // Support clavier
        newItem.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(newItem);
            }
        });
    });
}

// Fermer lightbox
if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
}

// Fermer avec Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox?.getAttribute('aria-hidden') === 'false') {
        closeLightbox();
    }
});

// Fermer en cliquant sur le fond
if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
}

// ============================================
// SCROLL ANIMATIONS (Intersection Observer)
// ============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observer les sections et cards
document.querySelectorAll('.section, .glass-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================
let lastScroll = 0;
const nav = document.querySelector('.nav');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        nav?.style.setProperty('background', 'rgba(26, 26, 26, 0.95)');
        nav?.style.setProperty('backdrop-filter', 'blur(20px)');
    } else {
        nav?.style.setProperty('background', 'rgba(26, 26, 26, 0.8)');
        nav?.style.setProperty('backdrop-filter', 'blur(10px)');
    }

    lastScroll = currentScroll;
});

// ============================================
// HERO SCROLL BUTTON
// ============================================
const heroScroll = document.querySelector('.hero-scroll');
if (heroScroll) {
    heroScroll.addEventListener('click', () => {
        const aboutSection = document.querySelector('#about');
        if (aboutSection) {
            const offsetTop = aboutSection.offsetTop - 60;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
}

// ============================================
// LAZY LOADING IMAGES (si pas déjà géré par le navigateur)
// ============================================
if ('loading' in HTMLImageElement.prototype) {
    // Le navigateur supporte le lazy loading natif
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.src;
    });
} else {
    // Fallback pour les navigateurs plus anciens
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img.lazy').forEach(img => {
        imageObserver.observe(img);
    });
}

// ============================================
// ACCESSIBILITY - Skip Link
// ============================================
// Ajouter un skip link si nécessaire
const skipLink = document.createElement('a');
skipLink.href = '#main-content';
skipLink.className = 'skip-link';
skipLink.textContent = 'Aller au contenu principal';
document.body.insertBefore(skipLink, document.body.firstChild);

// Ajouter un id au main content si nécessaire
const mainContent = document.querySelector('main') || document.querySelector('#about');
if (mainContent && !mainContent.id) {
    mainContent.id = 'main-content';
}

// ============================================
// PERFORMANCE - Debounce pour scroll
// ============================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimiser les événements scroll
const optimizedScrollHandler = debounce(() => {
    // Code de scroll optimisé ici
}, 10);

// ============================================
// INITIALISATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier la préférence de réduction de mouvement
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        document.documentElement.style.setProperty('--transition-fast', '0s');
        document.documentElement.style.setProperty('--transition-base', '0s');
        document.documentElement.style.setProperty('--transition-slow', '0s');
    }

    // Initialiser les particules du background
    initParticles();

    // Initialiser l'effet parallaxe
    initParallax();

    // Charger les images du portfolio depuis le JSON
    loadPortfolioImages();

    console.log('Portfolio Callisto Arts - Initialisé avec background animé');
});
