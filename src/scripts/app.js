// app.js - Archivo principal de funcionalidad
// Cache de elementos del DOM
let cachedHeaderHeight = 0;
let slideWidth = 0;
let currentSlide = 0;
let carouselInterval;
let resizeTimeout;

// Mobile menu toggle - VERSIÓN CORREGIDA
function initMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (!mobileMenuButton || !mobileMenu) return;
    
    mobileMenuButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevenir que el evento se propague
        const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
            // Cerrar menú
            mobileMenu.classList.remove('translate-y-0', 'opacity-100', 'visible');
            mobileMenu.classList.add('-translate-y-2', 'opacity-0', 'invisible');
            mobileMenuButton.innerHTML = '<i class="icon-align-justify text-2xl"></i>';
            mobileMenuButton.setAttribute('aria-expanded', 'false');
            mobileMenuButton.setAttribute('aria-label', 'Abrir menú móvil');
            document.body.classList.remove('overflow-hidden');
        } else {
            // Abrir menú
            mobileMenu.classList.remove('-translate-y-2', 'opacity-0', 'invisible');
            mobileMenu.classList.add('translate-y-0', 'opacity-100', 'visible');
            mobileMenuButton.innerHTML = '<i class="icon-cancel text-2xl"></i>';
            mobileMenuButton.setAttribute('aria-expanded', 'true');
            mobileMenuButton.setAttribute('aria-label', 'Cerrar menú móvil');
            document.body.classList.add('overflow-hidden');
        }
    });
    
    // Cerrar menú móvil al hacer clic en un enlace
    document.querySelectorAll('#mobile-menu a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('translate-y-0', 'opacity-100', 'visible');
            mobileMenu.classList.add('-translate-y-2', 'opacity-0', 'invisible');
            mobileMenuButton.setAttribute('aria-expanded', 'false');
            mobileMenuButton.innerHTML = '<i class="icon-align-justify text-2xl"></i>';
            mobileMenuButton.setAttribute('aria-label', 'Abrir menú móvil');
            document.body.classList.remove('overflow-hidden');
        });
    });
    
    // Cerrar menú al hacer clic fuera - CORREGIDO
    document.addEventListener('click', (e) => {
        const isMenuOpen = mobileMenuButton.getAttribute('aria-expanded') === 'true';
        const isClickInsideMenu = mobileMenu.contains(e.target);
        const isClickOnButton = mobileMenuButton.contains(e.target);
        
        if (isMenuOpen && !isClickInsideMenu && !isClickOnButton) {
            mobileMenu.classList.remove('translate-y-0', 'opacity-100', 'visible');
            mobileMenu.classList.add('-translate-y-2', 'opacity-0', 'invisible');
            mobileMenuButton.setAttribute('aria-expanded', 'false');
            mobileMenuButton.innerHTML = '<i class="icon-align-justify text-2xl"></i>';
            mobileMenuButton.setAttribute('aria-label', 'Abrir menú móvil');
            document.body.classList.remove('overflow-hidden');
        }
    });
    
    // Cerrar menú con tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenuButton.getAttribute('aria-expanded') === 'true') {
            mobileMenu.classList.remove('translate-y-0', 'opacity-100', 'visible');
            mobileMenu.classList.add('-translate-y-2', 'opacity-0', 'invisible');
            mobileMenuButton.setAttribute('aria-expanded', 'false');
            mobileMenuButton.innerHTML = '<i class="icon-align-justify text-2xl"></i>';
            mobileMenuButton.setAttribute('aria-label', 'Abrir menú móvil');
            document.body.classList.remove('overflow-hidden');
        }
    });
}

// Toggle del tema
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
    
    function toggleTheme() {
        const html = document.documentElement;
        const isDark = html.classList.contains('dark');
        
        if (isDark) {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            if (themeToggle) {
                themeToggle.innerHTML = '<i class="icon-moon" aria-hidden="true"></i>';
                themeToggle.setAttribute('aria-label', 'Cambiar a modo oscuro');
            }
            if (mobileThemeToggle) {
                const span = mobileThemeToggle.querySelector('span');
                if (span) span.textContent = 'Modo Oscuro';
                const icon = mobileThemeToggle.querySelector('i');
                if (icon) {
                    icon.className = 'icon-moon text-primary-500 dark:text-primary-400 w-5';
                    icon.setAttribute('aria-hidden', 'true');
                }
            }
        } else {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            if (themeToggle) {
                themeToggle.innerHTML = '<i class="icon-sun" aria-hidden="true"></i>';
                themeToggle.setAttribute('aria-label', 'Cambiar a modo claro');
            }
            if (mobileThemeToggle) {
                const span = mobileThemeToggle.querySelector('span');
                if (span) span.textContent = 'Modo Claro';
                const icon = mobileThemeToggle.querySelector('i');
                if (icon) {
                    icon.className = 'icon-sun text-primary-500 dark:text-primary-400 w-5';
                    icon.setAttribute('aria-hidden', 'true');
                }
            }
        }
        
        // Anunciar cambio para screen readers
        if (typeof window.announceToScreenReader === 'function') {
            window.announceToScreenReader(`Modo ${isDark ? 'claro' : 'oscuro'} activado`);
        }
    }
    
    // Asignar eventos de tema
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        themeToggle.setAttribute('aria-label', document.documentElement.classList.contains('dark') ? 
            'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    }
    
    if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('click', toggleTheme);
    }
    
    // Verificar tema guardado al cargar
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
        if (themeToggle) {
            themeToggle.innerHTML = '<i class="icon-sun" aria-hidden="true"></i>';
            themeToggle.setAttribute('aria-label', 'Cambiar a modo claro');
        }
        if (mobileThemeToggle) {
            const span = mobileThemeToggle.querySelector('span');
            if (span) span.textContent = 'Modo Claro';
            const icon = mobileThemeToggle.querySelector('i');
            if (icon) icon.className = 'icon-sun text-primary-500 dark:text-primary-400 w-5';
        }
    }
}

// Carrusel de proyectos
function initProjectCarousel() {
    const carousel = document.getElementById('project-carousel');
    const prevButton = document.getElementById('prev-project');
    const nextButton = document.getElementById('next-project');
    const indicators = document.querySelectorAll('.project-indicator');
    
    if (!carousel || !prevButton || !nextButton || indicators.length === 0) return;
    
    const slides = document.querySelectorAll('.carousel-slide');
    const totalSlides = slides.length;
    
    // Función para obtener el ancho del slide de forma eficiente
    function getSlideWidth() {
        if (!slideWidth && slides.length > 0) {
            slideWidth = slides[0].clientWidth;
        }
        return slideWidth;
    }
    
    function updateCarousel() {
        if (!carousel || slides.length === 0) return;
        
        const width = getSlideWidth();
        carousel.style.transform = `translateX(-${currentSlide * width}px)`;
        
        // Actualizar indicadores
        requestAnimationFrame(() => {
            indicators.forEach((indicator, index) => {
                if (index === currentSlide) {
                    indicator.classList.add('bg-primary-500', 'dark:bg-primary-400');
                    indicator.classList.remove('bg-primary-300', 'dark:bg-primary-700');
                    indicator.setAttribute('aria-current', 'true');
                    indicator.setAttribute('aria-label', `Proyecto ${index + 1} seleccionado`);
                } else {
                    indicator.classList.remove('bg-primary-500', 'dark:bg-primary-400');
                    indicator.classList.add('bg-primary-300', 'dark:bg-primary-700');
                    indicator.setAttribute('aria-current', 'false');
                    indicator.setAttribute('aria-label', `Ir al proyecto ${index + 1}`);
                }
            });
            
            // Actualizar controles
            prevButton.setAttribute('aria-label', `Proyecto anterior, actualmente proyecto ${currentSlide + 1}`);
            nextButton.setAttribute('aria-label', `Siguiente proyecto, actualmente proyecto ${currentSlide + 1}`);
            
            // Anunciar cambio para screen readers
            if (totalSlides > 0 && typeof window.announceToScreenReader === 'function') {
                const currentProject = slides[currentSlide].querySelector('h3');
                if (currentProject) {
                    window.announceToScreenReader(`Proyecto ${currentSlide + 1} de ${totalSlides}: ${currentProject.textContent}`);
                }
            }
        });
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateCarousel();
    }
    
    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateCarousel();
    }
    
    function goToSlide(index) {
        if (index >= 0 && index < totalSlides) {
            currentSlide = index;
            updateCarousel();
            resetCarouselInterval();
        }
    }
    
    // Configurar eventos
    prevButton.addEventListener('click', () => {
        prevSlide();
        resetCarouselInterval();
    });
    
    nextButton.addEventListener('click', () => {
        nextSlide();
        resetCarouselInterval();
    });
    
    // Configurar indicadores
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            goToSlide(index);
        });
        
        // Añadir soporte para teclado
        indicator.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                goToSlide(index);
            }
        });
    });
    
    // Auto-avance del carrusel
    function startCarouselInterval() {
        carouselInterval = setInterval(nextSlide, 8000);
    }
    
    function resetCarouselInterval() {
        clearInterval(carouselInterval);
        startCarouselInterval();
    }
    
    function stopCarouselInterval() {
        clearInterval(carouselInterval);
    }
    
    // Pausar carrusel al interactuar
    carousel.addEventListener('mouseenter', stopCarouselInterval);
    carousel.addEventListener('mouseleave', startCarouselInterval);
    carousel.addEventListener('touchstart', stopCarouselInterval);
    carousel.addEventListener('touchend', () => {
        setTimeout(startCarouselInterval, 5000);
    });
    
    // Navegación con teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevSlide();
            resetCarouselInterval();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextSlide();
            resetCarouselInterval();
        }
    });
    
    // Inicializar carrusel
    requestAnimationFrame(() => {
        updateCarousel();
        startCarouselInterval();
    });
    
    // Ajustar carrusel en resize con debounce
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            slideWidth = 0;
            requestAnimationFrame(updateCarousel);
        }, 150);
    });
}

// Función para obtener altura del header de forma eficiente
function getHeaderHeight() {
    if (!cachedHeaderHeight) {
        const header = document.querySelector('header');
        if (header) {
            cachedHeaderHeight = header.clientHeight;
        }
    }
    return cachedHeaderHeight;
}

// Navegación suave mejorada
function initSmoothNavigation() {
    // Cachear altura del header una vez al cargar
    cachedHeaderHeight = getHeaderHeight();
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(href);
            
            if (targetElement) {
                const headerHeight = cachedHeaderHeight;
                const targetRect = targetElement.getBoundingClientRect();
                const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
                const targetPosition = currentScroll + targetRect.top - headerHeight;
                
                // Cerrar menú móvil si está abierto
                const mobileMenu = document.getElementById('mobile-menu');
                const mobileMenuButton = document.getElementById('mobile-menu-button');
                if (mobileMenu && mobileMenuButton.getAttribute('aria-expanded') === 'true') {
                    mobileMenu.classList.remove('translate-y-0', 'opacity-100', 'visible');
                    mobileMenu.classList.add('-translate-y-2', 'opacity-0', 'invisible');
                    mobileMenuButton.setAttribute('aria-expanded', 'false');
                    mobileMenuButton.innerHTML = '<i class="icon-align-justify text-2xl"></i>';
                    document.body.classList.remove('overflow-hidden');
                }
                
                requestAnimationFrame(() => {
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                });
                
                if (href !== window.location.hash) {
                    requestAnimationFrame(() => {
                        history.pushState(null, null, href);
                    });
                }
                
                // Anunciar navegación para screen readers
                if (typeof window.announceToScreenReader === 'function') {
                    const sectionName = targetElement.querySelector('h2, h3')?.textContent || targetElement.id;
                    window.announceToScreenReader(`Navegando a ${sectionName}`);
                }
            }
        });
    });
    
    // Actualizar cache en resize
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            cachedHeaderHeight = 0;
            getHeaderHeight();
        }, 250);
    });
}

// Animaciones al hacer scroll
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                requestAnimationFrame(() => {
                    entry.target.classList.add('animate-fade-in');
                    observer.unobserve(entry.target);
                });
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    });
    
    requestAnimationFrame(() => {
        document.querySelectorAll('.skill-card, .card-hover, .animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    });
}

// Sistema de Toast Notifications
window.toastQueue = [];
window.isShowingToast = false;

window.showToast = function(message, type = 'info', duration = 5000) {
    window.toastQueue.push({
        message,
        type,
        duration,
        id: Date.now()
    });
    processToastQueue();
};

function processToastQueue() {
    if (window.isShowingToast || window.toastQueue.length === 0) return;
    
    window.isShowingToast = true;
    const toast = window.toastQueue.shift();
    createToastElement(toast);
}

function createToastElement(toast) {
    requestAnimationFrame(() => {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            container.setAttribute('role', 'region');
            container.setAttribute('aria-live', 'polite');
            container.setAttribute('aria-atomic', 'true');
            document.body.appendChild(container);
        }
        
        const toastElement = document.createElement('div');
        toastElement.className = `toast toast-${toast.type}`;
        toastElement.setAttribute('role', 'alert');
        toastElement.setAttribute('aria-live', 'assertive');
        toastElement.setAttribute('aria-atomic', 'true');
        toastElement.setAttribute('aria-label', `Notificación: ${toast.message}`);
        
        let icon = 'info-circle';
        let ariaLabel = 'Información';
        if (toast.type === 'success') {
            icon = 'ok';
            ariaLabel = 'Éxito';
        }
        if (toast.type === 'error') {
            icon = 'info';
            ariaLabel = 'Error';
        }
        
        toastElement.innerHTML = `
            <i class="icon-${icon}" aria-hidden="true" aria-label="${ariaLabel}"></i>
            <span class="toast-message">${toast.message}</span>
            <button class="toast-close" aria-label="Cerrar notificación">
                <i class="icon-cancel" aria-hidden="true"></i>
            </button>
        `;
        
        container.appendChild(toastElement);
        
        setTimeout(() => {
            requestAnimationFrame(() => {
                toastElement.classList.add('toast-visible');
            });
        }, 10);
        
        const closeBtn = toastElement.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => removeToast(toastElement));
        
        const autoRemove = setTimeout(() => removeToast(toastElement), toast.duration);
        
        toastElement.addEventListener('mouseenter', () => clearTimeout(autoRemove));
        toastElement.addEventListener('mouseleave', () => {
            setTimeout(() => removeToast(toastElement), toast.duration);
        });
        
        // Añadir soporte para teclado
        closeBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                removeToast(toastElement);
            }
        });
    });
}

function removeToast(toastElement) {
    if (!toastElement) return;
    
    requestAnimationFrame(() => {
        toastElement.classList.remove('toast-visible');
        toastElement.classList.add('toast-exiting');
        
        setTimeout(() => {
            requestAnimationFrame(() => {
                if (toastElement.parentNode) {
                    toastElement.parentNode.removeChild(toastElement);
                }
                window.isShowingToast = false;
                processToastQueue();
            });
        }, 300);
    });
}

// Función para anunciar a screen readers
window.announceToScreenReader = function(message, priority = 'polite') {
    requestAnimationFrame(() => {
        // Limpiar anuncios anteriores
        const existingAnnouncements = document.querySelectorAll('.sr-announcement');
        existingAnnouncements.forEach(el => {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });
        
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', priority);
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-announcement sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            requestAnimationFrame(() => {
                if (announcement.parentNode) {
                    announcement.parentNode.removeChild(announcement);
                }
            });
        }, 1000);
    });
};

// Manejo de descarga de CV
function initCVDownload() {
    const cvLink = document.querySelector('a[href*="CV_Aldair_Sarmiento.pdf"]');
    
    if (cvLink) {
        cvLink.addEventListener('click', function(e) {
            // Verificar si el enlace es válido
            const href = this.getAttribute('href');
            if (!href || href === '#') {
                e.preventDefault();
                if (typeof window.showToast === 'function') {
                    window.showToast('El archivo del CV no está disponible', 'error', 3000);
                }
                return;
            }
            
            setTimeout(() => {
                if (typeof window.showToast === 'function') {
                    window.showToast('CV descargado exitosamente', 'success', 3000);
                }
                
                if (typeof window.announceToScreenReader === 'function') {
                    window.announceToScreenReader('Currículum descargado exitosamente');
                }
            }, 500);
        });
    }
}

// Efecto de scroll para botón de WhatsApp
function initWhatsAppButton() {
    const hero = document.getElementById('inicio');
    const whatsappBtn = document.getElementById('whatsapp-btn');
    
    if (!hero || !whatsappBtn) return;
    
    const observer = new IntersectionObserver(
        ([entry]) => {
            requestAnimationFrame(() => {
                if (!entry.isIntersecting) {
                    whatsappBtn.classList.remove('opacity-0', 'invisible');
                    whatsappBtn.classList.add('opacity-100');
                } else {
                    whatsappBtn.classList.add('opacity-0', 'invisible');
                    whatsappBtn.classList.remove('opacity-100');
                }
            });
        },
        { threshold: 0.1 }
    );

    observer.observe(hero);
}

// Preload de imágenes críticas
function initImageLoading() {
    window.addEventListener('load', () => {
        requestAnimationFrame(() => {
            document.querySelectorAll('img').forEach(img => {
                img.classList.add('loaded');
            });
        });
    });
}

// Optimización de carga
function optimizeLoading() {
    // Ajustar tema antes de que la página sea visible
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
    }
}

// Inicializar todo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    try {
        optimizeLoading();
        initMobileMenu(); // ¡ESTA ES LA FUNCIÓN CORREGIDA!
        initThemeToggle();
        initProjectCarousel();
        initSmoothNavigation();
        initScrollAnimations();
        initCVDownload();
        initWhatsAppButton();
        initImageLoading();
        
        console.log('Portafolio inicializado correctamente');
        
        // Añadir clase para indicar que JavaScript está activo
        document.body.classList.add('js-enabled');
        
        // Manejar errores no capturados
        window.addEventListener('error', (event) => {
            console.error('Error no capturado:', event.error);
            if (typeof window.showToast === 'function') {
                window.showToast('Ocurrió un error inesperado. Por favor, recarga la página.', 'error', 5000);
            }
        });
        
        // Asegurar que el menú móvil esté correctamente inicializado
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        if (mobileMenu && mobileMenuButton) {
            // Estado inicial correcto
            mobileMenu.classList.add('-translate-y-2', 'opacity-0', 'invisible');
            mobileMenu.classList.remove('translate-y-0', 'opacity-100', 'visible');
            mobileMenuButton.setAttribute('aria-expanded', 'false');
            mobileMenuButton.setAttribute('aria-label', 'Abrir menú móvil');
        }
        
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        // Asegurar que el menú móvil esté cerrado si hay error
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        if (mobileMenu && mobileMenuButton) {
            mobileMenu.classList.add('-translate-y-2', 'opacity-0', 'invisible');
            mobileMenu.classList.remove('translate-y-0', 'opacity-100', 'visible');
            mobileMenuButton.setAttribute('aria-expanded', 'false');
            mobileMenuButton.innerHTML = '<i class="icon-align-justify text-2xl"></i>';
        }
    }
});

// Manejar la carga de la página
window.addEventListener('load', function() {
    setTimeout(function() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.transition = 'opacity 0.5s ease';
            loading.style.opacity = '0';
            
            setTimeout(() => {
                loading.style.display = 'none';
                // Mostrar animaciones gradualmente
                document.body.classList.add('loaded');
                if (typeof window.announceToScreenReader === 'function') {
                    window.announceToScreenReader('Portafolio cargado completamente');
                }
            }, 500);
        }
    }, 500);
});

// Añadir estilos para SR-only si no existen
if (!document.querySelector('#sr-only-styles')) {
    const style = document.createElement('style');
    style.id = 'sr-only-styles';
    style.textContent = `
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
        
        .sr-announcement {
            position: absolute;
            left: -10000px;
            top: auto;
            width: 1px;
            height: 1px;
            overflow: hidden;
        }
        
        /* Asegurar que el menú móvil tenga el z-index correcto */
        #mobile-menu {
            z-index: 9999 !important;
        }
    `;
    document.head.appendChild(style);
}