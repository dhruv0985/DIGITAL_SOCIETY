// Particle System
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 50;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.init();
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    init() {
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.2,
                color: Math.random() > 0.5 ? 'rgba(212, 165, 116, 0.6)' : 'rgba(74, 144, 226, 0.4)'
            });
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            if (particle.x < 0 || particle.x > this.canvas.width) particle.speedX *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.speedY *= -1;
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fill();
        });
        
        // Connect nearby particles
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(212, 165, 116, ${0.2 * (1 - distance / 150)})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        }
        
        this.ctx.globalAlpha = 1;
        requestAnimationFrame(() => this.animate());
    }
}

// Map Interaction System
class MapInteraction {
    constructor() {
        this.locationData = JSON.parse(document.getElementById('locationData').textContent);
        this.currentLocation = null;
        this.init();
    }
    
    init() {
        // Get markers from overlay SVG
        const markers = document.querySelectorAll('.markers-overlay .craft-marker');
        const contentPanel = document.getElementById('contentPanel');
        const closePanel = document.getElementById('closePanel');
        
        markers.forEach(marker => {
            // Only the marker-dot itself is clickable
            const markerDot = marker.querySelector('.marker-dot');
            
            if (markerDot) {
                markerDot.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const location = marker.getAttribute('data-location');
                    this.showLocation(location, marker);
                });
                
                markerDot.addEventListener('mouseenter', () => {
                    this.highlightMarker(marker);
                });
                
                markerDot.addEventListener('mouseleave', () => {
                    // Don't remove active if panel is open for this marker
                    if (!marker.classList.contains('active')) {
                        markerDot.style.filter = '';
                    }
                });
            }
        });
        
        if (closePanel) {
            closePanel.addEventListener('click', () => {
                this.closePanel();
            });
        }
        
        // Close panel on outside click
        if (contentPanel) {
            contentPanel.addEventListener('click', (e) => {
                if (e.target === contentPanel) {
                    this.closePanel();
                }
            });
        }
    }
    
    highlightMarker(marker) {
        // Only highlight on hover if not already active
        if (!marker.classList.contains('active')) {
            const dot = marker.querySelector('.marker-dot');
            if (dot) {
                dot.style.filter = 'drop-shadow(0 0 8px rgba(212, 165, 116, 0.8))';
            }
        }
    }
    
    showLocation(location, marker) {
        const data = this.locationData[location];
        if (!data) return;
        
        this.currentLocation = location;
        const panel = document.getElementById('contentPanel');
        const photosContent = document.getElementById('photosContent');
        const detailsContent = document.getElementById('detailsContent');
        const moreContent = document.getElementById('moreContent');
        const pageContainer = document.getElementById('pageContainer');
        
        // Reset page container to show photos first (page 0)
        pageContainer.setAttribute('data-current', '0');
        
        // Mark active location (without moving markers)
        document.querySelectorAll('.markers-overlay .craft-marker').forEach(m => {
            m.classList.remove('active');
            const dot = m.querySelector('.marker-dot');
            if (dot) {
                dot.style.filter = '';
            }
        });
        marker.classList.add('active');
        
        // Add active glow without moving
        const dot = marker.querySelector('.marker-dot');
        if (dot) {
            dot.style.filter = 'drop-shadow(0 0 10px rgba(244, 196, 48, 0.9))';
        }
        
        // Get city theme colors
        const theme = data.theme || {};
        const primaryColor = theme.primary || '#d4a574';
        const secondaryColor = theme.secondary || '#8b6f47';
        const accentColor = theme.accent || '#c9a961';
        
        // Create photos page HTML
        const photosHtml = `
            <div class="city-header" style="background: linear-gradient(135deg, ${primaryColor}15 0%, ${secondaryColor}25 100%); border-left: 5px solid ${primaryColor}; margin-bottom: 2rem;">
                <h1 style="color: ${primaryColor};">${data.title}</h1>
                <p class="city-subtitle" style="color: ${accentColor};">${data.craft}</p>
            </div>
            ${data.images && data.images.length > 0 ? data.images.map((img) => `
                <div class="photo-item">
                    <img src="${img.url}" alt="${img.alt || data.title}" 
                         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 800 600\'%3E%3Cdefs%3E%3ClinearGradient id=\'grad\' x1=\'0%25\' y1=\'0%25\' x2=\'100%25\' y2=\'100%25\'%3E%3Cstop offset=\'0%25\' style=\'stop-color:${primaryColor.replace('#', '%23')};stop-opacity:1\' /%3E%3Cstop offset=\'100%25\' style=\'stop-color:${secondaryColor.replace('#', '%23')};stop-opacity:1\' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=\'800\' height=\'600\' fill=\'url(%23grad)\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' font-size=\'24\' fill=\'white\' text-anchor=\'middle\' dominant-baseline=\'middle\'%3E${encodeURIComponent(img.alt || data.title)}%3C/text%3E%3C/svg%3E';">
                    ${img.caption ? `<div class="photo-caption">${img.caption}</div>` : ''}
                </div>
            `).join('') : `
                <div class="photo-item">
                    <img src="${data.image || ''}" alt="${data.title}" 
                         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 800 600\'%3E%3Cdefs%3E%3ClinearGradient id=\'grad\' x1=\'0%25\' y1=\'0%25\' x2=\'100%25\' y2=\'100%25\'%3E%3Cstop offset=\'0%25\' style=\'stop-color:${primaryColor.replace('#', '%23')};stop-opacity:1\' /%3E%3Cstop offset=\'100%25\' style=\'stop-color:${secondaryColor.replace('#', '%23')};stop-opacity:1\' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=\'800\' height=\'600\' fill=\'url(%23grad)\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' font-size=\'32\' fill=\'white\' text-anchor=\'middle\' dominant-baseline=\'middle\'%3E${encodeURIComponent(data.title)}%3C/text%3E%3C/svg%3E';">
                </div>
            `}
        `;
        
        // Create details page HTML with enhanced content
        let detailsHtml = `
            <div class="city-header" style="background: linear-gradient(135deg, ${primaryColor}15 0%, ${secondaryColor}25 100%); border-left: 5px solid ${primaryColor}; margin-bottom: 2rem;">
                <h1 style="color: ${primaryColor};">${data.title}</h1>
                <p class="city-subtitle" style="color: ${accentColor};">${data.craft}</p>
            </div>
            
            <div class="city-content" style="border-top: 2px solid ${primaryColor}40;">
                ${data.content}
            </div>
        `;
        
        // Add enhanced details section
        if (data.enhancedDetails) {
            detailsHtml += `
                <div class="enhanced-details" style="margin-top: 2rem; padding-top: 2rem; border-top: 2px solid ${primaryColor}40;">
                    ${data.enhancedDetails}
                </div>
            `;
        }
        
        // Add stats if available
        if (data.stats) {
            detailsHtml += `<div class="stats-grid" style="margin-top: 2rem;">`;
            Object.entries(data.stats).forEach(([key, value]) => {
                detailsHtml += `
                    <div class="stat-item">
                        <span class="stat-value">${value}</span>
                        <span class="stat-label">${key}</span>
                    </div>
                `;
            });
            detailsHtml += `</div>`;
        }
        
        // Create more info page HTML
        const moreInfoHtml = `
            <div class="city-header" style="background: linear-gradient(135deg, ${primaryColor}15 0%, ${secondaryColor}25 100%); border-left: 5px solid ${primaryColor}; margin-bottom: 2rem;">
                <h1 style="color: ${primaryColor};">${data.title}</h1>
                <p class="city-subtitle" style="color: ${accentColor};">${data.craft} - Additional Information</p>
            </div>
            
            <div class="city-content" style="border-top: 2px solid ${primaryColor}40;">
                ${data.moreInfo || `
                    <h2 style="color: ${primaryColor}; margin-bottom: 1.5rem;">Visit & Experience</h2>
                    <div class='content-features'>
                        <div class='feature'>
                            <h3>📍 How to Visit</h3>
                            <p>Most craft workshops are open to visitors. You can witness artisans at work, learn about the craft process, and purchase authentic handmade products directly from the creators. Many workshops are located in the old city areas, offering a glimpse into traditional Rajasthani life.</p>
                        </div>
                        <div class='feature'>
                            <h3>🎓 Learning Opportunities</h3>
                            <p>Several workshops offer short-term learning experiences where visitors can try their hand at the craft under the guidance of master artisans. These workshops provide hands-on experience and deeper appreciation for the skill and dedication required.</p>
                        </div>
                        <div class='feature'>
                            <h3>🛍️ Supporting Artisans</h3>
                            <p>When purchasing crafts, buying directly from artisans ensures fair compensation and helps sustain traditional practices. Many artisans also participate in craft fairs and exhibitions where you can meet them and learn their stories.</p>
                        </div>
                        <div class='feature'>
                            <h3>📸 Cultural Immersion</h3>
                            <p>Visiting craft workshops is not just about shopping—it's an opportunity to understand the cultural significance of these crafts, hear stories passed down through generations, and witness living traditions that continue to shape local communities.</p>
                        </div>
                    </div>
                `}
            </div>
        `;
        
        photosContent.innerHTML = photosHtml;
        detailsContent.innerHTML = detailsHtml;
        moreContent.innerHTML = moreInfoHtml;
        
        // Close about panel if open
        const aboutPanel = document.getElementById('aboutPanel');
        if (aboutPanel) {
            aboutPanel.classList.remove('open');
        }
        
        // Apply city theme to panel border
        panel.style.borderTopColor = primaryColor;
        panel.style.setProperty('--city-primary', primaryColor);
        panel.style.setProperty('--city-secondary', secondaryColor);
        panel.style.setProperty('--city-accent', accentColor);
        
        // Animate panel opening
        panel.classList.add('open');
        
        // Scroll to top
        photosContent.scrollTop = 0;
        detailsContent.scrollTop = 0;
        moreContent.scrollTop = 0;
        
        // Add entrance animations to content
        setTimeout(() => {
            const features = detailsContent.querySelectorAll('.feature');
            features.forEach((feature, index) => {
                setTimeout(() => {
                    feature.style.animation = `slideInRight 0.5s ease ${index * 0.1}s forwards`;
                }, index * 100);
            });
            
            const moreFeatures = moreContent.querySelectorAll('.feature');
            moreFeatures.forEach((feature, index) => {
                setTimeout(() => {
                    feature.style.animation = `slideInRight 0.5s ease ${index * 0.1}s forwards`;
                }, index * 100);
            });
        }, 100);
        
        // Add ripple effect to marker
        this.createRippleEffect(marker);
        
        // Setup page navigation
        this.setupPageNavigation(pageContainer);
        
        // Setup swipe functionality
        this.setupSwipe(pageContainer);
    }
    
    setupPageNavigation(pageContainer) {
        const mapInteraction = this;
        
        // Setup navigation buttons
        const navButtons = pageContainer.querySelectorAll('.nav-page-btn');
        navButtons.forEach(btn => {
            // Remove old listeners
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', (e) => {
                const nextPage = newBtn.getAttribute('data-next');
                const prevPage = newBtn.getAttribute('data-prev');
                
                if (nextPage !== null) {
                    mapInteraction.goToPage(pageContainer, parseInt(nextPage));
                } else if (prevPage !== null) {
                    mapInteraction.goToPage(pageContainer, parseInt(prevPage));
                }
            });
        });
    }
    
    goToPage(pageContainer, pageIndex) {
        pageContainer.setAttribute('data-current', pageIndex.toString());
        
        // Scroll the active page to top
        const pages = pageContainer.querySelectorAll('.page');
        if (pages[pageIndex]) {
            const pageContent = pages[pageIndex].querySelector('.page-content');
            if (pageContent) {
                pageContent.scrollTop = 0;
            }
        }
    }
    
    setupSwipe(pageContainer) {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        
        const pages = pageContainer.querySelectorAll('.page');
        
        const handleStart = (e) => {
            isDragging = true;
            startX = e.touches ? e.touches[0].clientX : e.clientX;
            pageContainer.style.transition = 'none';
            pages.forEach(page => {
                page.style.transition = 'none';
            });
        };
        
        const handleMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            currentX = e.touches ? e.touches[0].clientX : e.clientX;
            const diff = currentX - startX;
            const currentPage = parseInt(pageContainer.getAttribute('data-current') || '0');
            
            if (diff > 0 && currentPage < 2) {
                // Swiping right - go to next page
                const progress = Math.min(diff / 300, 1);
                const nextPage = currentPage + 1;
                const rotate = progress * 5;
                
                pages.forEach((page, index) => {
                    if (index === currentPage) {
                        page.style.transform = `translateX(${-progress * 100}%) rotateY(${rotate}deg)`;
                    } else if (index === nextPage) {
                        page.style.transform = `translateX(${(1 - progress) * 100}%) rotateY(${-rotate * 0.5}deg)`;
                    }
                });
            } else if (diff < 0 && currentPage > 0) {
                // Swiping left - go to previous page
                const progress = Math.min(Math.abs(diff) / 300, 1);
                const prevPage = currentPage - 1;
                const rotate = progress * 5;
                
                pages.forEach((page, index) => {
                    if (index === currentPage) {
                        page.style.transform = `translateX(${progress * 100}%) rotateY(${-rotate}deg)`;
                    } else if (index === prevPage) {
                        page.style.transform = `translateX(${-(1 - progress) * 100}%) rotateY(${rotate * 0.5}deg)`;
                    }
                });
            }
        };
        
        const handleEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            pageContainer.style.transition = '';
            pages.forEach(page => {
                page.style.transition = '';
            });
            
            const diff = currentX - startX;
            const currentPage = parseInt(pageContainer.getAttribute('data-current') || '0');
            
            const mapInteraction = this;
            if (diff > 100 && currentPage < 2) {
                // Swiped right - go to next page
                mapInteraction.goToPage(pageContainer, currentPage + 1);
            } else if (diff < -100 && currentPage > 0) {
                // Swiped left - go to previous page
                mapInteraction.goToPage(pageContainer, currentPage - 1);
            } else {
                // Reset pages
                pages.forEach(page => {
                    page.style.transform = '';
                });
            }
        };
        
        // Add listeners to all pages
        pages.forEach(page => {
            page.addEventListener('touchstart', handleStart, { passive: false });
            page.addEventListener('touchmove', handleMove, { passive: false });
            page.addEventListener('touchend', handleEnd);
            page.addEventListener('mousedown', handleStart);
            page.addEventListener('mousemove', handleMove);
            page.addEventListener('mouseup', handleEnd);
            page.addEventListener('mouseleave', handleEnd);
        });
    }
    
    createRippleEffect(marker) {
        const markerDot = marker.querySelector('.marker-dot');
        if (!markerDot) return;
        
        // Create multiple ripples for enhanced effect
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const ripple = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                const x = markerDot.getAttribute('cx');
                const y = markerDot.getAttribute('cy');
                
                ripple.setAttribute('cx', x);
                ripple.setAttribute('cy', y);
                ripple.setAttribute('r', '8');
                ripple.setAttribute('fill', 'none');
                ripple.setAttribute('stroke', '#d4a574');
                ripple.setAttribute('stroke-width', '2');
                ripple.setAttribute('opacity', '0.8');
                ripple.setAttribute('class', 'ripple-effect');
                
                marker.appendChild(ripple);
                
                let radius = 8;
                const animate = () => {
                    radius += 5;
                    ripple.setAttribute('r', radius);
                    const opacity = 0.8 - (radius - 8) / 50;
                    ripple.setAttribute('opacity', Math.max(0, opacity));
                    
                    if (opacity > 0) {
                        requestAnimationFrame(animate);
                    } else {
                        ripple.remove();
                    }
                };
                
                animate();
            }, i * 100);
        }
    }
    
    closePanel() {
        const panel = document.getElementById('contentPanel');
        if (panel) {
            panel.classList.remove('open');
        }
        
        // Reset page container to first page
        const pageContainer = document.getElementById('pageContainer');
        if (pageContainer) {
            pageContainer.setAttribute('data-current', '0');
        }
        
        // Remove active class from markers (without movement)
        document.querySelectorAll('.markers-overlay .craft-marker').forEach(m => {
            m.classList.remove('active');
            const dot = m.querySelector('.marker-dot');
            if (dot) {
                dot.style.filter = '';
            }
        });
    }
}

// Animated Drawing Controller
class DrawingController {
    constructor() {
        this.init();
    }
    
    init() {
        // Animate craft drawing on load
        setTimeout(() => {
            this.animateDrawing();
        }, 1000);
        
        // Add hover effects
        const drawing = document.querySelector('.craft-illustration');
        if (drawing) {
            drawing.addEventListener('mouseenter', () => {
                this.addCraftEffect();
            });
        }
    }
    
    animateDrawing() {
        const wheel = document.querySelector('.wheel');
        const pot = document.querySelector('.pot');
        const hands = document.querySelectorAll('.hand');
        
        if (wheel) {
            setTimeout(() => {
                wheel.style.animation = 'fadeIn 1s ease forwards';
            }, 200);
        }
        
        if (pot) {
            setTimeout(() => {
                pot.style.animation = 'fadeInScale 1s ease 0.5s backwards';
            }, 500);
        }
        
        hands.forEach((hand, index) => {
            setTimeout(() => {
                hand.style.animation = 'fadeIn 0.8s ease forwards';
            }, 700 + (index * 100));
        });
    }
    
    addCraftEffect() {
        const pot = document.querySelector('.pot');
        if (pot) {
            pot.style.animation = 'craftPulse 2s ease-in-out infinite';
        }
    }
}

// Floating Elements Animation
class FloatingElements {
    constructor() {
        this.createFloatingIcons();
    }
    
    createFloatingIcons() {
        const icons = ['🎨', '🖌️', '✨', '🏺', '🧵', '💎'];
        const container = document.querySelector('.interactive-map-view');
        
        icons.forEach((icon, index) => {
            const element = document.createElement('div');
            element.textContent = icon;
            element.className = 'floating-icon';
            element.style.cssText = `
                position: absolute;
                font-size: 2rem;
                opacity: 0.3;
                pointer-events: none;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float-random ${5 + Math.random() * 5}s ease-in-out infinite;
                animation-delay: ${index * 0.5}s;
            `;
            container.appendChild(element);
        });
        
        // Add floating animation style
        if (!document.getElementById('floating-styles')) {
            const style = document.createElement('style');
            style.id = 'floating-styles';
            style.textContent = `
                @keyframes float-random {
                    0%, 100% {
                        transform: translate(0, 0) rotate(0deg);
                        opacity: 0.3;
                    }
                    25% {
                        transform: translate(20px, -30px) rotate(90deg);
                        opacity: 0.5;
                    }
                    50% {
                        transform: translate(-15px, -50px) rotate(180deg);
                        opacity: 0.4;
                    }
                    75% {
                        transform: translate(30px, -20px) rotate(270deg);
                        opacity: 0.5;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Cursor Trail Effect
class CursorTrail {
    constructor() {
        this.trails = [];
        this.init();
    }
    
    init() {
        document.addEventListener('mousemove', (e) => {
            this.createTrail(e.clientX, e.clientY);
        });
    }
    
    createTrail(x, y) {
        if (this.trails.length > 5) {
            const oldTrail = this.trails.shift();
            if (oldTrail && oldTrail.parentNode) {
                oldTrail.remove();
            }
        }
        
        const trail = document.createElement('div');
        trail.className = 'cursor-trail';
        trail.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: radial-gradient(circle, rgba(212, 165, 116, 0.8) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            left: ${x}px;
            top: ${y}px;
            z-index: 9999;
            animation: trail-fade 0.5s ease-out forwards;
        `;
        
        document.body.appendChild(trail);
        this.trails.push(trail);
        
        // Add trail fade animation if not exists
        if (!document.getElementById('trail-styles')) {
            const style = document.createElement('style');
            style.id = 'trail-styles';
            style.textContent = `
                @keyframes trail-fade {
                    0% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: scale(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Image Loading with Placeholder
function loadImageWithFallback(imgElement, src, fallbackText) {
    imgElement.onerror = function() {
        // Create SVG placeholder
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
                <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#8b6f47;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#2c2416;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <rect width="800" height="600" fill="url(#grad)"/>
                <text x="50%" y="50%" font-size="24" fill="#d4a574" text-anchor="middle" dominant-baseline="middle" font-family="Arial">${fallbackText}</text>
            </svg>
        `;
        imgElement.src = 'data:image/svg+xml,' + encodeURIComponent(svg);
    };
}

// Button Handlers
function setupButtons() {
    const startExploringBtn = document.getElementById('startExploring');
    const goHomeBtn = document.getElementById('goHome');
    const toggleInfoBtn = document.getElementById('toggleInfo');
    const homePage = document.getElementById('homePage');
    const mapContainer = document.getElementById('mapContainer');
    const contentPanel = document.getElementById('contentPanel');
    const aboutPanel = document.getElementById('aboutPanel');
    const closeAboutBtn = document.getElementById('closeAbout');
    
    // Function to show map
    const showMap = () => {
        homePage.classList.add('hidden');
        mapContainer.style.display = 'flex';
        setTimeout(() => {
            mapContainer.style.opacity = '1';
        }, 50);
    };
    
    // Start Exploring button - show map
    if (startExploringBtn) {
        startExploringBtn.addEventListener('click', showMap);
    }
    
    // Feature cards - make them clickable to show map
    const featureCard1 = document.getElementById('featureCard1');
    const featureCard2 = document.getElementById('featureCard2');
    const featureCard3 = document.getElementById('featureCard3');
    
    if (featureCard1) {
        featureCard1.addEventListener('click', showMap);
    }
    if (featureCard2) {
        featureCard2.addEventListener('click', showMap);
    }
    if (featureCard3) {
        featureCard3.addEventListener('click', showMap);
    }
    
    // Go Home button - show home page
    if (goHomeBtn) {
        goHomeBtn.addEventListener('click', () => {
            mapContainer.style.display = 'none';
            homePage.classList.remove('hidden');
            contentPanel.classList.remove('open');
            aboutPanel.classList.remove('open');
        });
    }
    
    // About button - toggle about panel
    if (toggleInfoBtn) {
        toggleInfoBtn.addEventListener('click', () => {
            // Close content panel if open
            contentPanel.classList.remove('open');
            // Toggle about panel
            aboutPanel.classList.toggle('open');
        });
    }
    
    // Close About button
    if (closeAboutBtn) {
        closeAboutBtn.addEventListener('click', () => {
            aboutPanel.classList.remove('open');
        });
    }
    
    // Close about panel when clicking outside
    if (aboutPanel) {
        aboutPanel.addEventListener('click', (e) => {
            if (e.target === aboutPanel) {
                aboutPanel.classList.remove('open');
            }
        });
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize particle system
    const canvas = document.getElementById('particles');
    if (canvas) {
        new ParticleSystem(canvas);
    }
    
    // Initialize map interaction
    new MapInteraction();
    
    // Initialize drawing controller
    new DrawingController();
    
    // Initialize floating elements
    new FloatingElements();
    
    // Setup button handlers
    setupButtons();
    
    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const contentPanel = document.getElementById('contentPanel');
            const aboutPanel = document.getElementById('aboutPanel');
            if (contentPanel.classList.contains('open')) {
                contentPanel.classList.remove('open');
            }
            if (aboutPanel.classList.contains('open')) {
                aboutPanel.classList.remove('open');
            }
        }
    });
    
    console.log('🎨 Rajasthan Traditional Crafts Interactive Map Loaded');
});

// Prevent marker movement - use only filter and opacity for effects
setTimeout(() => {
    document.querySelectorAll('.markers-overlay .craft-marker').forEach(marker => {
        // Ensure markers don't move
        marker.style.transform = 'translate(0, 0)';
        marker.style.willChange = 'filter, opacity';
    });
}, 100);