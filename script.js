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
        this.allCrafts = Object.values(this.locationData).map(location => location.craft).filter(Boolean);
        this.locationNames = Object.values(this.locationData).map(location => {
            if (!location.title) return '';
            return location.title.includes(' - ') ? location.title.split(' - ')[0].trim() : location.title;
        }).filter(Boolean);
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
        const locationName = data.title ? (data.title.includes(' - ') ? data.title.split(' - ')[0].trim() : data.title) : location;
        
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

            <div class="interactive-experiences" data-location="${location}">
                <h2>Interactive Craft Lab</h2>
                <p class="interactive-intro">Test your knowledge, design patterns, and spin stories inspired by ${data.craft} in ${locationName}.</p>
                <div class="interactive-grid">
                    <div class="interactive-card quiz-card">
                        <div class="interactive-card-header">
                            <span class="interactive-icon">❓</span>
                            <h3>Craft Quiz</h3>
                        </div>
                        <p>Answer quick questions about the traditions of ${locationName}.</p>
                        <button class="quiz-start">Start Quiz</button>
                        <div class="quiz-content" aria-live="polite"></div>
                    </div>
                    <div class="interactive-card pattern-card">
                        <div class="interactive-card-header">
                            <span class="interactive-icon">🎨</span>
                            <h3>Draw Your Craft</h3>
                        </div>
                        <p>Draw something inspired by ${data.craft} using colors and patterns from ${locationName}.</p>
                        <div class="drawing-toolbar">
                            <div class="color-picker-group">
                                <label for="drawing-color-picker" class="color-picker-label">Color:</label>
                                <input type="color" id="drawing-color-picker" class="drawing-color-picker" value="${primaryColor}" title="Choose your drawing color">
                                <div class="preset-colors">
                                    <button class="preset-color" data-color="${primaryColor}" style="background: ${primaryColor}" title="Primary craft color"></button>
                                    <button class="preset-color" data-color="${secondaryColor}" style="background: ${secondaryColor}" title="Secondary craft color"></button>
                                    <button class="preset-color" data-color="${accentColor}" style="background: ${accentColor}" title="Accent craft color"></button>
                                </div>
                            </div>
                            <div class="brush-controls">
                                <label for="brush-size" class="brush-size-label">Brush Size: <span class="brush-size-value">10</span>px</label>
                                <input type="range" id="brush-size" class="brush-size-slider" min="2" max="50" value="10" title="Adjust brush size">
                            </div>
                            <div class="drawing-tools">
                                <button class="drawing-tool-btn active" data-tool="brush" title="Brush tool">🖌️</button>
                                <button class="drawing-tool-btn" data-tool="eraser" title="Eraser tool">🧹</button>
                                <button class="pattern-clear" aria-label="Clear canvas">Clear Canvas</button>
                            </div>
                        </div>
                        <div class="drawing-canvas-container">
                            <canvas class="drawing-canvas" width="600" height="400" aria-label="Drawing canvas for ${data.craft}"></canvas>
                        </div>
                    </div>
                    <div class="interactive-card story-card">
                        <div class="interactive-card-header">
                            <span class="interactive-icon">🌀</span>
                            <h3>Spin a Story</h3>
                        </div>
                        <p>Generate a playful story about artisans in ${locationName}.</p>
                        <button class="story-spin">Spin Story</button>
                        <p class="story-output" aria-live="polite"></p>
                    </div>
                </div>
            </div>
        `;
        
        photosContent.innerHTML = photosHtml;
        detailsContent.innerHTML = detailsHtml;
        moreContent.innerHTML = moreInfoHtml;
        this.initializeInteractiveExperiences(location, data);
        
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
        let hasMoved = false;
        
        const pages = pageContainer.querySelectorAll('.page');
        
        const handleStart = (e) => {
            isDragging = true;
            hasMoved = false;
            startX = e.touches ? e.touches[0].clientX : e.clientX;
            currentX = startX;
            pageContainer.style.transition = 'none';
            pages.forEach(page => {
                page.style.transition = 'none';
            });
        };
        
        const handleMove = (e) => {
            if (!isDragging) return;
            if (e.cancelable) {
                e.preventDefault();
            }
            currentX = e.touches ? e.touches[0].clientX : e.clientX;
            const diff = currentX - startX;
            const currentPage = parseInt(pageContainer.getAttribute('data-current') || '0');
            
            if (Math.abs(diff) < 15) {
                return;
            }

            hasMoved = true;

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
            if (!hasMoved || Math.abs(diff) < 80) {
                pages.forEach(page => {
                    page.style.transform = '';
                });
                return;
            }

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
    
    initializeInteractiveExperiences(locationKey, data) {
        const moreContent = document.getElementById('moreContent');
        if (!moreContent) return;
        
        const container = moreContent.querySelector(`.interactive-experiences[data-location="${locationKey}"]`);
        if (!container) return;
        
        this.setupQuiz(container, locationKey, data);
        this.setupPattern(container, data);
        this.setupStorySpinner(container, data);
    }
    
    setupQuiz(container, locationKey, data) {
        const quizCard = container.querySelector('.quiz-card');
        if (!quizCard) return;
        
        const startBtn = quizCard.querySelector('.quiz-start');
        const quizContent = quizCard.querySelector('.quiz-content');
        
        if (!startBtn || !quizContent) return;
        
        const startQuiz = () => {
            const questions = this.generateQuizQuestions(locationKey, data);
            if (!questions.length) {
                quizContent.innerHTML = `<p class="quiz-message">Quiz content coming soon. Meanwhile, explore the stories above!</p>`;
                startBtn.classList.remove('hidden');
                return;
            }
            
            startBtn.classList.add('hidden');
            
            let currentIndex = 0;
            let score = 0;
            
            const renderQuestion = () => {
                const currentQuestion = questions[currentIndex];
                if (!currentQuestion) return;
                
                quizContent.innerHTML = `
                    <div class="quiz-question">
                        <p>${currentQuestion.question}</p>
                    </div>
                    <div class="quiz-options"></div>
                `;
                
                const optionsContainer = quizContent.querySelector('.quiz-options');
                currentQuestion.options.forEach(option => {
                    const optionBtn = document.createElement('button');
                    optionBtn.className = 'quiz-option';
                    optionBtn.type = 'button';
                    optionBtn.textContent = option.label;
                    optionBtn.dataset.correct = option.isCorrect ? 'true' : 'false';
                    
                    optionBtn.addEventListener('click', () => {
                        if (optionBtn.classList.contains('answered')) return;
                        
                        const wasCorrect = option.isCorrect;
                        if (wasCorrect) {
                            optionBtn.classList.add('correct');
                            score++;
                        } else {
                            optionBtn.classList.add('incorrect');
                        }
                        optionBtn.classList.add('answered');
                        
                        optionsContainer.querySelectorAll('.quiz-option').forEach(btn => {
                            if (btn !== optionBtn) {
                                btn.classList.add('disabled');
                            }
                            if (btn.dataset.correct === 'true') {
                                btn.classList.add('correct');
                            }
                            btn.disabled = true;
                        });
                        
                        const explanation = document.createElement('div');
                        explanation.className = 'quiz-explanation';
                        explanation.innerHTML = currentQuestion.explanation || (wasCorrect
                            ? 'Nice! You spotted the right answer.'
                            : `The correct answer is <strong>${currentQuestion.options.find(opt => opt.isCorrect).label}</strong>.`);
                        quizContent.appendChild(explanation);
                        
                        const nextBtn = document.createElement('button');
                        nextBtn.className = 'quiz-next';
                        nextBtn.type = 'button';
                        nextBtn.textContent = currentIndex === questions.length - 1 ? 'See Results' : 'Next Question';
                        nextBtn.addEventListener('click', () => {
                            currentIndex++;
                            if (currentIndex < questions.length) {
                                renderQuestion();
                            } else {
                                showResults();
                            }
                        });
                        quizContent.appendChild(nextBtn);
                    });
                    
                    optionsContainer.appendChild(optionBtn);
                });
            };
            
            const showResults = () => {
                const total = questions.length;
                const message = score === total
                    ? 'Perfect! You know this craft inside out.'
                    : score >= Math.ceil(total * 0.7)
                        ? 'Great job! You\'re on your way to becoming a craft expert.'
                        : 'Keep exploring! Each visit reveals more stories.';
                
                quizContent.innerHTML = `
                    <div class="quiz-results">
                        <p class="quiz-score">You scored <strong>${score}</strong> out of <strong>${total}</strong>.</p>
                        <p class="quiz-message">${message}</p>
                    </div>
                `;
                
                const replayBtn = document.createElement('button');
                replayBtn.className = 'quiz-restart';
                replayBtn.type = 'button';
                replayBtn.textContent = 'Play Again';
                replayBtn.addEventListener('click', () => {
                    startQuiz();
                });
                
                quizContent.appendChild(replayBtn);
            };
            
            renderQuestion();
        };
        
        startBtn.addEventListener('click', startQuiz);
    }
    
    generateQuizQuestions(locationKey, data) {
        const questions = [];
        const locationName = data.title ? (data.title.includes(' - ') ? data.title.split(' - ')[0].trim() : data.title) : locationKey;
        
        const craftQuestion = {
            question: `Which craft tradition are you exploring in ${locationName}?`,
            options: this.shuffleArray([
                { label: data.craft, isCorrect: true },
                ...this.pickRandomItems(this.allCrafts, 3, [data.craft]).map(craft => ({
                    label: craft,
                    isCorrect: false
                }))
            ]),
            explanation: `${locationName} is known for <strong>${data.craft}</strong>, a craft featured on the previous pages.`
        };
        questions.push(craftQuestion);
        
        if (data.stats && Object.keys(data.stats).length > 0) {
            const statQuestion = this.createStatQuestion(data, locationName);
            if (statQuestion) {
                questions.push(statQuestion);
            }
        } else {
            const locationQuestion = {
                question: 'Which destination are you currently exploring?',
                options: this.shuffleArray([
                    { label: locationName, isCorrect: true },
                    ...this.pickRandomItems(this.locationNames, 3, [locationName]).map(name => ({
                        label: name,
                        isCorrect: false
                    }))
                ]),
                explanation: `These pages focus on <strong>${locationName}</strong>—remember to check the marker label on the map.`
            };
            questions.push(locationQuestion);
        }
        
        const supportQuestion = {
            question: 'What is one of the best ways to support artisans you visit?',
            options: this.shuffleArray([
                { label: 'Buy directly from their workshops and studios', isCorrect: true },
                { label: 'Bargain hard to get the lowest possible price', isCorrect: false },
                { label: 'Ask them to copy mass-produced designs you found online', isCorrect: false },
                { label: 'Take photos without interaction and leave immediately', isCorrect: false }
            ]),
            explanation: 'Purchasing directly ensures artisans receive fair payment and keeps traditions thriving.'
        };
        questions.push(supportQuestion);
        
        return questions;
    }
    
    createStatQuestion(data, locationName) {
        const statsEntries = Object.entries(data.stats || {});
        if (!statsEntries.length) return null;
        
        const [statKey, statValue] = this.randomElement(statsEntries);
        const friendlyLabel = this.formatStatLabel(statKey);
        const alternatives = this.generateStatAlternatives(statValue);
        
        return {
            question: `Approximately how many ${friendlyLabel} are part of this tradition?`,
            options: this.shuffleArray([
                { label: statValue, isCorrect: true },
                ...alternatives.map(value => ({
                    label: value,
                    isCorrect: false
                }))
            ]),
            explanation: `${data.craft} in ${locationName} involves around <strong>${statValue} ${friendlyLabel}</strong>.`
        };
    }
    
    formatStatLabel(label) {
        return label
            .replace(/_/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase());
    }
    
    generateStatAlternatives(statValue) {
        const alternatives = new Set();
        const numericMatch = statValue.match(/(\d+)/);
        const suffixMatch = statValue.match(/[^\d]+$/);
        const suffix = suffixMatch ? suffixMatch[0] : '';
        
        if (numericMatch) {
            const baseNumber = parseInt(numericMatch[0], 10);
            if (!Number.isNaN(baseNumber)) {
                const variations = [
                    Math.max(1, Math.round(baseNumber * 0.6)),
                    Math.max(1, Math.round(baseNumber * 0.85)),
                    Math.round(baseNumber * 1.2),
                    Math.round(baseNumber * 1.4)
                ];
                
                variations.forEach(value => {
                    if (`${value}${suffix}` !== statValue && alternatives.size < 3) {
                        alternatives.add(`${value}${suffix}`);
                    }
                });
            }
        }
        
        const fallback = ['40+', '75+', '120+', '250+', '500+'];
        while (alternatives.size < 3) {
            const candidate = this.randomElement(fallback);
            if (candidate !== statValue) {
                alternatives.add(candidate);
            }
        }
        
        return Array.from(alternatives).slice(0, 3);
    }
    
    pickRandomItems(source, count, exclude = []) {
        const pool = source.filter(item => !exclude.includes(item));
        return this.shuffleArray(pool).slice(0, count);
    }
    
    shuffleArray(array) {
        return array
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
    }
    
    randomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    setupPattern(container, data) {
        const patternCard = container.querySelector('.pattern-card');
        if (!patternCard) return;
        
        const canvas = patternCard.querySelector('.drawing-canvas');
        const colorPicker = patternCard.querySelector('.drawing-color-picker');
        const presetColors = patternCard.querySelectorAll('.preset-color');
        const brushSizeSlider = patternCard.querySelector('.brush-size-slider');
        const brushSizeValue = patternCard.querySelector('.brush-size-value');
        const toolButtons = patternCard.querySelectorAll('.drawing-tool-btn');
        const clearButton = patternCard.querySelector('.pattern-clear');
        
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const primary = data.theme?.primary || '#d4a574';
        const secondary = data.theme?.secondary || '#8b6f47';
        const accent = data.theme?.accent || '#c9a961';
        
        // Set canvas background
        ctx.fillStyle = '#1a1612';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Drawing state
        let isDrawing = false;
        let currentColor = primary;
        let brushSize = 10;
        let currentTool = 'brush';
        let lastX = 0;
        let lastY = 0;
        
        // Set initial color
        if (colorPicker) {
            colorPicker.value = primary;
        }
        
        // Update brush size display
        const updateBrushSize = (size) => {
            brushSize = size;
            if (brushSizeValue) {
                brushSizeValue.textContent = size;
            }
        };
        
        if (brushSizeSlider) {
            brushSizeSlider.addEventListener('input', (e) => {
                updateBrushSize(parseInt(e.target.value, 10));
            });
        }
        
        // Color picker
        if (colorPicker) {
            colorPicker.addEventListener('input', (e) => {
                currentColor = e.target.value;
            });
        }
        
        // Preset colors
        presetColors.forEach(btn => {
            btn.addEventListener('click', () => {
                const color = btn.dataset.color;
                if (color && colorPicker) {
                    colorPicker.value = color;
                    currentColor = color;
                }
            });
        });
        
        // Tool selection
        toolButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tool = btn.dataset.tool;
                if (tool) {
                    currentTool = tool;
                    toolButtons.forEach(b => b.classList.toggle('active', b === btn));
                }
            });
        });
        
        // Get canvas coordinates
        const getCanvasCoordinates = (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            
            return {
                x: (clientX - rect.left) * scaleX,
                y: (clientY - rect.top) * scaleY
            };
        };
        
        // Draw function
        const draw = (x, y) => {
            ctx.lineWidth = brushSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            if (currentTool === 'brush') {
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = currentColor;
            } else if (currentTool === 'eraser') {
                ctx.globalCompositeOperation = 'destination-out';
            }
            
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.stroke();
            
            lastX = x;
            lastY = y;
        };
        
        // Start drawing
        const startDrawing = (e) => {
            isDrawing = true;
            const coords = getCanvasCoordinates(e);
            lastX = coords.x;
            lastY = coords.y;
        };
        
        // Continue drawing
        const continueDrawing = (e) => {
            if (!isDrawing) return;
            e.preventDefault();
            const coords = getCanvasCoordinates(e);
            draw(coords.x, coords.y);
        };
        
        // Stop drawing
        const stopDrawing = () => {
            isDrawing = false;
        };
        
        // Mouse events
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', continueDrawing);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);
        
        // Touch events
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startDrawing(e);
        });
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            continueDrawing(e);
        });
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            stopDrawing();
        });
        
        // Clear canvas
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                ctx.fillStyle = '#1a1612';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            });
        }
        
        // Make canvas responsive
        const resizeCanvas = () => {
            const container = canvas.parentElement;
            if (!container) return;
            
            const containerWidth = container.clientWidth;
            const aspectRatio = canvas.width / canvas.height;
            const newHeight = containerWidth / aspectRatio;
            
            canvas.style.width = containerWidth + 'px';
            canvas.style.height = newHeight + 'px';
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }
    
    setupStorySpinner(container, data) {
        const storyCard = container.querySelector('.story-card');
        if (!storyCard) return;
        
        const spinBtn = storyCard.querySelector('.story-spin');
        const storyOutput = storyCard.querySelector('.story-output');
        
        if (!spinBtn || !storyOutput) return;
        
        const locationName = data.title ? (data.title.includes(' - ') ? data.title.split(' - ')[0].trim() : data.title) : '';
        const craftName = data.craft || 'this craft';
        const locationKey = container.closest('.interactive-experiences')?.dataset.location || '';
        
        spinBtn.addEventListener('click', () => {
            const story = this.generateCraftStory(locationKey, locationName, craftName, data);
            storyOutput.innerHTML = story;
        });
    }
    
    generateCraftStory(locationKey, locationName, craftName, data) {
        // Extract craft-specific details from data
        const stats = data.stats || {};
        const artisanCount = stats.artisans || stats.workshops || 'many';
        const generations = stats.generations || 'several';
        
        // Craft-specific story templates
        const storyTemplates = {
            'blue-pottery': () => `
                <p>In the narrow lanes of <strong>${locationName}</strong>, where pink sandstone walls glow in the morning light, 
                Master Rajesh begins his day at the blue pottery workshop that has been in his family for ${generations} generations. 
                His grandfather taught him the secret of mixing quartz, glass, and multani mitti—a technique passed down since the 14th century 
                when Persian artisans first brought this craft to Rajasthan.</p>
                
                <p>Today, Rajesh is teaching his 14-year-old daughter Priya how to shape a water pot. "Remember," he says, 
                "we don't use clay like other potters. Our mixture is unique—it makes the pottery lighter and gives it that 
                beautiful turquoise glaze." Priya's hands move carefully, learning the rhythm that her ancestors perfected over centuries.</p>
                
                <p>As tourists visit the workshop, Rajesh explains how blue pottery isn't just decorative—it's part of daily life. 
                "My grandmother used these pots to store pickles and water. They keep food fresh and cool in our hot climate." 
                A visitor asks about the intricate floral patterns. "Each pattern tells a story," Rajesh smiles. 
                "This one represents the monsoon rains that bring life to our desert."</p>
                
                <p>By evening, Priya has created her first small bowl. It's imperfect, but her father's eyes shine with pride. 
                "In a few years, you'll be teaching your own children," he says. As the sun sets over the Pink City, 
                the workshop glows with the turquoise pieces drying in the courtyard—a living tradition that continues to shape 
                both the city's culture and its families' futures.</p>
            `,
            
            'block-printing': () => {
                const isBagru = locationKey.includes('bagru');
                const dyeDetails = isBagru 
                    ? 'pomegranate for yellow, indigo for blue, and madder for red—all from natural sources, just as artisans have done for over 400 years'
                    : 'carefully mixed natural dyes that create the vibrant colors Sanganer is famous for';
                
                return `
                    <p>The courtyard of the Sharma family workshop in <strong>${locationName}</strong> comes alive at dawn. 
                    Three generations work together: grandmother Kamla prepares the fabric, father Vikram mixes the dyes, 
                    and young Ravi practices carving wooden blocks. This is block printing, a craft that has sustained their 
                    family for ${generations} generations.</p>
                    
                    <p>"Watch carefully," Vikram tells Ravi as he demonstrates the precise hand-printing technique. 
                    "Each block must be placed exactly right, or the pattern won't align." The wooden blocks, carved with 
                    intricate ${isBagru ? 'traditional motifs' : 'floral patterns'}, are family heirlooms—some over a hundred years old. 
                    Ravi's great-grandfather carved many of them, and each tells a story of Rajasthan's culture.</p>
                    
                    <p>Kamla explains the dyeing process: "We use only natural dyes—${dyeDetails}. 
                    No chemicals, no shortcuts. This is how our ancestors did it, and this is how we honor their memory." 
                    The fabric, once plain white, transforms into a canvas of vibrant colors and patterns that reflect 
                    the desert landscape, festivals, and daily life of Rajasthan.</p>
                    
                    <p>As visitors arrive, they see the entire family working in harmony. "This isn't just our job," Vikram says, 
                    "it's our identity. When people wear our fabrics, they carry a piece of our heritage." By evening, 
                    yards of beautifully printed fabric hang to dry in the courtyard, ready to become sarees, dupattas, 
                    and home textiles that will be treasured for years to come.</p>
                `;
            },
            
            'leather': () => `
                <p>In the blue lanes of <strong>${locationName}</strong>'s old city, hidden behind a carved wooden door, 
                sits the workshop of Master Ahmed, a leather craftsman whose family has been making traditional mojris 
                and juttis for ${generations} generations. The workshop, passed down through his family, is small but filled 
                with the tools and materials of his trade.</p>
                
                <p>Ahmed's hands move with practiced precision as he stitches intricate embroidery onto a pair of mojris. 
                "These aren't just shoes," he explains to a curious visitor. "They're designed for our hot climate—breathable, 
                comfortable, and beautiful. My grandfather made them for the royal court, and now I make them for people 
                who appreciate traditional craftsmanship."</p>
                
                <p>His daughter Fatima, 16, sits nearby, learning the art of hand-stitching. "It takes years to master," 
                Ahmed says. "But once you learn, you can create anything—from simple everyday footwear to elaborate pieces 
                for weddings and festivals." Fatima's first pair of mojris took her three weeks to complete, but her father 
                displays them proudly in the workshop window.</p>
                
                <p>As the afternoon sun filters through the blue-painted windows, Ahmed tells stories of how leather craft 
                evolved in Jodhpur—from royal saddles to everyday footwear, always adapting while preserving traditional techniques. 
                "Our craft connects us to the past," he reflects, "but it also provides for our future. Each pair of mojris 
                carries the skill and care of generations."</p>
            `,
            
            'terracotta': () => `
                <p>In the small village of <strong>${locationName}</strong>, where red earth meets the sky, 
                the Kumar family creates terracotta plaques that are more than decoration—they're sacred art. 
                Master Suresh, a third-generation artisan, begins his day by preparing the local clay, 
                the same clay his grandfather used when he started this family tradition.</p>
                
                <p>"These plaques aren't just for tourists," Suresh explains as he shapes a flat-relief piece depicting 
                a local deity. "They're used in temples and homes for worship. Each one is made with devotion." 
                His wife Meera helps with the intricate details, carving patterns that tell stories of rural Rajasthan—farmers, 
                animals, and daily village life.</p>
                
                <p>Their son Arjun, 12, watches and learns. "I started helping when I was eight," he says proudly. 
                "First, I just prepared the clay. Now I can make simple patterns." The family works together, 
                each member contributing to pieces that will be used in religious ceremonies and festivals throughout the region.</p>
                
                <p>As evening approaches, the finished plaques are arranged in the courtyard to dry in the sun. 
                Tomorrow, they'll be fired in the traditional kiln, transforming the soft clay into durable terracotta. 
                "This craft keeps our village connected to its spiritual roots," Suresh reflects. 
                "Every plaque we make carries prayers and preserves our culture for the next generation."</p>
            `,
            
            'puppets': () => `
                <p>In <strong>${locationName}</strong>, the City of Lakes, the Bhat family prepares for an evening performance. 
                Master Ramlal, a puppeteer for over 40 years, checks his Kathputli puppets—colorful wooden figures with 
                elaborate costumes that have entertained audiences across Rajasthan for generations.</p>
                
                <p>"Each puppet takes days to make," Ramlal explains as he adjusts a puppet's strings. 
                "The head is carved from mango wood, painted with natural colors, and dressed in traditional costumes. 
                But the real magic happens when we bring them to life on stage." His wife Sita helps prepare the portable 
                stage, while their children practice the music and storytelling that accompany the performance.</p>
                
                <p>Tonight's show tells a story from the Ramayana, adapted for a local audience. "Puppet shows aren't just 
                entertainment," Ramlal says. "They preserve our oral traditions and teach moral lessons. 
                In villages where people can't read, these performances keep our stories alive."</p>
                
                <p>As the sun sets over the lakes, the family sets up their stage in a courtyard. Children gather, 
                their eyes wide with anticipation. When the performance begins, the puppets dance and tell stories, 
                their colorful costumes catching the light. The audience laughs, gasps, and applauds—connected to a 
                tradition that has brought communities together for centuries. "This is our heritage," Ramlal smiles, 
                "and as long as people want to hear stories, we'll keep performing."</p>
            `,
            
            'miniature': () => `
                <p>In a quiet studio in <strong>${locationName}</strong>, artist Meera works on a miniature painting that 
                will take her three months to complete. Using a brush made from a single squirrel hair, she creates 
                intricate details that define the famous Bani Thani style—elongated eyes, sharp features, and rich colors 
                that make Kishangarh miniatures instantly recognizable.</p>
                
                <p>"This isn't just painting," Meera explains, her hand steady as she adds fine details to a court scene. 
                "It's meditation. Each stroke requires complete focus. One mistake, and you start over." 
                She learned from her father, who learned from his father—a tradition of precision and patience passed down 
                through ${generations} generations.</p>
                
                <p>Her studio walls are lined with completed works depicting scenes from history, mythology, and daily life. 
                "These paintings preserve our culture," she says. "They show how people lived, what they valued, 
                how they celebrated. Future generations will learn about Rajasthan through these images."</p>
                
                <p>As evening light filters through the window, Meera puts down her brush. Today's work is complete—just 
                a few square inches of canvas, but filled with stories and skill. "Miniature painting teaches you patience," 
                she reflects. "In our fast world, this craft reminds us that some things are worth taking time for. 
                Each painting is a piece of history, created with the same techniques artists used centuries ago."</p>
            `,
            
            'bandhani': () => `
                <p>In <strong>${locationName}</strong>, the women of the Patel family gather in their courtyard, 
                their hands moving in a rhythm perfected over generations. They're creating bandhani—tie-dye fabric 
                that's essential for Rajasthani weddings and festivals. Grandmother Leela, 75, still ties the most 
                intricate patterns, her fingers remembering techniques she learned as a child.</p>
                
                <p>"Each knot must be perfect," Leela explains to her granddaughter Kavya, 15, who is learning the craft. 
                "The pattern depends on where you tie and how tightly. This design has been in our family for 
                ${generations} generations." The fabric, stretched on a frame, slowly fills with tiny knots that will 
                create beautiful patterns when dyed.</p>
                
                <p>Kavya's mother Priya demonstrates the dyeing process. "We use natural colors—turmeric for yellow, 
                indigo for blue. The tied sections resist the dye, creating the patterns." The social aspect is important— 
                women work together, sharing stories and preserving family traditions while creating beautiful textiles.</p>
                
                <p>As the fabric dries in the sun, Leela tells stories of bandhani sarees worn at family weddings, 
                each pattern carrying meaning and memory. "When a bride wears our bandhani," she says, 
                "she carries the love and skill of generations. This craft connects us—mothers and daughters, 
                grandmothers and granddaughters, all working together to create something beautiful that will be treasured forever."</p>
            `,
            
            'metalwork': () => `
                <p>In the metal workshops of <strong>${locationName}</strong>, the sound of hammers on brass and copper 
                echoes through the old city. Master Ramesh, a metalworker for 35 years, shapes a traditional water vessel, 
                his hands moving with the skill learned from his father and grandfather before him.</p>
                
                <p>"Metal work is about understanding the material," Ramesh explains as he hammers a piece of brass. 
                "You can't rush it. Each strike must be precise, each curve intentional." His workshop is filled with 
                both traditional utensils—used in daily cooking and religious ceremonies—and decorative items that showcase 
                the metal's natural beauty.</p>
                
                <p>His apprentice, 18-year-old Deepak, watches closely. "I've been learning for two years," Deepak says. 
                "Master Ramesh says it takes at least five years to become skilled. But I love seeing raw metal transform 
                into something beautiful and useful." The craft requires both artistic vision and physical strength— 
                shaping metal by hand is demanding work.</p>
                
                <p>As the day ends, Ramesh polishes a finished piece until it gleams. "These aren't just objects," 
                he reflects. "They're part of people's lives—used in kitchens, temples, and homes. 
                When someone buys our work, they're investing in quality that will last generations. 
                That's what traditional craftsmanship means—creating things that matter, things that endure."</p>
            `,
            
            'wood': () => `
                <p>In the <strong>${locationName}</strong> region, where magnificent havelis showcase centuries of wood carving, 
                Master Harish works in his family's workshop, creating furniture and decorative items using techniques 
                passed down through ${generations} generations. The workshop smells of sandalwood and sawdust, 
                filled with tools that have been used by his ancestors.</p>
                
                <p>"Wood carving is about patience and precision," Harish explains as he carves a floral pattern into 
                a door panel. "Each cut must be exact. One mistake, and you start over." His work ranges from restoring 
                ancient haveli carvings to creating new pieces that preserve traditional motifs—geometric designs, 
                floral patterns, and scenes from mythology.</p>
                
                <p>His son Vikram, 20, is learning the craft. "I grew up watching my father work," Vikram says. 
                "The havelis in our region are like open-air museums—every door, every window, every pillar tells a story. 
                I want to help preserve that heritage." Together, they work on a commission to restore carvings in a 
                historic mansion, carefully matching the original style.</p>
                
                <p>As evening approaches, Harish shows visitors examples of his work—intricate panels that took weeks 
                to complete. "Wood carving connects us to our architectural heritage," he says. 
                "These patterns have been used for centuries. When we carve them today, we're keeping that tradition alive, 
                ensuring that future generations will still see the beauty of traditional Rajasthani craftsmanship."</p>
            `,
            
            'marble': () => `
                <p>In <strong>${locationName}</strong>, where the famous white marble comes from, Master Prakash works 
                in a workshop that has been in his family for ${generations} generations. The same marble that built 
                the Taj Mahal is now in his hands, being transformed into a statue that will grace a temple courtyard.</p>
                
                <p>"Makrana marble is special," Prakash explains as he carves. "It's soft when quarried, perfect for 
                intricate work, but it hardens over time. That's why it's been used in India's greatest monuments." 
                His workshop is filled with pieces in various stages—rough blocks, partially carved figures, 
                and finished statues that gleam in the sunlight.</p>
                
                <p>His daughter Anjali, 22, is one of the few women in marble carving. "People are surprised to see 
                a woman doing this work," she says, "but my father taught me that skill matters, not gender." 
                She's working on a small decorative piece, her hands steady as she creates delicate details.</p>
                
                <p>As the day ends, Prakash reflects on his craft's legacy. "Our marble has shaped India's history," 
                he says. "From the Taj Mahal to local temples, from royal palaces to everyday items. 
                When I carve, I'm part of that tradition. Each piece I create carries the weight of history 
                and the hope that this craft will continue for generations to come."</p>
            `,
            
            'embroidery': () => `
                <p>In <strong>${locationName}</strong>, where the Thar Desert meets vibrant culture, 
                a group of women gather under a colorful canopy, their needles moving in patterns passed down 
                through ${generations} generations. This is Barmer embroidery—bold, geometric, and instantly recognizable, 
                reflecting the desert region's vibrant spirit.</p>
                
                <p>Master artisan Geeta, 58, leads the group. "Embroidery is our art," she explains as she works on 
                a traditional pattern. "We learn from our mothers, who learned from their mothers. 
                Each pattern tells a story—of the desert, of our festivals, of our daily life." 
                The women work together, sharing stories and laughter while creating intricate designs on fabric.</p>
                
                <p>Young Meera, 16, is learning the craft. "I started when I was ten," she says proudly. 
                "My grandmother taught me the basic stitches. Now I can create complex patterns." 
                The social aspect is crucial—embroidery brings women together, creating bonds while preserving traditions.</p>
                
                <p>As the afternoon sun casts long shadows, the women display their work—colorful textiles that will 
                become clothing, home decor, and accessories. "This craft gives us independence," Geeta reflects. 
                "We can work from home, care for our families, and earn income. But more than that, 
                it connects us to our heritage. Every stitch carries the memory of our ancestors, 
                and every finished piece is a celebration of our culture."</p>
            `,
            
            'camel-leather': () => `
                <p>In <strong>${locationName}</strong>, where camels are part of desert life, 
                Master Salim works with camel leather—a material uniquely suited to the harsh desert climate. 
                His workshop, passed down through ${generations} generations, creates everything from traditional 
                water bags to modern accessories, all using techniques perfected over centuries.</p>
                
                <p>"Camel leather is special," Salim explains as he stitches a bag. "It's durable, breathable, 
                and has a unique texture. Our ancestors used it for water bags and saddles—essential items for 
                desert travel. Today, we make modern products while keeping the traditional quality." 
                His hands move with practiced skill, creating pieces that blend tradition with contemporary needs.</p>
                
                <p>His son Imran, 19, is learning the craft. "I've been helping since I was 12," Imran says. 
                "My father says it takes years to understand leather—how to work with it, how to finish it, 
                how to make it last." The workshop is filled with tools and materials, each with its purpose 
                in the leather-working process.</p>
                
                <p>As evening approaches, Salim reflects on his craft's evolution. "We've adapted to modern markets," 
                he says, "creating wallets, bags, and accessories that people use today. But we never compromise 
                on quality or forget our roots. This leather craft is part of our desert heritage— 
                a practical art that has sustained families for generations and continues to thrive in the modern world."</p>
            `,
            
            'stone': () => {
                const isJaisalmer = locationKey.includes('jaisalmer');
                const stoneType = isJaisalmer ? 'golden yellow sandstone' : 'local stone';
                const specialNote = isJaisalmer 
                    ? 'The golden hue of this stone is what gives Jaisalmer its nickname—the Golden City. When the sun hits it, the entire city glows like gold.'
                    : 'The stone is carefully selected and carved to bring out its natural beauty and texture.';
                
                return `
                    <p>In <strong>${locationName}</strong>, where ${stoneType} has shaped the city's identity, 
                    Master Devendra works in his family's stone carving workshop, creating pieces that range from 
                    architectural elements to decorative sculptures. His family has been carving stone for 
                    ${generations} generations, working on everything from palaces to everyday items.</p>
                    
                    <p>"Stone carving requires both artistic skill and physical strength," Devendra explains as he 
                    carves intricate patterns. "You must understand the stone—its grain, its hardness, how it responds 
                    to your tools." ${specialNote} His workshop is filled with pieces in various stages, 
                    from rough blocks to finished carvings that showcase incredible detail.</p>
                    
                    <p>His apprentice, 21-year-old Ravi, is learning the craft. "I started three years ago," Ravi says. 
                    "Master Devendra says it takes at least five years to become skilled. But I love seeing a block 
                    of stone transform into something beautiful." The work is demanding—carving stone by hand requires 
                    patience, precision, and strength.</p>
                    
                    <p>As the day ends, Devendra shows visitors examples of his work—pieces that will be used in 
                    restoration projects and new constructions. "Stone carving connects us to our architectural heritage," 
                    he reflects. "Every palace, every temple, every haveli in our region showcases this craft. 
                    When we carve today, we're preserving that legacy, ensuring that the beauty of traditional 
                    Rajasthani stone work continues to inspire future generations."</p>
                `;
            },
            
            'pichwai': () => `
                <p>In <strong>${locationName}</strong>, the center of Pichwai painting, artist Krishna works on a 
                large cloth painting that will hang behind a temple deity. This devotional art form, practiced for 
                centuries, requires both artistic skill and spiritual devotion. Krishna's family has been creating 
                Pichwai paintings for ${generations} generations.</p>
                
                <p>"Pichwai is more than painting," Krishna explains as he adds details to a depiction of Lord Krishna. 
                "It's a form of prayer. We work with devotion, considering each brushstroke an offering." 
                The paintings, which can take months to complete, are changed according to seasons and festivals, 
                making them a living tradition that connects devotees to the divine.</p>
                
                <p>His daughter Radha, 24, is learning the craft. "I've been studying since I was 15," she says. 
                "My father says you must understand both the art and the devotion. Each painting tells a story 
                from Krishna's life, and we must capture not just the image, but the emotion and meaning." 
                The studio is filled with completed works, each meticulously detailed and spiritually significant.</p>
                
                <p>As evening approaches, Krishna reflects on his craft's purpose. "Pichwai paintings serve the temple 
                and the devotees," he says. "They enhance the spiritual experience, bringing the stories of Krishna 
                to life. When we create these paintings, we're not just making art—we're participating in a 
                centuries-old tradition of devotion that continues to inspire and connect people to their faith."</p>
            `,
            
            'phad': () => `
                <p>In <strong>${locationName}</strong>, where Phad painting preserves Rajasthani folk culture, 
                artist Bhanwar works on a large cloth scroll that will be used by Bhopas—priest-singers who narrate 
                epic stories. His family has been creating these storytelling scrolls for ${generations} generations, 
                each painting a visual narrative that brings folk tales to life.</p>
                
                <p>"Phad paintings are unique," Bhanwar explains as he paints a scene from a folk epic. 
                "They're not just art—they're tools for storytelling. Bhopas use them in performances, 
                pointing to different sections as they narrate the story." The scrolls, which can be 15 to 30 feet long, 
                depict entire epics, with each section telling part of the narrative.</p>
                
                <p>His son Mahendra, 20, is learning the craft. "I've been helping since I was 12," Mahendra says. 
                "My father teaches me not just how to paint, but the stories themselves. You can't create a Phad 
                without understanding the narrative." The family works together, with different members specializing 
                in different aspects—drawing, painting, and storytelling.</p>
                
                <p>As the day ends, Bhanwar reflects on his craft's importance. "Phad paintings preserve our oral 
                traditions," he says. "In villages where literacy was limited, these scrolls kept our stories alive. 
                Today, they continue to connect people to our folk culture. When a Bhopa performs with our Phad, 
                he's not just entertaining—he's preserving history, teaching values, and keeping our traditions 
                alive for the next generation."</p>
            `,
            
            'jewelry': () => `
                <p>In <strong>${locationName}</strong>, where spirituality and craftsmanship meet, 
                Master Gopal works in his silver jewelry workshop, creating traditional Rajasthani pieces that 
                are essential for festivals and weddings. His family has been crafting jewelry for 
                ${generations} generations, using techniques like filigree work, engraving, and stone setting 
                that have been perfected over centuries.</p>
                
                <p>"Silver jewelry is more than decoration," Gopal explains as he works on an intricate necklace. 
                "It's part of our culture. Brides wear it on their wedding day, women wear it during festivals, 
                and families pass pieces down as heirlooms." His workshop is filled with tools and materials, 
                each piece requiring hours of careful work to create the intricate details that define 
                traditional Rajasthani jewelry.</p>
                
                <p>His daughter Priya, 23, is learning the craft. "I started when I was 16," she says. 
                "My father says it takes years to master filigree work—creating those delicate patterns with 
                fine silver wire. But I love seeing a plain piece of silver transform into something beautiful." 
                The craft requires both artistic vision and technical skill, with each piece being unique.</p>
                
                <p>As evening approaches, Gopal reflects on his craft's significance. "Jewelry connects us to 
                our traditions," he says. "When someone wears our pieces, they're not just accessorizing— 
                they're participating in a cultural practice that has been part of Rajasthan for centuries. 
                Each piece we create carries the skill of generations and the hope that these traditions 
                will continue to be valued and preserved."</p>
            `
        };
        
        // Determine which story template to use based on craft type
        const craftLower = craftName.toLowerCase();
        let storyTemplate = null;
        
        if (craftLower.includes('pottery') || craftLower.includes('blue')) {
            storyTemplate = storyTemplates['blue-pottery'];
        } else if (craftLower.includes('block') || craftLower.includes('print')) {
            storyTemplate = storyTemplates['block-printing'];
        } else if (craftLower.includes('leather')) {
            if (craftLower.includes('camel')) {
                storyTemplate = storyTemplates['camel-leather'];
            } else {
                storyTemplate = storyTemplates['leather'];
            }
        } else if (craftLower.includes('terracotta')) {
            storyTemplate = storyTemplates['terracotta'];
        } else if (craftLower.includes('puppet')) {
            storyTemplate = storyTemplates['puppets'];
        } else if (craftLower.includes('miniature')) {
            storyTemplate = storyTemplates['miniature'];
        } else if (craftLower.includes('bandhani') || craftLower.includes('tie-dye')) {
            storyTemplate = storyTemplates['bandhani'];
        } else if (craftLower.includes('metal')) {
            storyTemplate = storyTemplates['metalwork'];
        } else if (craftLower.includes('wood') || craftLower.includes('carving')) {
            storyTemplate = storyTemplates['wood'];
        } else if (craftLower.includes('marble')) {
            storyTemplate = storyTemplates['marble'];
        } else if (craftLower.includes('embroidery')) {
            storyTemplate = storyTemplates['embroidery'];
        } else if (craftLower.includes('stone')) {
            storyTemplate = storyTemplates['stone'];
        } else if (craftLower.includes('pichwai')) {
            storyTemplate = storyTemplates['pichwai'];
        } else if (craftLower.includes('phad')) {
            storyTemplate = storyTemplates['phad'];
        } else if (craftLower.includes('jewelry') || craftLower.includes('silver')) {
            storyTemplate = storyTemplates['jewelry'];
        }
        
        // If no specific template found, create a generic meaningful story
        if (!storyTemplate) {
            storyTemplate = () => `
                <p>In <strong>${locationName}</strong>, where tradition meets daily life, 
                a family of artisans continues a craft that has been passed down through ${generations} generations. 
                The workshop, filled with tools and materials that tell stories of the past, is where 
                ${artisanCount} artisans work together, each contributing their skill to preserve a tradition 
                that defines their community.</p>
                
                <p>Master craftsman Ramesh, who learned from his father and grandfather, explains the importance 
                of their work: "This craft isn't just our livelihood—it's our identity. Every piece we create 
                carries the knowledge and care of generations. When people use our work, they're connecting 
                to a tradition that has shaped our region for centuries."</p>
                
                <p>Young apprentices learn alongside experienced artisans, understanding not just the techniques, 
                but the cultural significance of their craft. "We're not just making objects," one apprentice reflects. 
                "We're preserving stories, maintaining traditions, and ensuring that future generations will 
                understand where they come from."</p>
                
                <p>As the day ends, the workshop continues to hum with activity. This is more than a workplace— 
                it's a living museum, a school, and a community center. Here, the past meets the present, 
                and the future of traditional Rajasthani craftsmanship is being shaped, one carefully crafted 
                piece at a time.</p>
            `;
        }
        
        return storyTemplate();
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