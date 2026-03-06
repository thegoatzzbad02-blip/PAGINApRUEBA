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

// ===== FUNCIONALIDAD PARA COMPARTIR NOTICIAS =====
(function() {
    // Obtener la URL actual de la página
    const currentUrl = window.location.href;
    const pageTitle = document.title || 'Noticia de Villa Rosario';
    
    // Configurar enlaces de compartir
    const wspBtn = document.getElementById('share-wsp');
    const fbBtn = document.getElementById('share-fb');
    const twBtn = document.getElementById('share-tw');
    const copyBtn = document.getElementById('copy-link');
    const copyMessage = document.getElementById('copyMessage');
    
    // WhatsApp
    if (wspBtn) {
        wspBtn.href = `https://wa.me/?text=${encodeURIComponent(pageTitle + ' ' + currentUrl)}`;
    }
    
    // Facebook
    if (fbBtn) {
        fbBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    }
    
    // Twitter
    if (twBtn) {
        twBtn.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(pageTitle)}&url=${encodeURIComponent(currentUrl)}`;
    }
    
    // Copiar enlace
    if (copyBtn) {
        copyBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Crear un elemento temporal para copiar
            const tempInput = document.createElement('input');
            tempInput.value = currentUrl;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            
            // Mostrar mensaje de éxito
            if (copyMessage) {
                copyMessage.classList.add('show');
                setTimeout(() => {
                    copyMessage.classList.remove('show');
                }, 2000);
            }
        });
    }
})();
// ===== MODAL DE ANUNCIO IMPORTANTE =====
(function() {
    const modal = document.getElementById('anuncioModal');
    const cerrarBtn = document.getElementById('cerrarModal');
    const contadorSpan = document.getElementById('contador');
    
    // Si no existe el modal, salir
    if (!modal) return;

    // Variable para controlar el intervalo
    let intervalo;
    let segundos = 7; // Duración del contador

    // Función para mostrar el modal (solo si no se ha mostrado en esta sesión)
    function mostrarModal() {
        // Comprobar si ya se mostró antes en esta sesión
        
    

        modal.classList.add('mostrar');
        sessionStorage.setItem('anuncioMostrado', 'true');

        // Actualizar contador cada segundo
        intervalo = setInterval(() => {
            segundos--;
            if (contadorSpan) {
                contadorSpan.textContent = segundos;
            }
            if (segundos <= 0) {
                clearInterval(intervalo);
                cerrarModal();
            }
        }, 1000);
    }

    // Función para cerrar el modal
    function cerrarModal() {
        modal.classList.remove('mostrar');
        if (intervalo) {
            clearInterval(intervalo);
        }
    }

    // Evento para cerrar con el botón
    if (cerrarBtn) {
        cerrarBtn.addEventListener('click', cerrarModal);
    }

    // Evento para cerrar haciendo clic fuera del contenido
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            cerrarModal();
        }
    });

    // Mostrar el modal cuando la página haya cargado completamente
    window.addEventListener('load', mostrarModal);
})();