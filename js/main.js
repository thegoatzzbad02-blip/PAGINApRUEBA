// ==================== LIBRERÍAS ====================
// Asegúrate de incluir en cada HTML:
// <script src="https://cdn.jsdelivr.net/npm/js-yaml@4/dist/js-yaml.min.js"></script>
// <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>

// ==================== FUNCIONES DE CARGA ====================

async function cargarConfiguracion() {
    try {
        const res = await fetch('/_data/configuracion.yml');
        if (!res.ok) throw new Error('No se pudo cargar configuración');
        const texto = await res.text();
        const data = jsyaml.load(texto);
        // Actualizar elementos (ajusta los IDs según tu HTML)
        const telefonoElem = document.getElementById('telefono-contacto');
        if (telefonoElem) telefonoElem.innerText = data.telefono || 'No disponible';
        const emailElem = document.getElementById('email-contacto');
        if (emailElem) emailElem.innerText = data.email || 'No disponible';
        const direccionElem = document.getElementById('direccion-contacto');
        if (direccionElem) direccionElem.innerText = data.direccion || 'No disponible';
        const horarioElem = document.getElementById('horario-atencion');
        if (horarioElem) horarioElem.innerText = data.horario || 'No disponible';
        const wspLink = document.getElementById('whatsapp-group-link');
        if (wspLink && data.whatsapp_url) wspLink.href = data.whatsapp_url;
    } catch (error) {
        console.error('Error cargando configuración:', error);
    }
}

async function cargarEmprendedores() {
    try {
        const res = await fetch('/_data/emprendedores.yml');
        if (!res.ok) throw new Error('No se pudo cargar emprendedores');
        const texto = await res.text();
        const data = jsyaml.load(texto);
        const emprendedores = data.emprendedores || [];
        const contenedor = document.querySelector('.emprendedores-grid');
        if (!contenedor) return;
        let html = '';
        emprendedores.forEach(emp => {
            html += `
                <div class="emprendedor-card">
                    <div class="emprendedor-imagen">
                        <img src="${emp.imagen || 'img/default.jpg'}" alt="${emp.nombre}" loading="lazy">
                    </div>
                    <div class="emprendedor-info">
                        <h3>${escapeHtml(emp.nombre)}</h3>
                        <p class="emprendedor-descripcion">${escapeHtml(emp.descripcion)}</p>
                        <div class="emprendedor-contacto">
                            ${emp.telefono ? `<p><i class="fas fa-phone"></i> ${emp.telefono}</p>` : ''}
                            ${emp.whatsapp ? `<p><i class="fab fa-whatsapp"></i> ${emp.whatsapp}</p>` : ''}
                            ${emp.instagram ? `<p><i class="fab fa-instagram"></i> ${emp.instagram}</p>` : ''}
                            ${emp.facebook ? `<p><i class="fab fa-facebook"></i> ${emp.facebook}</p>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        contenedor.innerHTML = html;
    } catch (error) {
        console.error('Error cargando emprendedores:', error);
        document.querySelector('.emprendedores-grid').innerHTML = '<p>Error al cargar emprendedores.</p>';
    }
}

async function cargarNoticias() {
    // Implementación similar (usa GitHub API o lee los archivos .md)
    console.log('Función cargarNoticias - pendiente de implementar');
}

async function cargarAlertas() {
    try {
        const res = await fetch('/_data/alertas.yml');
        if (!res.ok) throw new Error('No se pudieron cargar alertas');
        const texto = await res.text();
        const data = jsyaml.load(texto);
        const alertas = data.alertas || [];
        const contenedor = document.querySelector('.alertas-grid');
        if (!contenedor) return;
        let html = '';
        alertas.forEach(alerta => {
            let clase = '';
            let icono = '';
            if (alerta.tipo === 'urgente') { clase = 'alerta-urgente'; icono = 'fa-exclamation-triangle'; }
            else if (alerta.tipo === 'info') { clase = 'alerta-info'; icono = 'fa-info-circle'; }
            else { clase = 'alerta-evento'; icono = 'fa-calendar-check'; }
            html += `
                <div class="alerta-item ${clase}">
                    <div class="alerta-icon"><i class="fas ${icono}"></i></div>
                    <div class="alerta-content">
                        <h3>${escapeHtml(alerta.titulo)}</h3>
                        <p>${escapeHtml(alerta.descripcion)}</p>
                        <span class="alerta-fecha"><i class="far fa-calendar"></i> ${new Date(alerta.fecha).toLocaleDateString()}</span>
                    </div>
                </div>
            `;
        });
        contenedor.innerHTML = html;
    } catch (error) {
        console.error('Error cargando alertas:', error);
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ==================== INICIALIZACIÓN GENERAL ====================
document.addEventListener('DOMContentLoaded', async () => {
    // Siempre cargar configuración (teléfonos, dirección, etc.)
    cargarConfiguracion();

    // 1. Emprendedores (si existe .emprendedores-grid)
    if (document.querySelector('.emprendedores-grid')) {
        cargarEmprendedores();
    }

    // 2. Alertas (si existe .alertas-grid)
    if (document.querySelector('.alertas-grid')) {
        cargarAlertas();
    }

    // 3. Noticias en el index (si existe #lista-noticias-index)
    if (document.getElementById('lista-noticias-index')) {
        // Asegúrate de tener esta función definida
        if (typeof mostrarUltimasNoticias === 'function') {
            mostrarUltimasNoticias();
        } else {
            console.warn('mostrarUltimasNoticias no está definida');
        }
    }

    // 4. Listado completo de noticias (si existe #lista-noticias-completa)
    if (document.getElementById('lista-noticias-completa')) {
        if (typeof cargarTodasNoticias === 'function') {
            cargarTodasNoticias();
        } else {
            console.warn('cargarTodasNoticias no está definida');
        }
    }

    // 5. Eventos (si existe #lista-eventos-index)
    if (document.getElementById('lista-eventos-index')) {
        if (typeof cargarEventos === 'function') {
            cargarEventos();
        } else {
            console.warn('cargarEventos no está definida');
        }
    }

    // 6. Servicios públicos (si existe .servicios-estado)
    if (document.querySelector('.servicios-estado')) {
        if (typeof cargarServicios === 'function') {
            cargarServicios();
        } else {
            console.warn('cargarServicios no está definida');
        }
    }

    // 7. Noticia individual (si existe #noticia-completa)
    if (document.getElementById('noticia-completa')) {
        if (typeof cargarNoticiaIndividual === 'function') {
            cargarNoticiaIndividual();
        } else {
            console.warn('cargarNoticiaIndividual no está definida');
        }
    }
});