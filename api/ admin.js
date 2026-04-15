// api/admin.js
const { Octokit } = require('@octokit/rest');
const yaml = require('js-yaml');

// Configuración desde variables de entorno
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const API_KEY = process.env.API_KEY;
const OWNER = 'thegoatzzbad02-blip';
const REPO = 'PAGINApRUEBA';
const BRANCH = 'main';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

// ---------- Funciones de GitHub ----------
async function getFileContent(path) {
  const { data } = await octokit.repos.getContent({
    owner: OWNER,
    repo: REPO,
    path,
    ref: BRANCH
  });
  const content = Buffer.from(data.content, 'base64').toString('utf-8');
  return { content, sha: data.sha };
}

async function updateFileContent(path, content, message, sha = null) {
  const body = {
    message,
    content: Buffer.from(content, 'utf-8').toString('base64'),
    branch: BRANCH
  };
  if (sha) body.sha = sha;
  const { data } = await octokit.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path,
    ...body
  });
  return data;
}

async function deleteFile(path, sha, message) {
  await octokit.repos.deleteFile({
    owner: OWNER,
    repo: REPO,
    path,
    message,
    sha,
    branch: BRANCH
  });
}

async function listNoticias() {
  try {
    const { data } = await octokit.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path: '_posts/noticias',
      ref: BRANCH
    });
    return data
      .filter(f => f.name.endsWith('.md'))
      .map(f => ({ name: f.name, sha: f.sha, download_url: f.download_url }));
  } catch {
    return [];
  }
}

async function getNoticia(slug) {
  const path = `_posts/noticias/${slug}.md`;
  const { content, sha } = await getFileContent(path);
  return { content, sha };
}

async function createNoticia(filename, content, message) {
  const path = `_posts/noticias/${filename}`;
  await updateFileContent(path, content, message);
}

async function updateNoticia(filename, content, sha, message) {
  const path = `_posts/noticias/${filename}`;
  await updateFileContent(path, content, message, sha);
}

async function deleteNoticia(filename, sha) {
  const path = `_posts/noticias/${filename}`;
  await deleteFile(path, sha, `Eliminar ${filename}`);
}

async function getYaml(filepath) {
  return getFileContent(filepath);
}

async function updateYaml(filepath, content, message, sha = null) {
  await updateFileContent(filepath, content, message, sha);
}

// ---------- Manejador principal ----------
export default async function handler(req, res) {
  // Verificar API Key
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== API_KEY) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  if (req.method === 'GET') {
    // GET devuelve lista de noticias (para carga inicial)
    const noticias = await listNoticias();
    return res.status(200).json(noticias);
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { action, ...data } = req.body;

  try {
    let result;
    switch (action) {
      case 'list_noticias':
        result = await listNoticias();
        break;
      case 'get_noticia':
        result = await getNoticia(data.slug);
        break;
      case 'create_noticia':
        await createNoticia(data.filename, data.content, data.message);
        result = { success: true };
        break;
      case 'update_noticia':
        await updateNoticia(data.filename, data.content, data.sha, data.message);
        result = { success: true };
        break;
      case 'delete_noticia':
        await deleteNoticia(data.filename, data.sha);
        result = { success: true };
        break;
      case 'get_emprendedores':
        result = await getYaml('_data/emprendedores.yml');
        break;
      case 'update_emprendedores':
        await updateYaml('_data/emprendedores.yml', data.content, data.message, data.sha);
        result = { success: true };
        break;
      case 'get_alertas':
        result = await getYaml('_data/alertas.yml');
        break;
      case 'update_alertas':
        await updateYaml('_data/alertas.yml', data.content, data.message, data.sha);
        result = { success: true };
        break;
      case 'get_eventos':
        result = await getYaml('_data/eventos.yml');
        break;
      case 'update_eventos':
        await updateYaml('_data/eventos.yml', data.content, data.message, data.sha);
        result = { success: true };
        break;
      case 'get_servicios':
        result = await getYaml('_data/servicios.yml');
        break;
      case 'update_servicios':
        await updateYaml('_data/servicios.yml', data.content, data.message, data.sha);
        result = { success: true };
        break;
      case 'get_configuracion':
        result = await getYaml('_data/configuracion.yml');
        break;
      case 'update_configuracion':
        await updateYaml('_data/configuracion.yml', data.content, data.message, data.sha);
        result = { success: true };
        break;
      default:
        return res.status(400).json({ error: `Acción desconocida: ${action}` });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}