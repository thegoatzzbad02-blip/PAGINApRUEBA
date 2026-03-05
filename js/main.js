// js/main.js

// Menú móvil: el funcionamiento ya está dado por el CSS (checkbox)
// Podemos agregar un cierre automático al hacer clic en un enlace (opcional)

document.addEventListener('DOMContentLoaded', function() {
    // Cerrar menú al hacer clic en un enlace (para móviles)
    const navLinks = document.querySelectorAll('.nav-menu a');
    const menuToggle = document.getElementById('menu-toggle');
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (menuToggle && menuToggle.checked) {
                menuToggle.checked = false;
            }
        });
    });

    // Aquí más adelante se cargarán los datos dinámicos (noticias, etc.)
    console.log('Página cargada. Lista para integrar CMS.');
});

// js/main.js - Carrusel de imágenes

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del carrusel
    const slides = document.querySelectorAll('.carrusel-slide');
    const prevBtn = document.querySelector('.carrusel-prev');
    const nextBtn = document.querySelector('.carrusel-next');
    const indicators = document.querySelectorAll('.indicador');
    let currentSlide = 0;
    let slideInterval;

    // Función para mostrar un slide específico
    function showSlide(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;

        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(ind => ind.classList.remove('active'));

        slides[index].classList.add('active');
        indicators[index].classList.add('active');

        currentSlide = index;
    }

    // Siguiente slide
    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    // Anterior slide
    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    // Iniciar autoplay (cada 5 segundos)
    function startAutoPlay() {
        slideInterval = setInterval(nextSlide, 5000);
    }

    // Detener autoplay
    function stopAutoPlay() {
        clearInterval(slideInterval);
    }

    // Event listeners para botones
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            stopAutoPlay();
            prevSlide();
            startAutoPlay();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            stopAutoPlay();
            nextSlide();
            startAutoPlay();
        });
    }

    // Event listeners para indicadores
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', function() {
            stopAutoPlay();
            showSlide(index);
            startAutoPlay();
        });
    });

    // Iniciar autoplay
    if (slides.length > 0) {
        startAutoPlay();
    }
});