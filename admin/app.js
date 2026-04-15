// admin/app.js
let apiKey = '';

document.getElementById('loginBtn').addEventListener('click', async () => {
    const key = document.getElementById('apiKeyInput').value.trim();
    if (!key) {
        alert('Ingrese la clave API');
        return;
    }
    apiKey = key;

    const loginBtn = document.getElementById('loginBtn');
    const originalText = loginBtn.innerText;
    loginBtn.innerText = 'Verificando...';
    loginBtn.disabled = true;

    try {
        const res = await fetch('/api/admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            body: JSON.stringify({ action: 'list_noticias' })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Clave incorrecta');
        }
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminContent').style.display = 'block';
        loadInitialData();
    } catch (err) {
        alert('Error de acceso: ' + err.message);
        console.error(err);
    } finally {
        loginBtn.innerText = originalText;
        loginBtn.disabled = false;
    }
});

async function apiCall(action, data = {}) {
    const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
        },
        body: JSON.stringify({ action, ...data })
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error en la petición');
    }
    return res.json();
}

// ---------- Noticias ----------
let currentNoticia = null;

async function loadNoticias() {
    const noticias = await apiCall('list_noticias');
    const container = document.getElementById('noticiasList');
    container.innerHTML = '';
    for (const n of noticias) {
        const div = document.createElement('div');
        div.className = 'noticia-item';
        div.innerHTML = `
            <span><strong>${n.name}</strong></span>
            <span>
                <button class="editNoticia" data-file="${n.name}" data-sha="${n.sha}">✏️ Editar</button>
                <button class="deleteNoticia" data-file="${n.name}" data-sha="${n.sha}">🗑️ Eliminar</button>
            </span>
        `;
        container.appendChild(div);
    }
    document.querySelectorAll('.editNoticia').forEach(btn => {
        btn.addEventListener('click', async () => {
            const slug = btn.dataset.file.replace('.md', '');
            const data = await apiCall('get_noticia', { slug });
            const content = data.content;
            const match = content.match(/---\n([\s\S]*?)\n---\n([\s\S]*)/);
            if (match) {
                const front = match[1];
                const body = match[2];
                const titleMatch = front.match(/title: "?(.*?)"?\n/);
                const dateMatch = front.match(/date: "?(.*?)"?\n/);
                const catMatch = front.match(/categoria: "?(.*?)"?\n/);
                const imgMatch = front.match(/imagen: "?(.*?)"?\n/);
                const resMatch = front.match(/resumen: "?(.*?)"?\n/);
                document.getElementById('noticiaTitulo').value = titleMatch ? titleMatch[1] : '';
                document.getElementById('noticiaFecha').value = dateMatch ? dateMatch[1] : '';
                document.getElementById('noticiaCategoria').value = catMatch ? catMatch[1] : '';
                document.getElementById('noticiaImagen').value = imgMatch ? imgMatch[1] : '';
                document.getElementById('noticiaResumen').value = resMatch ? resMatch[1] : '';
                document.getElementById('noticiaContenido').value = body.trim();
            } else {
                document.getElementById('noticiaContenido').value = content;
            }
            currentNoticia = { filename: btn.dataset.file, sha: btn.dataset.sha };
            document.getElementById('noticiaEditor').style.display = 'block';
        });
    });
    document.querySelectorAll('.deleteNoticia').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (confirm('¿Eliminar esta noticia?')) {
                await apiCall('delete_noticia', { filename: btn.dataset.file, sha: btn.dataset.sha });
                loadNoticias();
            }
        });
    });
}

document.getElementById('newNoticiaBtn').addEventListener('click', () => {
    currentNoticia = null;
    document.getElementById('noticiaEditor').style.display = 'block';
    document.getElementById('noticiaTitulo').value = '';
    document.getElementById('noticiaFecha').value = new Date().toISOString();
    document.getElementById('noticiaCategoria').value = '';
    document.getElementById('noticiaImagen').value = '';
    document.getElementById('noticiaResumen').value = '';
    document.getElementById('noticiaContenido').value = '';
});

document.getElementById('saveNoticiaBtn').addEventListener('click', async () => {
    const titulo = document.getElementById('noticiaTitulo').value;
    const fecha = document.getElementById('noticiaFecha').value;
    const categoria = document.getElementById('noticiaCategoria').value;
    const imagen = document.getElementById('noticiaImagen').value;
    const resumen = document.getElementById('noticiaResumen').value;
    const contenido = document.getElementById('noticiaContenido').value;
    if (!titulo || !fecha || !contenido) {
        alert('Título, fecha y contenido son obligatorios');
        return;
    }
    const frontmatter = `---\ntitle: "${titulo}"\ndate: "${fecha}"\ncategoria: "${categoria}"\nimagen: "${imagen}"\nresumen: "${resumen}"\n---\n\n${contenido}`;
    const filename = `${fecha.split('T')[0]}-${slugify(titulo)}.md`;
    if (currentNoticia) {
        await apiCall('update_noticia', { filename: currentNoticia.filename, content: frontmatter, sha: currentNoticia.sha, message: `Actualizar ${titulo}` });
    } else {
        await apiCall('create_noticia', { filename, content: frontmatter, message: `Crear ${titulo}` });
    }
    document.getElementById('noticiaEditor').style.display = 'none';
    loadNoticias();
});

document.getElementById('cancelNoticiaBtn').addEventListener('click', () => {
    document.getElementById('noticiaEditor').style.display = 'none';
});

function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ---------- YAML helpers ----------
async function loadYamlEditor(editorId, actionGet, actionUpdate, shaVar) {
    const data = await apiCall(actionGet);
    document.getElementById(editorId).value = data.content;
    window[shaVar] = data.sha;
}

function setupYamlSave(btnId, editorId, actionUpdate, actionGet, shaVar) {
    document.getElementById(btnId).addEventListener('click', async () => {
        const content = document.getElementById(editorId).value;
        await apiCall(actionUpdate, { content, sha: window[shaVar], message: `Actualizar ${actionUpdate}` });
        alert('Guardado correctamente');
        const data = await apiCall(actionGet);
        window[shaVar] = data.sha;
    });
}

// ---------- Inicialización ----------
async function loadInitialData() {
    await loadNoticias();
    await loadYamlEditor('emprendedoresEditor', 'get_emprendedores', 'update_emprendedores', 'emprendedoresSha');
    setupYamlSave('saveEmprendedoresBtn', 'emprendedoresEditor', 'update_emprendedores', 'get_emprendedores', 'emprendedoresSha');
    await loadYamlEditor('alertasEditor', 'get_alertas', 'update_alertas', 'alertasSha');
    setupYamlSave('saveAlertasBtn', 'alertasEditor', 'update_alertas', 'get_alertas', 'alertasSha');
    await loadYamlEditor('eventosEditor', 'get_eventos', 'update_eventos', 'eventosSha');
    setupYamlSave('saveEventosBtn', 'eventosEditor', 'update_eventos', 'get_eventos', 'eventosSha');
    await loadYamlEditor('serviciosEditor', 'get_servicios', 'update_servicios', 'serviciosSha');
    setupYamlSave('saveServiciosBtn', 'serviciosEditor', 'update_servicios', 'get_servicios', 'serviciosSha');
    await loadYamlEditor('configuracionEditor', 'get_configuracion', 'update_configuracion', 'configuracionSha');
    setupYamlSave('saveConfiguracionBtn', 'configuracionEditor', 'update_configuracion', 'get_configuracion', 'configuracionSha');
}

// Tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tabId = btn.dataset.tab;
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(`tab-${tabId}`).classList.add('active');
    });
});