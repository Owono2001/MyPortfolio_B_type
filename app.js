// ===== ULTIMATE PERFORMANCE CORE =====
(function() {
    // ======== DEVICE DETECTION ========
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTouchDevice = 'ontouchstart' in window;

    // ======== PERFORMANCE PROFILE ========
    const particleCount = isMobile ? 3000 : 10000;
    const animationMultiplier = isMobile ? 0.7 : 1;

    /************************************************************
      1) REMOVED Lenis smooth scrolling setup to allow normal scrolling.
         (All code related to “lenis” has been taken out.)
    ************************************************************/


         

    // ======== GSAP SCROLL TRIGGER SETUP ========
    gsap.registerPlugin(ScrollTrigger);

    // ======== WEBGL CONTEXT ========
    let renderer;
    if (!isMobile) { // Only initialize WebGL on desktop
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
            logarithmicDepthBuffer: true
        });

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.prepend(renderer.domElement);

        // ======== ADAPTIVE PARTICLE SYSTEM ========
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        for(let i = 0; i < particleCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 10;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMesh = new THREE.Points(
            particleGeometry,
            new THREE.PointsMaterial({
                size: 0.005,
                color: new THREE.Color(0x00f3ff),
                transparent: true,
                blending: THREE.AdditiveBlending
            })
        );
        scene.add(particleMesh);
        camera.position.z = 2;

        // ======== PULSING GRID SYSTEM ========
        const gridGeometry = new THREE.GridHelper(
            100, 
            100, 
            new THREE.Color(0x00f3ff), // Primary color
            new THREE.Color(0x003344)  // Secondary color
        );
        gridGeometry.material.opacity = 0.3;
        gridGeometry.material.transparent = true;
        scene.add(gridGeometry);
        
        // Grid animation (NEW CODE)
        gsap.to(gridGeometry.material, {
            opacity: 0.6,
            duration: 2,
            repeat: -1,
            yoyo: true
        });

        // ======== PARTICLE ANIMATION ========
        let lastFrameTime = 0;
        const animateParticles = (time) => {
            requestAnimationFrame(animateParticles);
            const delta = time - lastFrameTime;
            particleMesh.rotation.x += 0.000008 * delta * animationMultiplier;
            particleMesh.rotation.y += 0.000008 * delta * animationMultiplier;
            particleGeometry.attributes.position.needsUpdate = true;
            renderer.render(scene, camera);
            lastFrameTime = time;
        };
        animateParticles(0);
    }

    // ======== SCROLL ANIMATIONS (using GSAP) ========
    gsap.utils.toArray('.section').forEach(section => {
        gsap.from(section, {
            opacity: 0,
            y: isMobile ? 50 : 100,
            duration: 1.5 * animationMultiplier,
            scrollTrigger: {
                trigger: section,
                start: 'top center+=200',
                toggleActions: 'play none none reverse',
                markers: false
            }
        });
    });

    // ======== CURSOR SYSTEM ========
    if (!isTouchDevice) {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);

        let lastMouseUpdate = 0;
        document.addEventListener('mousemove', e => {
            if (window.innerWidth < 768) return;
            const now = performance.now();
            if(now - lastMouseUpdate < 16) return;
            lastMouseUpdate = now;

            gsap.to(cursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.3 * animationMultiplier
            });

            // Holographic Trail
            anime({
                targets: document.createElement('div'),
                left: e.clientX,
                top: e.clientY,
                translateY: [0, -50],
                translateX: () => anime.random(-20, 20),
                opacity: [1, 0],
                scale: [1, 2],
                duration: 1000 * animationMultiplier,
                easing: 'easeOutExpo',
                begin: anim => document.body.appendChild(anim.animatables[0].target),
                complete: anim => anim.animatables[0].target.remove()
            });
        });
    }

    // Add to touch device detection
    if (isTouchDevice) {
        // Add touch-specific classes
        document.documentElement.classList.add('touch-device');
        
        // Better hover handling
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('touchstart', () => {
                card.classList.add('hover-effect');
            });
            
            card.addEventListener('touchend', () => {
                setTimeout(() => card.classList.remove('hover-effect'), 500);
            });
        });
    }
    


    // ======== PROJECT CARD INTERACTIONS ========
    document.querySelectorAll('.project-card').forEach(card => {
        /********************************************************************
         2) REMOVED the condition that sets pointerEvents = 'none'
            on touch devices. We want full mobile/tablet interaction.
        ********************************************************************/

        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            gsap.to(card, {
                x: (e.clientX - rect.left - rect.width/2) * 0.1,
                y: (e.clientY - rect.top - rect.height/2) * 0.1,
                rotationX: (e.clientY - rect.top - rect.height/2) * 0.1,
                rotationY: (e.clientX - rect.left - rect.width/2) * -0.1,
                duration: 0.5 * animationMultiplier
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                x: 0,
                y: 0,
                rotationX: 0,
                rotationY: 0,
                duration: 0.8 * animationMultiplier,
                ease: 'elastic.out(1, 0.3)'
            });
        });
    });

    // ======== NOISE GENERATOR ========
    if (!isMobile) {
        const noiseCanvas = document.createElement('canvas');
        const noiseCtx = noiseCanvas.getContext('2d');
        Object.assign(noiseCanvas.style, {
            position: 'fixed',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            mixBlendMode: 'overlay',
            opacity: '0.05'
        });
        document.body.appendChild(noiseCanvas);

        const resizeNoise = () => {
            noiseCanvas.width = window.innerWidth;
            noiseCanvas.height = window.innerHeight;
        };

        const generateNoise = () => {
            const imageData = noiseCtx.createImageData(noiseCanvas.width, noiseCanvas.height);
            const data = imageData.data;
            for(let i = 0; i < data.length; i += 4) {
                const value = Math.random() * 255;
                data[i] = data[i+1] = data[i+2] = value;
                data[i+3] = 255;
            }
            noiseCtx.putImageData(imageData, 0, 0);
            requestAnimationFrame(generateNoise);
        };

        resizeNoise();
        generateNoise();
    }

    // ======== LAZY LOADING SYSTEM ========
    const mediaObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                const media = entry.target;
                if(media.tagName === 'IMG' && !media.src) {
                    media.src = media.dataset.src;
                }
                media.classList.add('loaded');
            }
        });
    }, { 
        rootMargin: isMobile ? '100px 0px' : '200px 0px',
        threshold: 0.01
    });

    document.querySelectorAll('img, video').forEach(media => {
        if(media.tagName === 'IMG') {
            media.dataset.src = media.src;
            media.removeAttribute('src');
        }
        mediaObserver.observe(media);
    });

    // ======== ADAPTIVE RESIZE HANDLER ========
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (renderer) {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            }
            if (noiseCanvas) {
                const noiseCanvas = document.querySelector('canvas');
                if (noiseCanvas) {
                    noiseCanvas.width = window.innerWidth;
                    noiseCanvas.height = window.innerHeight;
                }
            }
            /************************************************************
              Removed lenis.resize() since we removed Lenis altogether.
            ************************************************************/
        }, 100);
    });

    // ======== SLIDESHOW SYSTEM ========
    document.querySelectorAll('.slideshow-container').forEach(slideshow => {
        let currentSlide = 0;
        const slides = slideshow.querySelectorAll('.slide');
        const totalSlides = slides.length;
        
        const nextSlide = () => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % totalSlides;
            slides[currentSlide].classList.add('active');
        };
        
        let slideshowInterval = setInterval(nextSlide, 5000);
        
        slideshow.addEventListener('mouseenter', () => clearInterval(slideshowInterval));
        slideshow.addEventListener('touchstart', () => clearInterval(slideshowInterval));
        slideshow.addEventListener('mouseleave', () => {
            if (!isTouchDevice) slideshowInterval = setInterval(nextSlide, 5000);
        });
    });

    function initializeSlideshow(containerId, dotContainerId) {
        const slideshow = document.querySelector(`#${containerId}`);
        const slides = slideshow.querySelectorAll('.slide');
        const dotsContainer = document.querySelector(`#${dotContainerId}`);
        let slideIndex = 0;

        // Create navigation dots
        slides.forEach((slide, index) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active-dot');
            dot.addEventListener('click', () => showSlide(index));
            dotsContainer.appendChild(dot);
        });

        function showSlide(index) {
            // Pause all videos when changing slides
            slides[slideIndex].querySelectorAll('video').forEach(video => video.pause());
            
            slideIndex = index;
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
            
            // Update dots
            dotsContainer.querySelectorAll('.dot').forEach((dot, i) => {
                dot.classList.toggle('active-dot', i === index);
            });

            // Auto-play current video
            const currentVideo = slides[slideIndex].querySelector('video');
            if (currentVideo) currentVideo.play();
        }

        // Auto-advance slides every 5 seconds
        setInterval(() => {
            const nextIndex = (slideIndex + 1) % slides.length;
            showSlide(nextIndex);
        }, 5000);
    }

    document.addEventListener('DOMContentLoaded', () => {
        function initSlideshow(containerId, dotContainerId) {
            const container = document.getElementById(containerId);
            const slides = Array.from(container.querySelectorAll('.slide'));
            const dotsContainer = document.getElementById(dotContainerId);
            let currentIndex = 0;
            let interval;
    
            // Create dots
            slides.forEach((_, index) => {
                const dot = document.createElement('span');
                dot.className = 'dot';
                if (index === 0) dot.classList.add('active-dot');
                dot.addEventListener('click', () => goToSlide(index));
                dotsContainer.appendChild(dot);
            });
    
            function updateSlides() {
                slides.forEach((slide, index) => {
                    slide.classList.remove('active', 'prev');
                    if (index === currentIndex) {
                        slide.classList.add('active');
                    } else if (index === (currentIndex - 1 + slides.length) % slides.length) {
                        slide.classList.add('prev');
                    }
                });
    
                dotsContainer.querySelectorAll('.dot').forEach((dot, index) => {
                    dot.classList.toggle('active-dot', index === currentIndex);
                });
    
                // Handle video playback
                const activeSlide = slides[currentIndex];
                const activeVideo = activeSlide.querySelector('video');
                if (activeVideo) {
                    activeVideo.play().catch(error => {
                        console.log('Video autoplay failed:', error);
                    });
                }
            }
    
            function goToSlide(index) {
                currentIndex = (index + slides.length) % slides.length;
                updateSlides();
                resetInterval();
            }
    
            function nextSlide() {
                currentIndex = (currentIndex + 1) % slides.length;
                updateSlides();
            }
    
            function resetInterval() {
                clearInterval(interval);
                interval = setInterval(nextSlide, 5000);
            }
    
            // Initialize
            updateSlides();
            resetInterval();
    
            // Pause videos when switching slides
            container.querySelectorAll('video').forEach(video => {
                video.addEventListener('play', () => {
                    container.querySelectorAll('video').forEach(otherVideo => {
                        if (otherVideo !== video) otherVideo.pause();
                    });
                });
            });
        }
    
        // Initialize both galleries
        initSlideshow('picture-slideshow', 'picture-dots');
        initSlideshow('video-slideshow', 'video-dots');
    });

    // ======== PARALLAX SCROLLING ========
    document.addEventListener('DOMContentLoaded', () => {
        // Make sure ScrollTrigger is registered
        gsap.registerPlugin(ScrollTrigger);
      
        // 1) Pin the entire intro so it stays in place while user scrolls through it.
        ScrollTrigger.create({
          trigger: "#cinematicIntro",
          start: "top top",
          end: "bottom top", 
          pin: true,
          pinSpacing: false, 
          // This keeps the intro pinned until we've scrolled through it.
        });
      
        // 2) Move the background layer at a slower speed
        gsap.to(".layer-bg", {
          scrollTrigger: {
            trigger: "#cinematicIntro",
            start: "top top",
            end: "bottom top",
            scrub: true, // allows smooth parallax on scroll
          },
          y: "-30%", // background moves up 30% while scrolling
          ease: "none",
        });
      
        // 3) Move the middle layer slightly faster
        gsap.to(".layer-mid", {
          scrollTrigger: {
            trigger: "#cinematicIntro",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
          y: "-50%", // moves up 50%
          ease: "none",
        });
      
        // 4) Optionally fade in the text as we scroll
        gsap.from(".layer-front .intro-title", {
          scrollTrigger: {
            trigger: "#cinematicIntro",
            start: "top top+=100", // fade in after some scrolling
            end: "bottom top",
            scrub: true,
          },
          opacity: 0,
          y: 50,
          ease: "power1.out",
        });
      });
    

    // ======== SLIDESHOW SYSTEM ========
    document.addEventListener('DOMContentLoaded', () => {
        initializeSlideshow('picture-slideshow', 'picture-dots');
        initializeSlideshow('video-slideshow', 'video-dots');
    });

    document.addEventListener('DOMContentLoaded', () => {
        const heroSection = document.querySelector('#home');
        const elements = {
            subtitle: heroSection.querySelector('.hero-subtitle'),
            name: heroSection.querySelector('h1'),
            description: heroSection.querySelector('.hero-description'),
            buttons: heroSection.querySelector('.project-links')
        };
    
        // Typing animation function
        const typeText = (element, text, speed = 50) => {
            return new Promise(resolve => {
                element.style.opacity = '1';
                let index = 0;
                const cursor = document.createElement('span');
                cursor.className = 'typing-cursor';
                cursor.textContent = '▌';
                element.appendChild(cursor);
                
                const type = () => {
                    if (index < text.length) {
                        element.insertBefore(document.createTextNode(text[index]), cursor);
                        index++;
                        setTimeout(type, speed);
                    } else {
                        cursor.remove();
                        resolve();
                    }
                };
                
                type();
            });
        };
    
        // Animation sequence
        setTimeout(async () => {
            // Animate subtitle
            await typeText(elements.subtitle, 'Computer Engineering Student');
            
            // Animate name
            elements.name.style.opacity = '1';
            await typeText(elements.name, 'Pedro Fabian Owono', 100);
            
            // Animate description
            elements.description.style.opacity = '1';
            await typeText(elements.description, 
                'Bridging software solutions through innovative engineering ' +
                'and computational thinking. Passionate about design, sound ' +
                'engineering, programming, and full-stack development.', 30);
            
            // Show buttons
            elements.buttons.style.opacity = '1';
            elements.buttons.style.animation = 'fadeIn 1s ease-out';
        }, 1000);
    });

    document.querySelectorAll('.typing-container').forEach(container => {
        const text = container.dataset.text;
        let html = '';
        
        text.split('').forEach((char, index) => {
            html += `<span style="animation-delay: ${index * 0.1}s">${char}</span>`;
        });
        
        container.innerHTML = html + `<span class="blink-cursor"></span>`;
    });


    // Touch Device Improvements
    if (isTouchDevice) {
        document.querySelectorAll('.project-link').forEach(link => {
            link.style.cursor = 'pointer';
            link.addEventListener('touchend', () => {
                link.style.transform = 'scale(0.98)';
                setTimeout(() => link.style.transform = '', 100);
            });
        });
    }
        document.addEventListener("DOMContentLoaded", () => {
            const cyberIntro = document.getElementById("cyberIntro");
            const enterWebsiteButton = document.querySelector(".cyber-button-3d");
        
            if (enterWebsiteButton) {
                enterWebsiteButton.addEventListener("click", () => {
                    cyberIntro.classList.add("hidden-intro"); // Fade out
                    setTimeout(() => {
                        cyberIntro.style.display = "none"; // Hide intro
                    }, 1000);
                });
            }
        });




        // In your existing app.js
        document.addEventListener("DOMContentLoaded", () => {
            const cyberIntro = document.getElementById("cyberIntro");
            const enterWebsiteButton = document.querySelector(".cyber-button-3d");
            const loadingScreen = document.getElementById("cyberLoad");
            const loadSound = document.getElementById("loadSound");
            const progressFill = document.querySelector(".progress-fill");
            const percentageText = document.querySelector(".percentage");
            const terminalLines = document.querySelectorAll(".terminal-output .line");

            if (enterWebsiteButton) {
                enterWebsiteButton.addEventListener("click", () => {
                    // Start loading sequence
                    cyberIntro.classList.add("hidden-intro");
                    loadingScreen.style.display = "block";
                    
                    // Play industrial sound
                    loadSound.play();

                    // GSAP Loading Animation
                    const loadingTL = gsap.timeline();
                    
                    // Animate progress bar
                    loadingTL.to(progressFill, {
                        width: "100%",
                        duration: 4,
                        ease: "power2.inOut",
                        onUpdate: () => {
                            const progress = Math.round(progressFill.clientWidth / progressFill.parentElement.clientWidth * 100);
                            percentageText.textContent = `${progress}%`;
                        }
                    });

                    // Animate terminal lines
                    terminalLines.forEach((line, index) => {
                        loadingTL.to(line, {
                            opacity: 1,
                            y: 0,
                            duration: 0.3,
                            delay: index * 0.5
                        }, "-=3");
                    });

                    // Completion animation
                    loadingTL.to(".industrial-loader", {
                        opacity: 0,
                        y: -50,
                        duration: 1,
                        ease: "power4.out"
                    }).then(() => {
                        loadingScreen.style.display = "none";
                        // Start your main page animations here
                    });

                    // Add particle effects
                    const createParticle = () => {
                        const particle = document.createElement("div");
                        particle.className = "loading-particle";
                        loadingScreen.appendChild(particle);

                        gsap.to(particle, {
                            x: gsap.utils.random(-100, 100),
                            y: gsap.utils.random(-100, 100),
                            opacity: 0,
                            scale: 2,
                            duration: 1,
                            onComplete: () => particle.remove()
                        });
                    };

                    const particleInterval = setInterval(createParticle, 50);
                    setTimeout(() => clearInterval(particleInterval), 4000);
                });
            }
        });

        // Project Overview System
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if(!e.target.closest('.project-link')) { // Don't trigger on link clicks
                    const title = card.querySelector('h3').textContent;
                    const description = card.querySelector('p').textContent;
                    const techStack = [...card.querySelectorAll('.tech-item')].map(t => t.textContent).join(', ');
                    const githubLink = card.querySelector('.project-link').href;

                    const overlay = document.createElement('div');
                    overlay.className = 'project-overlay';
                    overlay.innerHTML = `
                        <div class="project-detail">
                            <span class="close-overlay">&times;</span>
                            <h3>${title}</h3>
                            <div class="project-tech">${techStack}</div>
                            <p>${description}</p>
                            <div class="expanded-links">
                                <a href="${githubLink}" target="_blank" class="cyber-button">
                                    <i class="fab fa-github"></i>
                                    View Full Repository
                                </a>
                            </div>
                        </div>
                    `;
                    
                    document.body.appendChild(overlay);
                    overlay.style.display = 'block';

                    overlay.querySelector('.close-overlay').addEventListener('click', () => {
                        overlay.remove();
                    });
                }
            });
        });

        
        // Function to update real-time date and time
        function updateCyberDateTime() {
            const options = {
                timeZone: 'Asia/Kuala_Lumpur',
                hour12: false,
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            };

            const dateFormatter = new Intl.DateTimeFormat('en-MY', {
                ...options,
                hour: undefined,
                minute: undefined,
                second: undefined
            });

            const timeFormatter = new Intl.DateTimeFormat('en-MY', {
                timeZone: 'Asia/Kuala_Lumpur',
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            function update() {
                const now = new Date();
                
                // Format Date
                const dateParts = dateFormatter.formatToParts(now);
                const day = dateParts.find(p => p.type === 'day').value;
                const month = dateParts.find(p => p.type === 'month').value;
                const year = dateParts.find(p => p.type === 'year').value;
                const weekday = dateParts.find(p => p.type === 'weekday').value;
                
                // Format Time with Blinking Colon
                const time = timeFormatter.format(now).replace(/:/g, '<span class="blink">:</span>');
                
                // Update HTML
                document.querySelector('.real-time-date').innerHTML = 
                    `${weekday.toUpperCase()} ${day} ${month.toUpperCase()} ${year}`;
                document.querySelector('.real-time-clock').innerHTML = time;
            }

            // Run immediately and update every second
            update();
            setInterval(update, 1000);
        }


        class CyberGlobe {
            constructor(containerId = 'globeCanvas') {
                this.container = document.getElementById(containerId);
                if (!this.container) {
                  console.error('Globe container not found!');
                  return;
                }
            
                // === CONFIG ===
                this.autoRotateSpeed = 0.0005;      // How fast the Earth spins on its own
                this.connectionCount = 400;         // # of small "network" points on Earth
                this.arcCount = 10;                // # of arcs that animate in/out
                this.isUserInteracting = false;     // We'll keep it false (no orbiting)
            
                this.initScene();
                this.addLights();
                this.createStarField();
                this.createEarth();
                this.createAtmosphere();
                this.createConnections();
                this.createArcs();
                this.addInteractivity();
                this.setupResizeHandler();
                this.animate();
                // Add weather visualization
                this.weatherOverlay = null;
                this.isWeatherVisible = false;
              }
            
              // ----------------------------------
              // 1) SCENE + CAMERA + RENDERER
              // ----------------------------------
              initScene() {
                // Get container's width/height
                //const rect = this.container.getBoundingClientRect();
            
                // Create Scene
                this.scene = new THREE.Scene();
            
                // Create Camera
                this.camera = new THREE.PerspectiveCamera(
                    45,
                    window.innerWidth / window.innerHeight,
                    0.1,
                    1000
                );
                this.camera.position.set(0, 0, 12);
                this.camera.lookAt(0, 0, 0);
            
                // Create Renderer
                this.renderer = new THREE.WebGLRenderer({
                  canvas: this.container,
                  antialias: true,
                  alpha: true
                });
                this.renderer.setPixelRatio(window.devicePixelRatio);
                this.renderer.setSize(window.innerWidth, window.innerHeight);
              }
            
              // ----------------------------------
              // 2) LIGHTING
              // ----------------------------------
              addLights() {
                // Ambient light
                const ambient = new THREE.AmbientLight(0xffffff, 0.4);
                this.scene.add(ambient);
            
                // Directional light
                const dirLight = new THREE.DirectionalLight(0xffffff, 1);
                dirLight.position.set(10, 10, 10);
                this.scene.add(dirLight);
              }
            
              // ----------------------------------
              // 3) STAR FIELD (BACKGROUND STARS)
              // ----------------------------------
              createStarField() {
                const starGeometry = new THREE.BufferGeometry();
                const starCount = 1200;
                const positions = new Float32Array(starCount * 3);
            
                for (let i = 0; i < starCount; i++) {
                  // Use spherical coordinates to spread them around
                  const r = 300; 
                  const theta = 2 * Math.PI * Math.random();
                  const phi = Math.acos(2 * Math.random() - 1);
            
                  const x = r * Math.sin(phi) * Math.cos(theta);
                  const y = r * Math.sin(phi) * Math.sin(theta);
                  const z = r * Math.cos(phi);
            
                  positions[i * 3 + 0] = x;
                  positions[i * 3 + 1] = y;
                  positions[i * 3 + 2] = z;
                }
                starGeometry.setAttribute(
                  'position',
                  new THREE.BufferAttribute(positions, 3)
                );
            
                const starMaterial = new THREE.PointsMaterial({
                  color: 0xffffff,
                  size: 1,
                  sizeAttenuation: true
                });
            
                this.starField = new THREE.Points(starGeometry, starMaterial);
                this.scene.add(this.starField);
              }
            
              // ----------------------------------
              // 4) EARTH
              // ----------------------------------
              createEarth() {
                const geometry = new THREE.SphereGeometry(3.5, 64, 64);
                const loader = new THREE.TextureLoader();
                const earthTexture = loader.load('assets/textures/earth-texture.jpg');

                this.earthMaterial = new THREE.MeshPhongMaterial({
                    map: earthTexture,
                    bumpScale: 0.1,
                    specular: new THREE.Color(0x222222),
                    emissive: 0x00f3ff,
                    emissiveIntensity: 0.1,
                    shininess: 10,
                    transparent: true
                });

                this.earth = new THREE.Mesh(geometry, this.earthMaterial);
                this.earth.name = 'earth';
                this.scene.add(this.earth);
            }

              // ----------------------------------
              // 5) ATMOSPHERE
              // ----------------------------------
              createAtmosphere() {
                const atmosphereGeo = new THREE.SphereGeometry(3.6, 64, 64);
                const atmosphereMat = new THREE.MeshPhongMaterial({
                  color: 0x00f3ff,
                  transparent: true,
                  opacity: 0.2,
                  side: THREE.BackSide
                });
                this.atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
                this.atmosphere.name = 'atmosphere';
                this.scene.add(this.atmosphere);
            
                // Subtle pulsing effect
                gsap.to(this.atmosphere.material, {
                  opacity: 0.3,
                  duration: 2,
                  repeat: -1,
                  yoyo: true,
                  ease: 'sine.inOut'
                });
              }
            

              
              // ----------------------------------
              // 6) CONNECTION POINTS
              // ----------------------------------
              createConnections() {
                this.connectionPoints = [];
                const geometry = new THREE.SphereGeometry(0.02, 8, 8);
                const material = new THREE.MeshBasicMaterial({
                  color: 0x00f3ff,
                  transparent: true,
                  opacity: 0.8
                });
            
                for (let i = 0; i < this.connectionCount; i++) {
                  const phi = Math.acos(-1 + (2 * i) / this.connectionCount);
                  const theta = Math.sqrt(this.connectionCount * Math.PI) * phi;
            
                  const point = new THREE.Mesh(geometry, material);
                  point.position.set(
                    3.6 * Math.cos(theta) * Math.sin(phi),
                    3.6 * Math.sin(theta) * Math.sin(phi),
                    3.6 * Math.cos(phi)
                  );
                  point.name = 'connectionPoint';
                  this.connectionPoints.push(point);
                  this.scene.add(point);
                }
              }
            
              // ----------------------------------
              // 7) OPTIONAL ARCS
              // ----------------------------------
              createArcs() {
                this.arcs = [];
                for (let i = 0; i < this.arcCount; i++) {
                  const idxA = Math.floor(Math.random() * this.connectionPoints.length);
                  const idxB = Math.floor(Math.random() * this.connectionPoints.length);
                  if (idxA === idxB) continue;
            
                  const start = this.connectionPoints[idxA].position.clone();
                  const end = this.connectionPoints[idxB].position.clone();
            
                  // Midpoint above Earth surface
                  const mid = start.clone().lerp(end, 0.5);
                  mid.normalize().multiplyScalar(4.0);
            
                  const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
                  const curvePoints = curve.getPoints(50);
            
                  const arcGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
                  const arcMaterial = new THREE.LineBasicMaterial({
                    color: 0xff00ff,
                    transparent: true,
                    opacity: 0
                  });
            
                  const arcLine = new THREE.Line(arcGeometry, arcMaterial);
                  arcLine.name = 'arcLine';
                  this.arcs.push(arcLine);
                  this.scene.add(arcLine);
            
                  // Animate
                  gsap.to(arcLine.material, {
                    opacity: 1,
                    duration: 1,
                    delay: i * 0.2,
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut'
                  });
                }
              }
            
              // ----------------------------------
              // 8) INTERACTIVITY (Hover/Click)
              // ----------------------------------
              addInteractivity() {
                this.raycaster = new THREE.Raycaster();
                this.mouse = new THREE.Vector2();
            
                // Hover effect
                document.addEventListener('mousemove', (e) => this.handleHover(e));
            
                // Click effect
                document.addEventListener('click', (e) => this.handleClick(e));
            
                // Simple tooltip
                this.tooltip = document.createElement('div');
                this.tooltip.style.position = 'fixed';
                this.tooltip.style.padding = '6px 10px';
                this.tooltip.style.background = 'rgba(0,0,0,0.6)';
                this.tooltip.style.color = '#00f3ff';
                this.tooltip.style.font = '12px monospace';
                this.tooltip.style.border = '1px solid #00f3ff';
                this.tooltip.style.borderRadius = '4px';
                this.tooltip.style.pointerEvents = 'none';
                this.tooltip.style.opacity = '0';
                document.body.appendChild(this.tooltip);
              }
            
              handleHover(e) {
                 // NOTE: If you reference `intersects`, you need to define:
                const intersects = this.raycaster.intersectObject(this.earth);

                const { clientX, clientY } = e;
                this.mouse.x = (clientX / window.innerWidth) * 2 - 1;
                this.mouse.y = -((clientY / window.innerHeight) * 2 - 1);

                if (intersects.length > 0) {
                    const objName = intersects[0].object.name;
                    if (objName === 'earth') {
                        gsap.to(this.earthMaterial, { emissiveIntensity: 0.3, duration: 0.3 });
                        this.tooltip.textContent = 'Earth';
                        this.tooltip.style.opacity = '1';
                    } else if (objName === 'connectionPoint') {
                        this.tooltip.textContent = 'Network Node';
                        this.tooltip.style.opacity = '1';
                    }
                    this.tooltip.style.left = clientX + 'px';
                    this.tooltip.style.top = clientY + 'px';
                } else {
                    gsap.to(this.earthMaterial, { emissiveIntensity: 0.1, duration: 0.3 });
                    this.tooltip.style.opacity = '0';
                }
            }
            
              handleClick(e) {
                this.raycaster.setFromCamera(this.mouse, this.camera);
                const intersects = this.raycaster.intersectObject(this.earth);
                if (intersects.length > 0) {
                    this.createPulseEffect(intersects[0].point);
                }
            }
            
              createPulseEffect(position) {
                const geo = new THREE.SphereGeometry(0.05, 16, 16);
                const mat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, transparent: true });
                const sphere = new THREE.Mesh(geo, mat);
                sphere.position.copy(position);
                this.scene.add(sphere);
            
                gsap.to(sphere.scale, {
                  x: 2, y: 2, z: 2,
                  duration: 1,
                  ease: 'power2.out',
                  onComplete: () => this.scene.remove(sphere)
                });
                gsap.to(mat, {
                  opacity: 0,
                  duration: 1,
                  ease: 'power2.out'
                });
              }
            
              // ----------------------------------
              // 9) RESIZE HANDLER
              // ----------------------------------
              setupResizeHandler() {
                window.addEventListener('resize', () => {
                    this.camera.aspect = window.innerWidth / window.innerHeight;
                    this.camera.updateProjectionMatrix();
                    this.renderer.setSize(window.innerWidth, window.innerHeight);
                });
            }
    
            
              // ----------------------------------
              // 10) ANIMATION LOOP
              // ----------------------------------
              animate() {
                requestAnimationFrame(() => this.animate());
            
                // Always auto-rotate
                this.earth.rotation.y += this.autoRotateSpeed;

                // Subtle float on points
                const t = Date.now() * 0.002;
                this.connectionPoints.forEach((point, i) => {
                    point.position.y += Math.sin(t + i) * 0.0005;
                    point.rotation.x += 0.01;
                    point.rotation.y += 0.01;
                });

                // Render
                this.renderer.render(this.scene, this.camera);
            }
        }
        
        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            const globe = new CyberGlobe();

            // Animate statistics
            gsap.utils.toArray('.stat-value').forEach(stat => {
                gsap.to(stat, {
                    innerText: stat.dataset.count,
                    duration: 2,
                    snap: 'innerText',
                    ease: 'power2.out',
                    delay: 1
                });
            });

            // Mobile touch handling
            let isTouchDevice = 'ontouchstart' in window;
            if (isTouchDevice && globe.controls) {
                document.body.style.cursor = 'none';
                globe.controls.enableZoom = false;
            }
        });


        
        document.addEventListener('DOMContentLoaded', () => {
            const chatbot = {
                toggle: document.querySelector('.chat-toggle'),
                container: document.querySelector('.chat-container'),
                messages: document.querySelector('.chat-messages'),
                input: document.querySelector('.cyber-input'),
                sendBtn: document.querySelector('.cyber-send'),
                particlesContainer: null,
        
                init() {
                    // Core functionality
                    this.toggle.addEventListener('click', () => this.toggleChat());
                    this.sendBtn.addEventListener('click', () => this.handleSend());
                    this.input.addEventListener('keypress', (e) => {
                        if(e.key === 'Enter') this.handleSend();
                    });
                    
                    // Effects initialization
                    this.initEffects();
                    
                    // Initial message
                    this.addMessage('AI', AI.intents.greeting.responses[0], 'ai');
                },
        
                initEffects() {
                    this.createTypingParticles();
                    this.addSoundEffects();
                },
        
                toggleChat() {
                    this.container.classList.toggle('active');
                },
        
                addMessage(sender, text, type) {
                    const message = document.createElement('div');
                    message.className = `message ${type}-message`;
                    message.innerHTML = this.sanitizeHTML(text);
                    this.messages.appendChild(message);
                    this.messages.scrollTop = this.messages.scrollHeight;
                },
        
                sanitizeHTML(text) {
                    const temp = document.createElement('div');
                    temp.textContent = text;
                    return temp.innerHTML;
                },
        
                handleSend() {
                    const message = this.input.value.trim();
                    if(!message) return;
        
                    this.addMessage('User', message, 'user');
                    this.input.value = '';
        
                    // Simulate AI processing delay
                    setTimeout(() => {
                        const response = AI.processQuery(message);
                        this.addMessage('AI', response, 'ai');
                    }, 500);
                },
        
                // ====== EFFECTS ======
                createTypingParticles() {
                    this.particlesContainer = document.createElement('div');
                    this.particlesContainer.className = 'chat-particles';
                    this.container.appendChild(this.particlesContainer);
        
                    this.input.addEventListener('input', () => {
                        if(Math.random() > 0.7) {
                            const particle = document.createElement('span');
                            particle.textContent = Math.random() > 0.5 ? '0' : '1';
                            particle.style.left = `${Math.random() * 100}%`;
                            this.particlesContainer.appendChild(particle);
                            
                            anime({
                                targets: particle,
                                translateY: -50,
                                opacity: 0,
                                duration: 1000,
                                easing: 'easeOutExpo',
                                complete: () => particle.remove()
                            });
                        }
                    });
                },
        
                addSoundEffects() {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    
                    this.sendBtn.addEventListener('click', () => {
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();
                        
                        oscillator.type = 'square';
                        oscillator.frequency.setValueAtTime(1000 + Math.random() * 500, audioContext.currentTime);
                        
                        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);
                        oscillator.start();
                        oscillator.stop(audioContext.currentTime + 0.1);
                    });
                }
            };
        
            chatbot.init();
        });

        

          
            
        

        // Initialize function when page loads
        document.addEventListener('DOMContentLoaded', () => {
            if(document.querySelector('#cyberIntro')) {
                updateCyberDateTime();
            }
        });


        


        document.addEventListener("DOMContentLoaded", function () {
            const menuToggle = document.querySelector(".menu-toggle");
            const navLinks = document.querySelector(".nav-links");
        
            menuToggle.addEventListener("click", function () {
                navLinks.classList.toggle("active");
            });
        });

        // ======== GPU ACCELERATION ========
        const gpuAccelerate = element => {
            element.style.transform = 'translateZ(0)';
            element.style.backfaceVisibility = 'hidden';
        };
    })();

