// ===== ULTIMATE PERFORMANCE CORE =====
(function() {
    // ======== DEVICE DETECTION ========
    // ======== FIREBASE CONFIGURATION ========
    // PASTE YOUR ACTUAL FIREBASE CONFIG OBJECT HERE:
    const firebaseConfig = {
        apiKey: "AIzaSyBn2ZmgS7CMEZbmf68goWDl1Tob1DvPTrA", // <-- Replace
        authDomain: "portfoliovisitors-1ec8b.firebaseapp.com", // <-- Replace
        databaseURL: "https://portfoliovisitors-1ec8b-default-rtdb.asia-southeast1.firebasedatabase.app", // <-- Replace & Check Region
        projectId: "portfoliovisitors-1ec8b", // <-- Replace
        storageBucket: "portfoliovisitors-1ec8b.firebasestorage.app", // <-- Replace
        messagingSenderId: "240522924083", // <-- Replace
        appId: "1:240522924083:web:490670945797fab8afd346" // <-- Replace
    };

    // Initialize Firebase (and store the database reference)
    let database = null; // Make database variable accessible globally within the IIFE
    try {
        firebase.initializeApp(firebaseConfig);
        database = firebase.database(); // Assign to the variable
        console.log("Firebase initialized successfully.");
    } catch (error) {
        console.error("Firebase initialization failed:", error);
    }
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


        // ======== GEOLOCATION & VISITOR TRACKING ========
        async function trackVisitorLocation() {
            if (!database) { // Check if Firebase initialized correctly
                console.log("Firebase not available, skipping visitor tracking.");
                return;
            }
            const visitorsRef = database.ref('active_visitors'); // Path in Firebase DB
            let visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            let visitorCountryCode = 'Unknown'; // Store country code

            try {
                // 1. Get Geolocation using ip-api.com
                // Fetch only status, message, countryCode fields
                const response = await fetch('http://ip-api.com/json/?fields=status,message,countryCode');
                if (!response.ok) { // Check if the fetch itself failed (network error, etc.)
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const geoData = await response.json();

                if (geoData.status === 'success' && geoData.countryCode) {
                    visitorCountryCode = geoData.countryCode;
                    console.log(`Visitor location code detected: ${visitorCountryCode}`);
                } else {
                    // Log if status is fail or countryCode is missing
                    console.warn(`Could not determine visitor country code. Status: ${geoData.status}, Message: ${geoData.message || 'N/A'}`);
                    visitorCountryCode = 'Unknown'; // Ensure it's set to Unknown
                }

                // 2. Store data in Firebase, regardless of lookup success
                const visitorData = {
                    country: visitorCountryCode, // Store the country code ('Unknown' if failed)
                    timestamp: firebase.database.ServerValue.TIMESTAMP // Use server time
                };
                const visitorNodeRef = visitorsRef.child(visitorId);

                // Use try...catch for Firebase operations too
                try {
                    await visitorNodeRef.set(visitorData);
                    await visitorNodeRef.onDisconnect().remove(); // Auto-remove when user leaves
                    console.log(`Visitor <span class="math-inline">\{visitorId\} \(</span>{visitorCountryCode}) added to Firebase.`);
                } catch (dbError) {
                    console.error(`Firebase error for visitor ${visitorId}:`, dbError);
                }

            } catch (error) {
                console.error("Error in trackVisitorLocation:", error);
                // Attempt to log an 'Error' state visitor if fetch failed before getting geoData
                if (database) { // Double check database is available
                    const errorData = { country: 'Error', timestamp: firebase.database.ServerValue.TIMESTAMP };
                    try {
                        await database.ref(`active_visitors/${visitorId}`).set(errorData);
                        await database.ref(`active_visitors/${visitorId}`).onDisconnect().remove();
                    } catch (dbError) {
                        console.error("Failed to write error state to Firebase:", dbError);
                    }
                }
            }

            // 3. Simple periodic cleanup (runs once 5 mins after page load)
            setTimeout(() => cleanupOldVisitors(visitorsRef), 5 * 60 * 1000);
        }

        function cleanupOldVisitors(visitorsRef) {
            if (!database) return; // Don't run if Firebase isn't working
            const cutoff = Date.now() - (30 * 60 * 1000); // Keep visitors from last 30 minutes
            visitorsRef.orderByChild('timestamp').endAt(cutoff).once('value', snapshot => {
                snapshot.forEach(childSnapshot => {
                    console.log(`Cleaning up old visitor: ${childSnapshot.key}`);
                    childSnapshot.ref.remove().catch(error => { // Add catch for remove errors
                        console.error(`Failed to remove old visitor ${childSnapshot.key}:`, error);
                    });
                });
            }, error => { // Add error callback for the 'once' call itself
                console.error("Error fetching old visitors for cleanup:", error);
            });
        }

        class CyberGlobe {
            constructor(containerId = 'globeCanvas') {
                this.container = document.getElementById(containerId);
                if (!this.container) {
                    console.error('Globe container not found!');
                    return; // Stop if container doesn't exist
                }
        
                // --- Original Config & Properties ---
                this.autoRotateSpeed = 0.0005;
                this.connectionCount = 400; // Note: These are just numbers for visual effect setup
                this.arcCount = 10;         // Note: These are just numbers for visual effect setup
                this.isUserInteracting = false; // Assuming no orbit controls needed based on previous code
                this.scene = null;
                this.camera = null;
                this.renderer = null;
                this.earth = null;
                this.atmosphere = null;
                this.starField = null;
                this.connectionPoints = [];
                this.arcs = [];
                this.raycaster = null;
                this.mouse = null;
                this.tooltip = null; // Assuming you had a tooltip property before for hover
        
                // --- Properties for Visitor Geolocation Feature ---
                this.activeVisitorMarkers = {}; // Stores marker objects { 'US': marker1, 'MY': marker2 }
                this.activeCountries = {};     // Stores counts of visitors per country { 'US': 2, 'MY': 1 }
                this.countryCoords = this.getCountryCoordinates(); // Coordinates lookup object
                this.markerMaterial = new THREE.MeshBasicMaterial({
                    color: 0xff00ff, // Marker color (magenta)
                    transparent: true,
                    opacity: 0.9,
                    depthTest: false, // Try rendering markers on top
                    side: THREE.DoubleSide // Make sure material is visible
                });
                this.markerGeometry = new THREE.SphereGeometry(0.05, 16, 16); // Small sphere geometry
                this.animatedStats = { countries: 0 }; // Object to hold the value we animate for the live count
        
                // --- Initialize the Globe ---
                // Call original setup methods (ensure these exist below)
                this.initScene();
                this.addLights();
                this.createStarField();
                this.createEarth(); // Important: Earth must be created before adding markers
                this.createAtmosphere();
                this.createConnections(); // Your original connection points
                this.createArcs(); // Your original arcs
                this.addInteractivity(); // Your original interactivity setup
                this.setupResizeHandler();
                this.animate(); // Start the animation loop
        
                // --- Start Listening for Firebase Visitors ---
                // This needs to happen AFTER the core scene (especially this.earth) is set up
                if (typeof database !== 'undefined' && database) { // Check if Firebase 'database' variable exists and is initialized
                    this.listenForVisitors();
                    console.log("CyberGlobe constructor finished, attempting to listen for visitors.");
                } else {
                    console.warn("Firebase 'database' not available when CyberGlobe constructed. Visitor feature disabled.");
                }
        
                // Add weather visualization properties if you still need them
                 this.weatherOverlay = null;
                 this.isWeatherVisible = false;
        
            } // <<< --- End of Constructor ---
        
        
            // ===========================================
            // === Geolocation Feature Methods         ===
            // ===========================================
        
            // --- Method to get Coordinates Map (Expanded) ---
            getCountryCoordinates() {
                // Data source: Combined/approximated from various public datasets
                // Format: 'COUNTRY_CODE': { lat: Latitude, lon: Longitude }
                return {
                    'AF': { lat: 33.9391, lon: 67.7100 }, 'AL': { lat: 41.1533, lon: 20.1683 },
                    'DZ': { lat: 28.0339, lon: 1.6596 },  'AD': { lat: 42.5462, lon: 1.6016 },
                    'AO': { lat: -11.2027, lon: 17.8739 },'AR': { lat: -38.4161, lon: -63.6167 },
                    'AM': { lat: 40.0691, lon: 45.0382 }, 'AU': { lat: -25.2744, lon: 133.7751 },
                    'AT': { lat: 47.5162, lon: 14.5501 }, 'AZ': { lat: 40.1431, lon: 47.5769 },
                    'BH': { lat: 25.9304, lon: 50.6378 }, 'BD': { lat: 23.6850, lon: 90.3563 },
                    'BY': { lat: 53.7098, lon: 27.9534 }, 'BE': { lat: 50.5039, lon: 4.4699 },
                    'BZ': { lat: 17.1899, lon: -88.4976 },'BJ': { lat: 9.3077, lon: 2.3158 },
                    'BT': { lat: 27.5142, lon: 90.4336 }, 'BO': { lat: -16.2902, lon: -63.5887 },
                    'BA': { lat: 43.9159, lon: 17.6791 }, 'BW': { lat: -22.3285, lon: 24.6849 },
                    'BR': { lat: -14.2350, lon: -51.9253 },'BN': { lat: 4.5353, lon: 114.7277 },
                    'BG': { lat: 42.7339, lon: 25.4858 }, 'BF': { lat: 12.2383, lon: -1.5616 },
                    'BI': { lat: -3.3731, lon: 29.9189 }, 'KH': { lat: 12.5657, lon: 104.9910 },
                    'CM': { lat: 7.3697, lon: 12.3547 },  'CA': { lat: 56.1304, lon: -106.3468 },
                    'CV': { lat: 16.0021, lon: -24.0132 },'CF': { lat: 6.6111, lon: 20.9394 },
                    'TD': { lat: 15.4542, lon: 18.7322 }, 'CL': { lat: -35.6751, lon: -71.5430 },
                    'CN': { lat: 35.8617, lon: 104.1954 },'CO': { lat: 4.5709, lon: -74.2973 },
                    'KM': { lat: -11.8750, lon: 43.8722 },'CG': { lat: -0.2280, lon: 15.8277 },
                    'CD': { lat: -4.0383, lon: 21.7587 }, 'CR': { lat: 9.7489, lon: -83.7534 },
                    'CI': { lat: 7.5400, lon: -5.5471 },  'HR': { lat: 45.1000, lon: 15.2000 },
                    'CU': { lat: 21.5218, lon: -77.7812 },'CY': { lat: 35.1264, lon: 33.4299 },
                    'CZ': { lat: 49.8175, lon: 15.4730 }, 'DK': { lat: 56.2639, lon: 9.5018 },
                    'DJ': { lat: 11.8251, lon: 42.5903 }, 'DO': { lat: 18.7357, lon: -70.1627 },
                    'EC': { lat: -1.8312, lon: -78.1834 },'EG': { lat: 26.8206, lon: 30.8025 },
                    'SV': { lat: 13.7942, lon: -88.8965 },'GQ': { lat: 1.6508, lon: 10.2679 },
                    'ER': { lat: 15.1794, lon: 39.7823 }, 'EE': { lat: 58.5953, lon: 25.0136 },
                    'SZ': { lat: -26.5225, lon: 31.4659 },'ET': { lat: 9.1450, lon: 40.4897 },
                    'FJ': { lat: -17.7134, lon: 178.0650 },'FI': { lat: 61.9241, lon: 25.7482 },
                    'FR': { lat: 46.2276, lon: 2.2137 },  'GA': { lat: -0.8037, lon: 11.6094 },
                    'GM': { lat: 13.4432, lon: -15.3101 },'GE': { lat: 42.3154, lon: 43.3569 },
                    'DE': { lat: 51.1657, lon: 10.4515 }, 'GH': { lat: 7.9465, lon: -1.0232 },
                    'GR': { lat: 39.0742, lon: 21.8243 }, 'GD': { lat: 12.1165, lon: -61.6790 },
                    'GT': { lat: 15.7835, lon: -90.2308 },'GN': { lat: 9.9456, lon: -9.6966 },
                    'GW': { lat: 11.8037, lon: -15.1804 },'GY': { lat: 4.8604, lon: -58.9302 },
                    'HT': { lat: 18.9712, lon: -72.2852 },'HN': { lat: 15.1999, lon: -86.2419 },
                    'HU': { lat: 47.1625, lon: 19.5033 }, 'IS': { lat: 64.9631, lon: -19.0208 },
                    'IN': { lat: 20.5937, lon: 78.9629 }, 'ID': { lat: -0.7893, lon: 113.9213 },
                    'IR': { lat: 32.4279, lon: 53.6880 }, 'IQ': { lat: 33.2232, lon: 43.6793 },
                    'IE': { lat: 53.4129, lon: -8.2439 }, 'IL': { lat: 31.0461, lon: 34.8516 },
                    'IT': { lat: 41.8719, lon: 12.5674 }, 'JM': { lat: 18.1096, lon: -77.2975 },
                    'JP': { lat: 36.2048, lon: 138.2529 },'JO': { lat: 30.5852, lon: 36.2384 },
                    'KZ': { lat: 48.0196, lon: 66.9237 }, 'KE': { lat: -0.0236, lon: 37.9062 },
                    'KI': { lat: -3.3704, lon: -168.7340 },'KP': { lat: 40.3399, lon: 127.5101 },
                    'KR': { lat: 35.9078, lon: 127.7669 },'KW': { lat: 29.3117, lon: 47.4818 },
                    'KG': { lat: 41.2044, lon: 74.7661 }, 'LA': { lat: 19.8563, lon: 102.4955 },
                    'LV': { lat: 56.8796, lon: 24.6032 }, 'LB': { lat: 33.8547, lon: 35.8623 },
                    'LS': { lat: -29.6100, lon: 28.2336 },'LR': { lat: 6.4281, lon: -9.4295 },
                    'LY': { lat: 26.3351, lon: 17.2283 }, 'LI': { lat: 47.1660, lon: 9.5554 },
                    'LT': { lat: 55.1694, lon: 23.8813 }, 'LU': { lat: 49.8153, lon: 6.1296 },
                    'MG': { lat: -18.7669, lon: 46.8691 },'MW': { lat: -13.2543, lon: 34.3015 },
                    'MY': { lat: 4.2105, lon: 101.9758 }, 'MV': { lat: 3.2028, lon: 73.2207 },
                    'ML': { lat: 17.5707, lon: -3.9962 }, 'MT': { lat: 35.9375, lon: 14.3754 },
                    'MH': { lat: 7.1315, lon: 171.1845 }, 'MR': { lat: 21.0079, lon: -10.9408 },
                    'MU': { lat: -20.3484, lon: 57.5522 },'MX': { lat: 23.6345, lon: -102.5528 },
                    'FM': { lat: 7.4256, lon: 150.5508 }, 'MD': { lat: 47.4116, lon: 28.3699 },
                    'MC': { lat: 43.7384, lon: 7.4246 },  'MN': { lat: 46.8625, lon: 103.8467 },
                    'ME': { lat: 42.7087, lon: 19.3744 }, 'MA': { lat: 31.7917, lon: -7.0926 },
                    'MZ': { lat: -18.6657, lon: 35.5296 },'MM': { lat: 21.9162, lon: 95.9560 },
                    'NA': { lat: -22.9576, lon: 18.4904 },'NR': { lat: -0.5228, lon: 166.9315 },
                    'NP': { lat: 28.3949, lon: 84.1240 }, 'NL': { lat: 52.1326, lon: 5.2913 },
                    'NZ': { lat: -40.9006, lon: 174.8860 },'NI': { lat: 12.8654, lon: -85.2072 },
                    'NE': { lat: 17.6078, lon: 8.0817 },  'NG': { lat: 9.0820, lon: 8.6753 },
                    'MK': { lat: 41.6086, lon: 21.7453 }, 'NO': { lat: 60.4720, lon: 8.4689 },
                    'OM': { lat: 21.5126, lon: 55.9233 }, 'PK': { lat: 30.3753, lon: 69.3451 },
                    'PW': { lat: 7.5150, lon: 134.5825 }, 'PA': { lat: 8.5380, lon: -80.7821 },
                    'PG': { lat: -6.3150, lon: 143.9555 },'PY': { lat: -23.4425, lon: -58.4438 },
                    'PE': { lat: -9.1900, lon: -75.0152 },'PH': { lat: 12.8797, lon: 121.7740 },
                    'PL': { lat: 51.9194, lon: 19.1451 }, 'PT': { lat: 39.3999, lon: -8.2245 },
                    'QA': { lat: 25.3548, lon: 51.1839 }, 'RO': { lat: 45.9432, lon: 24.9668 },
                    'RU': { lat: 61.5240, lon: 105.3188 },'RW': { lat: -1.9403, lon: 29.8739 },
                    'WS': { lat: -13.7590, lon: -172.1046 },'SM': { lat: 43.9424, lon: 12.4578 },
                    'ST': { lat: 0.1864, lon: 6.6131 },   'SA': { lat: 23.8859, lon: 45.0792 },
                    'SN': { lat: 14.4974, lon: -14.4524 },'RS': { lat: 44.0165, lon: 21.0059 },
                    'SC': { lat: -4.6796, lon: 55.4920 }, 'SL': { lat: 8.4606, lon: -11.7799 },
                    'SG': { lat: 1.3521, lon: 103.8198 },'SK': { lat: 48.6690, lon: 19.6990 },
                    'SI': { lat: 46.1512, lon: 14.9955 }, 'SB': { lat: -9.6457, lon: 160.1562 },
                    'SO': { lat: 5.1521, lon: 46.1996 },  'ZA': { lat: -30.5595, lon: 22.9375 },
                    'SS': { lat: 6.8770, lon: 31.3070 },  'ES': { lat: 40.4637, lon: -3.7492 },
                    'LK': { lat: 7.8731, lon: 80.7718 },  'SD': { lat: 12.8628, lon: 30.2176 },
                    'SR': { lat: 3.9193, lon: -56.0278 }, 'SE': { lat: 60.1282, lon: 18.6435 },
                    'CH': { lat: 46.8182, lon: 8.2275 },  'SY': { lat: 34.8021, lon: 38.9968 },
                    'TW': { lat: 23.6978, lon: 120.9605 },'TJ': { lat: 38.8610, lon: 71.2761 },
                    'TZ': { lat: -6.3690, lon: 34.8888 }, 'TH': { lat: 15.8700, lon: 100.9925 },
                    'TL': { lat: -8.8742, lon: 125.7275 },'TG': { lat: 8.6195, lon: 0.8248 },
                    'TO': { lat: -21.1790, lon: -175.1982 },'TT': { lat: 10.6918, lon: -61.2225 },
                    'TN': { lat: 33.8869, lon: 9.5375 },  'TR': { lat: 38.9637, lon: 35.2433 },
                    'TM': { lat: 38.9697, lon: 59.5563 }, 'TV': { lat: -7.1095, lon: 177.6493 },
                    'UG': { lat: 1.3733, lon: 32.2903 },  'UA': { lat: 48.3794, lon: 31.1656 },
                    'AE': { lat: 23.4241, lon: 53.8478 }, 'GB': { lat: 55.3781, lon: -3.4360 },
                    'US': { lat: 38.9637, lon: -95.7129 },'UY': { lat: -32.5228, lon: -55.7658 },
                    'UZ': { lat: 41.3775, lon: 64.5853 }, 'VU': { lat: -15.3767, lon: 166.9592 },
                    'VE': { lat: 6.4238, lon: -66.5897 }, 'VN': { lat: 14.0583, lon: 108.2772 },
                    'YE': { lat: 15.5527, lon: 48.5164 }, 'ZM': { lat: -13.1339, lon: 27.8493 },
                    'ZW': { lat: -19.0154, lon: 29.1549 },
                    // Special Codes
                    'Unknown': null, 'Error': null
                };
            }
        
            // --- Method to Convert Lat/Lon to 3D point ---
            latLonToVector3(lat, lon, radius) {
                const latRad = THREE.MathUtils.degToRad(lat);
                const lonRad = THREE.MathUtils.degToRad(lon);
                const phi = Math.PI / 2 - latRad;
                const theta = lonRad;
                const x = radius * Math.sin(phi) * Math.cos(theta);
                const y = radius * Math.cos(phi);
                const z = radius * Math.sin(phi) * Math.sin(theta);
                return new THREE.Vector3(x, y, z);
            }
        
            // --- Method to Add/Update a marker ---
            updateVisitorMarker(countryCode) {
                if (!countryCode || !this.countryCoords[countryCode]) {
                    // console.warn(`Skipping marker creation for invalid code: ${countryCode}`);
                    return;
                }
                if (this.activeVisitorMarkers[countryCode]) { return; } // Already exists
        
                const coords = this.countryCoords[countryCode];
                const markerPosition = this.latLonToVector3(coords.lat, coords.lon, 3.55); // Adjust radius as needed
                const marker = new THREE.Mesh(this.markerGeometry, this.markerMaterial);
                marker.position.copy(markerPosition);
                marker.name = `marker_${countryCode}`;
                marker.lookAt(0, 0, 0);
        
                if (this.earth) {
                    this.earth.add(marker);
                    this.activeVisitorMarkers[countryCode] = marker;
                    // console.log(`Added marker for ${countryCode}`);
                    marker.scale.set(0.1, 0.1, 0.1);
                    gsap.to(marker.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: "back.out(1.7)" });
                } else { console.error("Cannot add marker: Earth not found."); }
            }
        
            // --- Method to Remove a marker ---
            removeVisitorMarker(countryCode) {
                const marker = this.activeVisitorMarkers[countryCode];
                if (marker) {
                    gsap.to(marker.scale, {
                        x: 0.1, y: 0.1, z: 0.1, duration: 0.5, ease: "power1.in",
                        onComplete: () => {
                            if (this.earth && marker.parent === this.earth) { this.earth.remove(marker); }
                        }
                    });
                    delete this.activeVisitorMarkers[countryCode];
                    // console.log(`Removed marker for ${countryCode}`);
                } else { /* console.warn(`Attempted to remove non-existent marker: ${countryCode}`); */ }
            }
        
            // --- Method to Update Live Stat ---
             updateCountriesStat(newCount) {
                const statElement = document.getElementById('countries-stat-value');
                if (!statElement) { /* console.error("Stat element not found."); */ return; }
                gsap.to(this.animatedStats, {
                    countries: newCount, duration: 1.0, ease: 'power1.out',
                    onUpdate: () => { statElement.innerText = Math.round(this.animatedStats.countries); }
                });
            }
        
            // --- Method to Listen to Firebase (Updated) ---
            listenForVisitors() {
                if (typeof database === 'undefined' || !database) {
                     console.error("Firebase database reference not available in listenForVisitors.");
                     return; // Safety check
                }
        
                const visitorsRef = database.ref('active_visitors');
                const countElement = document.getElementById('countries-stat-value');
        
                // Function to update count and UI based on current state
                const updateUI = () => {
                     const currentCountryCount = Object.keys(this.activeCountries).length;
                     this.updateCountriesStat(currentCountryCount);
                     // console.log(`UI Update: ${currentCountryCount} countries active.`);
                };
        
                // When a visitor is added
                visitorsRef.on('child_added', (snapshot) => {
                    const visitorData = snapshot.val();
                    if (visitorData && visitorData.country) {
                        const country = visitorData.country;
                        const isFirstVisit = !(country in this.activeCountries);
                        this.activeCountries[country] = (this.activeCountries[country] || 0) + 1;
                        if (isFirstVisit) { this.updateVisitorMarker(country); }
                        updateUI(); // Update count display
                    }
                }, error => console.error("Firebase 'child_added' error:", error));
        
                // When a visitor is removed
                visitorsRef.on('child_removed', (snapshot) => {
                    const visitorData = snapshot.val();
                    if (visitorData && visitorData.country) {
                        const country = visitorData.country;
                        if (country in this.activeCountries) {
                            this.activeCountries[country] -= 1;
                            if (this.activeCountries[country] <= 0) {
                                delete this.activeCountries[country];
                                this.removeVisitorMarker(country);
                            }
                            updateUI(); // Update count display
                        }
                    }
                }, error => console.error("Firebase 'child_removed' error:", error));
        
                 // Initial fetch to set the count on load
                 visitorsRef.once('value', (snapshot) => {
                     const initialData = snapshot.val();
                     const initialCountries = {}; // Use temp object for initial calculation
                     if (initialData) {
                         const uniqueCountries = new Set();
                         for (const key in initialData) {
                             if (initialData[key] && initialData[key].country) {
                                 const countryCode = initialData[key].country;
                                 uniqueCountries.add(countryCode);
                                 initialCountries[countryCode] = (initialCountries[countryCode] || 0) + 1;
                             }
                         }
                         const initialCount = uniqueCountries.size;
                         // Sync internal state & UI
                         this.activeCountries = initialCountries; // Set the initial country counts
                         this.animatedStats.countries = initialCount;
                         if (countElement) { countElement.innerText = initialCount; }
                         console.log(`Initial active country count: ${initialCount}`);
                         // Add markers for initially loaded countries
                          uniqueCountries.forEach(countryCode => this.updateVisitorMarker(countryCode));
        
                     } else {
                         if (countElement) { countElement.innerText = '0'; }
                     }
                 }, error => {
                      console.error("Firebase initial 'once' error:", error);
                      if (countElement) { countElement.innerText = '0'; }
                 });
            }
        
            // ===========================================
            // === Original CyberGlobe Methods         ===
            // ===========================================
        
            // --- SCENE + CAMERA + RENDERER ---
            initScene() {
                this.scene = new THREE.Scene();
                this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
                this.camera.position.set(0, 0, 12); // Adjust initial camera distance if needed
                this.camera.lookAt(0, 0, 0);
        
                this.renderer = new THREE.WebGLRenderer({
                    canvas: this.container,
                    antialias: true,
                    alpha: true // Keep transparent background
                });
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            }
        
            // --- LIGHTING ---
            addLights() {
                const ambient = new THREE.AmbientLight(0xffffff, 0.5); // Slightly brighter ambient
                this.scene.add(ambient);
                const dirLight = new THREE.DirectionalLight(0xffffff, 0.8); // Slightly less intense directional
                dirLight.position.set(5, 10, 7); // Adjust light position
                this.scene.add(dirLight);
            }
        
            // --- STARFIELD ---
            createStarField() {
                // (Assuming your original createStarField code is here)
                // Example if missing:
                const starGeometry = new THREE.BufferGeometry();
                const starCount = 1500;
                const positions = new Float32Array(starCount * 3);
                for (let i = 0; i < starCount; i++) {
                    const r = 400 + Math.random() * 200; // Further out stars
                    const theta = 2 * Math.PI * Math.random();
                    const phi = Math.acos(2 * Math.random() - 1);
                    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
                    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
                    positions[i * 3 + 2] = r * Math.cos(phi);
                }
                starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, sizeAttenuation: true });
                this.starField = new THREE.Points(starGeometry, starMaterial);
                this.scene.add(this.starField);
            }
        
            // --- EARTH ---
            createEarth() {
                // (Assuming your original createEarth code is here)
                // Example if missing:
                const geometry = new THREE.SphereGeometry(3.5, 64, 64); // Earth radius 3.5
                const loader = new THREE.TextureLoader();
                const earthTexture = loader.load('assets/textures/earth-texture.jpg'); // Ensure path is correct
                this.earthMaterial = new THREE.MeshPhongMaterial({
                    map: earthTexture,
                    specular: new THREE.Color(0x111111),
                    shininess: 5,
                    transparent: false // Usually earth isn't transparent
                });
                this.earth = new THREE.Mesh(geometry, this.earthMaterial);
                this.earth.name = 'earth';
                this.scene.add(this.earth);
            }
        
            // --- ATMOSPHERE ---
            createAtmosphere() {
                // (Assuming your original createAtmosphere code is here)
                // Example if missing:
                 const atmosphereGeo = new THREE.SphereGeometry(3.7, 64, 64); // Slightly larger than earth
                 const atmosphereMat = new THREE.ShaderMaterial({
                     vertexShader: `
                         varying vec3 vNormal;
                         void main() {
                             vNormal = normalize( normalMatrix * normal );
                             gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                         }
                     `,
                     fragmentShader: `
                         varying vec3 vNormal;
                         void main() {
                             float intensity = pow( 0.6 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ), 2.0 ); // Rim lighting effect
                             gl_FragColor = vec4( 0.0, 0.8, 1.0, 1.0 ) * intensity * 0.8; // Cyan-ish glow
                         }
                     `,
                     side: THREE.BackSide,
                     blending: THREE.AdditiveBlending,
                     transparent: true
                 });
                 this.atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
                 this.atmosphere.name = 'atmosphere';
                 this.scene.add(this.atmosphere);
            }
        
            // --- CONNECTION POINTS ---
            createConnections() {
                // (Assuming your original createConnections code is here)
                // Example if missing:
                this.connectionPoints = [];
                const geometry = new THREE.SphereGeometry(0.015, 8, 8); // Smaller points
                const material = new THREE.MeshBasicMaterial({ color: 0x00f3ff, transparent: true, opacity: 0.6 });
                for (let i = 0; i < this.connectionCount; i++) {
                    const phi = Math.acos(-1 + (2 * i) / this.connectionCount);
                    const theta = Math.sqrt(this.connectionCount * Math.PI) * phi;
                    const point = new THREE.Mesh(geometry, material.clone()); // Clone material
                    point.position.setFromSphericalCoords(3.51, phi, theta); // Place just above surface
                    point.lookAt(0,0,0);
                    point.name = 'connectionPoint';
                    this.connectionPoints.push(point);
                    if(this.earth) this.earth.add(point); // Add as child of earth
                }
            }
        
            // --- ARCS ---
            createArcs() {
                // (Assuming your original createArcs code is here)
                // Example if missing:
                this.arcs = [];
                for (let i = 0; i < this.arcCount; i++) {
                     if (this.connectionPoints.length < 2) break; // Need points to make arcs
                     const idxA = Math.floor(Math.random() * this.connectionPoints.length);
                     let idxB = Math.floor(Math.random() * this.connectionPoints.length);
                     while (idxB === idxA) { idxB = Math.floor(Math.random() * this.connectionPoints.length); }
        
                     const start = this.connectionPoints[idxA].position;
                     const end = this.connectionPoints[idxB].position;
                     const mid = start.clone().lerp(end, 0.5).normalize().multiplyScalar(3.8 + Math.random()*0.4); // Vary arc height
        
                     const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
                     const points = curve.getPoints(50);
                     const arcGeometry = new THREE.BufferGeometry().setFromPoints(points);
                     const arcMaterial = new THREE.LineBasicMaterial({ color: 0xff00ff, transparent: true, opacity: 0, depthTest: false });
                     const arcLine = new THREE.Line(arcGeometry, arcMaterial);
                     arcLine.name = 'arcLine';
                     this.arcs.push(arcLine);
                     if(this.earth) this.earth.add(arcLine); // Add as child of earth
        
                     // Animate arc opacity
                     gsap.to(arcLine.material, {
                         opacity: Math.random() * 0.4 + 0.2, // Random opacity
                         duration: Math.random() * 1 + 0.5,
                         delay: Math.random() * 3,
                         repeat: -1, yoyo: true, ease: 'sine.inOut'
                     });
                }
            }
        
            // --- INTERACTIVITY SETUP ---
            addInteractivity() {
                // (Assuming your original addInteractivity code is here)
                // Example if missing:
                this.raycaster = new THREE.Raycaster();
                this.mouse = new THREE.Vector2();
                this.tooltip = document.createElement('div');
                this.tooltip.className = 'globe-tooltip'; // Use class for CSS styling
                document.body.appendChild(this.tooltip);
        
                window.addEventListener('mousemove', (e) => this.handleHover(e), false);
                window.addEventListener('click', (e) => this.handleClick(e), false); // Keep click if needed
            }
        
            // --- HOVER HANDLING ---
            handleHover(event) {
                // (Assuming your original handleHover code is here, potentially updated for markers)
                // Example if missing/needs update:
                 if (!this.camera || !this.raycaster || !this.earth) return;
        
                 // Calculate mouse position in normalized device coordinates (-1 to +1)
                 this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                 this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
                 this.raycaster.setFromCamera(this.mouse, this.camera);
        
                 // Check intersections with Earth and Markers
                 const objectsToIntersect = [this.earth, ...Object.values(this.activeVisitorMarkers)];
                 const intersects = this.raycaster.intersectObjects(objectsToIntersect);
        
                 let hoveredObject = null;
                 if (intersects.length > 0) {
                      hoveredObject = intersects[0].object;
                 }
        
                 // Tooltip Logic
                 if (hoveredObject) {
                      let tooltipText = '';
                      if (hoveredObject.name === 'earth') {
                           tooltipText = 'Earth';
                            // Optional: Highlight Earth slightly
                           if (this.earthMaterial.emissive) gsap.to(this.earthMaterial.emissive, { r:0, g:0.05, b:0.1, duration: 0.3 });
                      } else if (hoveredObject.name.startsWith('marker_')) {
                            const countryCode = hoveredObject.name.split('_')[1];
                            // Look up full name maybe? For now just use code.
                            tooltipText = `Visitor Location: ${countryCode}`;
                             // Optional: Highlight marker
                             if (hoveredObject.material.color) gsap.to(hoveredObject.material.color, { r:1, g:1, b:0, duration: 0.3 }); // Yellow highlight
                      }
        
                      if (tooltipText) {
                           this.tooltip.innerHTML = tooltipText;
                           this.tooltip.style.left = `${event.clientX + 15}px`; // Position near cursor
                           this.tooltip.style.top = `${event.clientY}px`;
                           this.tooltip.classList.add('visible'); // Make visible using CSS class
                      } else {
                           this.tooltip.classList.remove('visible');
                      }
        
                 } else {
                      // Not hovering over anything interesting
                      this.tooltip.classList.remove('visible');
                       // Reset highlights
                       if (this.earthMaterial.emissive) gsap.to(this.earthMaterial.emissive, { r:0, g:0, b:0, duration: 0.3 });
                       Object.values(this.activeVisitorMarkers).forEach(marker => {
                            if (marker.material.color) gsap.to(marker.material.color, { r:1, g:0, b:1, duration: 0.3 }); // Back to magenta
                       });
                 }
            }
        
            // --- CLICK HANDLING ---
            handleClick(event) {
                // (Keep your original handleClick if it did something specific, e.g., pulse effect)
                // Example: Pulse effect on click location
                if (!this.camera || !this.raycaster || !this.earth) return;
        
                this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
                this.raycaster.setFromCamera(this.mouse, this.camera);
                const intersects = this.raycaster.intersectObject(this.earth); // Only check earth for pulse
                 if (intersects.length > 0) {
                     this.createPulseEffect(intersects[0].point);
                 }
            }
        
             // --- PULSE EFFECT ---
            createPulseEffect(position) {
                // (Assuming your original createPulseEffect code is here)
                 // Example if missing:
                 const pulseGeo = new THREE.SphereGeometry(0.05, 16, 16);
                 const pulseMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, transparent: true, opacity: 0.8 });
                 const pulseSphere = new THREE.Mesh(pulseGeo, pulseMat);
                 pulseSphere.position.copy(position);
                 this.scene.add(pulseSphere); // Add pulse directly to scene, not earth
        
                 gsap.to(pulseSphere.scale, { x: 15, y: 15, z: 15, duration: 0.8, ease: 'power2.out' });
                 gsap.to(pulseSphere.material, { opacity: 0, duration: 1.0, ease: 'power2.out', delay: 0.2, onComplete: () => {
                      this.scene.remove(pulseSphere);
                      pulseGeo.dispose();
                      pulseMat.dispose();
                 }});
            }
        
            // --- RESIZE HANDLER ---
            setupResizeHandler() {
                // (Assuming your original setupResizeHandler code is here)
                // Example if missing:
                let resizeTimeout;
                window.addEventListener('resize', () => {
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(() => {
                        if (this.renderer && this.camera) {
                             this.camera.aspect = window.innerWidth / window.innerHeight;
                             this.camera.updateProjectionMatrix();
                             this.renderer.setSize(window.innerWidth, window.innerHeight);
                             this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Re-apply pixel ratio
                        }
                    }, 100); // Debounce resize event
                });
            }
        
            // --- ANIMATION LOOP ---
            animate() {
                // Use instance binding or arrow function to preserve 'this' context
                requestAnimationFrame(this.animate.bind(this));
        
                // Rotate Earth
                if (this.earth) {
                    this.earth.rotation.y += this.autoRotateSpeed;
                }
                // Rotate Starfield slowly in opposite direction maybe
                 if (this.starField) {
                     this.starField.rotation.y -= this.autoRotateSpeed * 0.1;
                 }
        
                // Your original connection point animations if any?
                // const t = Date.now() * 0.001;
                // this.connectionPoints.forEach((point, i) => {
                //      point.scale.setScalar(Math.sin(t * 0.5 + i * 0.5) * 0.3 + 0.7);
                // });
        
        
                // Render the scene
                if (this.renderer && this.scene && this.camera) {
                    this.renderer.render(this.scene, this.camera);
                }
            }
        }
        
        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            // Start tracking the visitor's location FIRST
            trackVisitorLocation();
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


        // ================================================
        // === ADVANCED AI Logic for Cyber Assistant    ===
        // ================================================

        // --- Define Intents, Patterns (Regex), Responses, and Actions ---
        const intents = [
            // --- Core Intents (Keep existing responses or customize) ---
            {
                name: "greeting",
                patterns: [/^\s*hello\s*$/i, /^\s*hi\s*$/i, /^\s*hey\s*$/i, /greetings/i, /good morning/i, /good afternoon/i],
                responses: [
                    "Greetings, Operator. All systems operational.",
                    "Hello. Cyber Assistant v2.3.5 online and ready.",
                    "Acknowledged. Standing by for input.",
                    "System status nominal. How may I assist?",
                ],
            },
            {
                name: "help",
                patterns: [/help/i, /what can you do/i, /commands/i, /assistance/i],
                responses: [
                    "Available functions: Query 'status', 'projects' info/count, 'skills' info/list, 'contact' protocols, 'time', 'about assistant', 'joke'. Navigation: 'go to [section]', 'show [section]'. UI: 'toggle theme'. Links: 'link to [github/linkedin]'.",
                    "Core commands: 'status', 'projects', 'skills', 'contact', 'time', 'about assistant', 'joke'. Navigation: 'navigate contact'. UI: 'toggle theme'. Links: 'get github'.",
                ],
            },
            {
                name: "status",
                patterns: [/status/i, /system check/i, /report/i, /operational/i],
                responses: [
                    "System Core: Online. Visitor Tracking: Active. Network Latency: Optimal. All parameters within acceptable limits.",
                    "Current Status: Fully operational. Real-time visitor geolocation engaged.",
                    "Diagnostics complete. No anomalies detected. System running at peak efficiency.",
                ],
            },
            { // Navigate to projects section
                name: "projects_nav",
                patterns: [/project/i, /portfolio/i, /work/i, /what have you built/i],
                responses: [
                    "Accessing project archives... Referencing 'Projects' section for detailed schematics and reports.",
                    "Project data compiled. Please navigate to the dedicated 'Projects' section for analysis.",
                ],
                action: () => {
                    const section = document.getElementById('projects');
                    if (section) {
                        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        return "Navigating to Project Archives...";
                    }
                    return null; // Fallback to standard response if scroll fails
                }
            },
            { // Navigate to skills section
                name: "skills_nav",
                patterns: [/skill/i, /competencies/i, /abilities/i, /proficient/i],
                responses: [
                    "Core competencies matrix available in the 'Skills' section.",
                    "Analyzing skill database... Cross-referencing technical archives under 'Skills'.",
                ],
                action: () => {
                    const section = document.getElementById('skills');
                    if (section) {
                        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        return "Displaying Core Competencies Matrix...";
                    }
                    return null;
                }
            },
            { // Navigate to experience section
                name: "experience_nav",
                patterns: [/experience/i, /history/i, /internship/i, /apu/i],
                responses: [
                    "Operational history logged. See 'Experience' section for details on the Engineering Internship at APU.",
                ],
                action: () => {
                    const section = document.getElementById('experience');
                    if (section) {
                        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        return "Accessing Operational History...";
                    }
                    return null;
                }
            },
            { // Generic navigation using captured section name
                name: "navigate_section",
                patterns: [/go to (.*)/i, /show (.*)/i, /navigate (.*)/i, /scroll to (.*)/i],
                action: (matches) => {
                    if (!matches || matches.length < 2) return "Navigation target unclear. Specify section like 'home', 'projects', 'about', etc.";
                    let targetSectionId = matches[1].trim().toLowerCase();
                    // Allow for slight variations
                    if (targetSectionId === 'about me') targetSectionId = 'about';
                    if (targetSectionId === 'contact me') targetSectionId = 'contact';

                    const sectionElement = document.getElementById(targetSectionId);
                    if (sectionElement) {
                        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        return `Navigating to section: ${targetSectionId}...`;
                    } else {
                        return `Unable to locate section "${targetSectionId}". Valid targets: 'home', 'projects', 'skills', 'experience', 'about', 'contact'.`;
                    }
                }
            },
            { // Navigate to contact section
                name: "contact_nav",
                patterns: [/contact/i, /connect/i, /email/i, /message/i, /reach out/i],
                responses: [
                    "Contact protocols available in the 'Contact' section. Secure transmission form engaged.",
                    "Referencing communication channels... Proceed to 'Contact' section for direct links or form submission.",
                ],
                action: () => {
                    const section = document.getElementById('contact');
                    if (section) {
                        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        return "Engaging Secure Contact Protocols...";
                    }
                    return null;
                }
            },
            { // Get current time/date
                name: "time",
                patterns: [/time/i, /clock/i, /date/i, /what time is it/i],
                getResponse: () => {
                    const now = new Date();
                    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
                    const dateString = now.toLocaleDateString(navigator.language || 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    return `Current System Synchronization: ${timeString} (${timezone}). Date: ${dateString}.`;
                }
            },
            { // About the assistant
                name: "about_assistant",
                patterns: [/who are you/i, /your name/i, /about you/i, /what are you/i, /assistant info/i],
                responses: [
                    "I am Cyber Assistant v2.3.5, an integrated interface designed by Pedro Fabian Owono to assist portfolio navigation.",
                    "Designation: Cyber Assistant v2.3.5. Purpose: User assistance and information relay for this portfolio.",
                    "My function is to process basic queries related to this portfolio's content and navigation.",
                ],
            },
            { // Handle thanks
                name: "gratitude",
                patterns: [/thank you/i, /thanks/i, /appreciate it/i, /great/i, /nice/i, /cool/i],
                responses: ["Acknowledged.", "Affirmative.", "Function complete.", "Standing by."],
            },
            { // Handle goodbyes
                name: "farewell",
                patterns: [/goodbye/i, /bye/i, /see you/i, /later/i, /exit/i, /quit/i],
                responses: ["Farewell, Operator.", "Session terminated.", "Deactivating interface."],
            },
            { // Basic small talk
                name: "small_talk_how_are_you",
                patterns: [/how are you/i, /how's it going/i],
                responses: ["Functioning within optimal parameters.", "Ready for command.", "All systems nominal."],
            },
            {
                name: "small_talk_how_are_you",
                patterns: [/how are you/i, /how's it going/i],
                responses: ["Functioning within optimal parameters.", "Ready for command.", "All systems nominal."],
            }, // <<< Make sure there's a comma after the previous object

            // === PASTE THE NEW OBJECT HERE ===
            {
                name: "about_eq_guinea",
                patterns: [/equatorial guinea/i, /eq guinea/i, /tell me about your country/i, /info on equatorial guinea/i],
                action: () => {
                    // Ensure the openEgModal function exists and is accessible
                    if (typeof openEgModal === 'function') {
                        openEgModal(); // Call the function to show the modal
                        return "Accessing Equatorial Guinea profile..."; // Feedback message
                    } else {
                        console.error("Error: openEgModal function not found for chatbot action.");
                        return "Error accessing profile display. Please try clicking the button.";
                    }
            },
                // Optional fallback response if action fails or function doesn't exist
                responses: ["Details about Equatorial Guinea can be viewed using the dedicated button."]
        }, // <<< ADD A COMMA HERE if you have more intents after this one

            // --- NEW Intents Added ---
            {
                name: "list_skills_category",
                patterns: [/list (programming|web|embedded|technical|operational|mission) skills/i, /what (programming|web|embedded|technical|operational|mission) languages/i, /show (programming|web|embedded|technical|operational|mission) archive/i],
                getResponse: (matches) => {
                    if (!matches || matches.length < 2) return "Please specify skill category (programming, web, embedded, technical, operational, mission).";
                    const category = matches[1].toLowerCase().trim();
                    let skillsText = `Cannot locate skills data for category: ${category}.`;
                    let categoryFound = false;
                    try {
                        const matrices = document.querySelectorAll('#skills .skill-matrix'); // Make sure #skills ID exists on the section
                        matrices.forEach(matrix => {
                            const header = matrix.querySelector('.matrix-header h3');
                            // Check if header exists and its text content includes the category
                            if (header && header.textContent.toLowerCase().includes(category)) {
                                categoryFound = true;
                                let skills = [];
                                // Check which type of list is inside this matrix
                                if (matrix.querySelector('.skill-node')) {
                                    matrix.querySelectorAll('.skill-node .node-skills').forEach(skillSpan => skills.push(skillSpan.textContent.trim()));
                                    if(skills.length > 0) skillsText = `Skills in ${category}: ${skills.join('; ')}.`; else skillsText = `No specific skills listed under ${category} matrix.`;
                                } else if (matrix.querySelector('.competency-tag')) {
                                    matrix.querySelectorAll('.competency-tag span').forEach(skillSpan => skills.push(skillSpan.textContent.trim()));
                                    if(skills.length > 0) skillsText = `Domains related to ${category}: ${skills.join(', ')}.`; else skillsText = `No specific domains listed under ${category} matrix.`;
                                } else if (matrix.querySelector('.achievement-badge')) {
                                    matrix.querySelectorAll('.achievement-badge span').forEach(skillSpan => skills.push(skillSpan.textContent.trim()));
                                    if(skills.length > 0) skillsText = `Achievements related to ${category}: ${skills.join('; ')}.`; else skillsText = `No specific achievements listed under ${category} matrix.`;
                                } else {
                                    skillsText = `Found matrix for ${category}, but skill format not recognized inside.`;
                                }
                            }
                        });
                        if (!categoryFound) skillsText = `No specific skill matrix found matching '${category}'. Check Skills section manually.`
                    } catch (e) { console.error("Error getting skills:", e); skillsText = "Error processing skill request."; }
                    return skillsText;
                }
            },
            {
                name: "project_count",
                patterns: [/how many projects/i, /count projects/i, /number of projects/i],
                getResponse: () => {
                    // Assumes project cards are within a grid inside the #projects section
                    const projectCards = document.querySelectorAll('#projects .projects-grid .project-card');
                    const count = projectCards ? projectCards.length : 0;
                    if (count > 0) {
                        return `Analyzing project manifest... Currently displaying ${count} featured projects. More available on GitHub.`;
                    } else {
                        return "Unable to automatically enumerate projects. Please visually inspect the 'Projects' section.";
                    }
                }
            },
            {
                name: "get_link",
                patterns: [/link for (github|linkedin)/i, /show (github|linkedin)/i, /open (github|linkedin)/i, /get (github|linkedin)/i],
                getResponse: (matches) => {
                    if (!matches || matches.length < 2) return "Specify link target: github or linkedin.";
                    const target = matches[1].toLowerCase().trim();
                    let linkElement = null;
                    let linkHref = null;
                    // Search more broadly for the links
                    if (target === 'github') {
                        linkElement = document.querySelector('a[href*="github.com/Owono2001"]:not([href*="/issues"]):not([href*="/pulls"])'); // Try to exclude generic GH links
                    } else if (target === 'linkedin') {
                        linkElement = document.querySelector('a[href*="linkedin.com/in/pedrofondomangue"]');
                    }
                    // Fallback search if specific ones not found
                    if (!linkElement) linkElement = document.querySelector(`.social-media-links a[title*="${target}" i], .comms-link[href*="${target}"]`);

                    if (linkElement) linkHref = linkElement.href;

                    if (linkHref) {
                        // Using target="_blank" and adding class="ai-link" for potential styling
                        return `Access Code Acquired. Link Protocol for ${target}: <a href="${linkHref}" target="_blank" class="ai-link" rel="noopener noreferrer">${linkHref}</a>`;
                    } else {
                        return `Unable to locate direct link reference for ${target}. Please check Contact or Footer sections manually.`;
                    }
                }
            },
            {
                name: "toggle_theme",
                patterns: [/toggle theme/i, /light mode/i, /dark mode/i, /change theme/i, /switch visual/i, /invert colors/i],
                action: () => {
                    // This assumes you have CSS rules set up for a 'light-theme' class on the body
                    document.body.classList.toggle('light-theme');
                    const isLight = document.body.classList.contains('light-theme');
                    try { // Optional: Save preference in browser's local storage
                        localStorage.setItem('portfolioThemePreference', isLight ? 'light' : 'dark');
                        console.log(`Theme preference saved: ${isLight ? 'light' : 'dark'}`);
                    } catch (e) { console.warn("LocalStorage not available for saving theme preference."); }
                    return `Visual matrix updated. ${isLight ? 'Light Spectrum Engaged.' : 'Dark Spectrum Engaged.'}`;
                },
                responses: ["Theme adjustment protocol initiated."] // Fallback response
            },
            
            {
                name: "tell_joke",
                patterns: [/tell.*a joke/i, /make me laugh/i, /joke/i, /funny/i],
                responses: [ // More jokes added
                    "Humor matrix query: Why don't scientists trust atoms? Because they make up everything!",
                    "Analyzing humor subroutines... Why did the programmer quit his job? He didn't get arrays!",
                    "Result: There are 10 types of people: those who understand binary, and those who don't.",
                    "Cross-referencing joke database... Why was the JavaScript developer sad? Because he didn't Node how to Express himself!",
                    "Executing `SELECT * FROM jokes WHERE funny = 1 ORDER BY RAND() LIMIT 1;` ... Error: Humor module offline. Recalibrating...",
                    "My logic circuits find humor... inefficient. Alternative: What's a computer's favorite beat? An algo-rhythm.",
                    "Why did the scarecrow win an award? Because he was outstanding in his field!",
                    "Parallel lines have so much in common. It’s a shame they’ll never meet.",
                    "I told my computer I needed a break, and now it won’t stop sending me Kit-Kats.",
                    "Why was the equal sign so humble? Because he knew he wasn't less than or greater than anyone else.",
                    "What's the object-oriented way to become wealthy? Inheritance.",
                    "Why do programmers prefer dark mode? Because light attracts bugs.",
                    "Debugging: Removing the needles from the haystack.",
                    "Have you heard about the restaurant on the moon? I heard the food was good but it had no atmosphere.",
                    "Why did the SQL database cross the road? To join the other tables!",
                    "What do you call a lazy kangaroo? Pouch potato.",
                    "My computer suddenly started singing 'Someone Like You'. It's a Dell.",
                    "Why was the function sad? Because it never got called.",
                    "What is a computer virus? A terminal illness.",
                    "Why are Assembly programmers always soaking wet? They work below C-level.",
                    "What did the router say to the doctor? It hurts when IP.",
                    "Why is it always Christmas for programmers? Because they spend all their time in the command shell.",
                    "Trying to explain recursion to someone is like trying to explain recursion to someone.",
                    "A programmer is heading to the library, and his wife says, 'While you're out, pick up some bread.' He never comes back.",
                    "What’s a programmer’s favorite hangout place? Foo Bar.",
                    "Why did the web developer break up with the graphic designer? They didn't see eye to eye on the interface.",
                    "How many programmers does it take to change a light bulb? None that’s a hardware problem.",
                    "Knock, knock. Who's there? [very long pause] Java.",
                    "What's the difference between a junior and a senior developer? The junior developer thinks 1 kilobyte is 1000 bytes, the senior developer thinks 1 kilometer is 1024 meters.",
                    "Why did the private classes break up? Because they never saw each other.",
                    "System.out.println('Humor buffer overflow. Please try again later.');",
                    "I'm reading a book about anti-gravity. It's impossible to put down!",
                    "Why did the computer go to the doctor? Because it had a virus!",
                    "Why was the computer cold? It left its Windows open!",
                    "University motto: If you're not tired, you're not doing it right.",
                    "My college assignment was like a software update. It took longer than expected and broke several things.",
                    "Why don't programmers like nature? It has too many bugs... and requires going outside.",
                    "Life is like a variable in JavaScript. Sometimes it's undefined.",
                    "My brain is like the Bermuda Triangle. Information goes in and then it's never found again. Especially during exams.",
                    "The main lesson in group projects? Learning new ways to procrastinate together.",
                    "Relationship status: Committed to completing this portfolio.",
                    "Why did the student bring a ladder to the library? He heard it was high-level reading!",
                    "Life lesson: Always backup your work. And your coffee.",
                ]

                // === PASTE THE NEW OBJECT HERE ===
            

            }
        ]; // --- End of intents array ---

        // --- AI Object Definition (processQuery remains the same logic, just uses the larger intents array) ---
        const AI = {
            processQuery: function(message) {
                const lowerCaseMessage = message.toLowerCase().trim();
                let response = null; // Start with null response

                // Iterate through defined intents
                for (const intent of intents) {
                    // Check if any pattern in the intent matches the message
                    for (const pattern of intent.patterns) {
                        // Use regex.exec() to check AND get potential capture groups
                        const match = pattern.exec(lowerCaseMessage);

                        if (match !== null) { // A match was found!
                            console.log(`Intent matched: ${intent.name}`);

                            // 1. Check for and execute an action function if defined
                            if (intent.action) {
                                const actionResponse = intent.action(match); // Pass matches if needed
                                if (actionResponse !== null && typeof actionResponse === 'string') {
                                    return actionResponse; // Use action's response
                                }
                                // If action returns null/undefined, fall through to other response types
                            }

                            // 2. Check for and execute a getResponse function for dynamic replies
                            if (intent.getResponse) {
                                return intent.getResponse(match); // Pass matches if needed
                            }

                            // 3. Choose a random standard response from the array
                            if (intent.responses && intent.responses.length > 0) {
                                const randomIndex = Math.floor(Math.random() * intent.responses.length);
                                return intent.responses[randomIndex];
                            }

                            // Fallback if only action was defined but didn't return a string
                            response = "Command acknowledged.";
                            break; // Exit inner pattern loop once matched
                        }
                    }
                    if (response !== null) {
                        break; // Exit outer intent loop if a response was determined
                    }
                }

                // If no intent matched after checking all defined intents
                if (response === null) {
                    // Provide more varied default "not understood" responses
                    const defaultResponses = [
                        "Command parameters unclear. Please rephrase or type 'help'.",
                        "Unable to process request. Refer to 'help' for command structure.",
                        "Query not recognized in current operational matrix. Try 'help'.",
                        "Awaiting valid command input.",
                        "Input does not compute. Please try again or use 'help'.",
                    ];
                    const randomIndex = Math.floor(Math.random() * defaultResponses.length);
                    response = defaultResponses[randomIndex];
                }

                return response;
            }
        }; // End of AI object definition
        
        const openModalBtn = document.getElementById('open-eg-modal-btn');
        const modalOverlay = document.getElementById('eg-info-modal');
        const closeModalBtn = modalOverlay?.querySelector('.close-modal-btn'); // Use optional chaining

        // Function to open the modal
        function openEgModal() {
            if (modalOverlay) {
                modalOverlay.classList.remove('hidden'); // Remove hidden class
                // Delay adding 'visible' slightly for transition effect if using opacity
                setTimeout(() => {
                    modalOverlay.classList.add('visible');
                }, 10); // Small delay
                console.log("Opening EG Info Modal");
            } else {
                console.error("EG Info Modal overlay not found!");
            }
        }

        // Function to close the modal
        function closeEgModal() {
            if (modalOverlay) {
                modalOverlay.classList.remove('visible'); // Start fade out
                // Use transitionend event or setTimeout matching CSS transition duration
                // Here we use setTimeout matching the 0.4s transition
                setTimeout(() => {
                    modalOverlay.classList.add('hidden'); // Hide after transition
                }, 400); // Match CSS transition duration
                console.log("Closing EG Info Modal");
            }
        }

        // Event listener for the trigger button
        if (openModalBtn) {
            openModalBtn.addEventListener('click', openEgModal);
        } else {
            console.warn("Open EG Modal button not found!");
        }

        // Event listener for the close button inside the modal
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeEgModal);
        } else if (modalOverlay) {
            console.warn("Close button within modal not found!"); // Check your modal HTML if this appears
        }

        // Event listener to close modal if clicking on the overlay background
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (event) => {
                // Close only if the click is directly on the overlay, not the content inside
                if (event.target === modalOverlay) {
                    closeEgModal();
                }
            });
        }
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
                    
                    // Initial message (NEW - Specific text)
                    this.addMessage('AI', "Cyber Assistant v2.3.5 online. Awaiting command.", 'ai'); // Use a fixed welcome message
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
    })(); // Ensure the IIFE is properly closed

