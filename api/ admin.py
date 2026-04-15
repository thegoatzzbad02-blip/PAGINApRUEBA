# api/admin.py
# Panel de administración en Python para Vercel
# Maneja CRUD de noticias, emprendedores, alertas, eventos, servicios y configuración

import os
import json
import re
import base64
import requests
from datetime import datetime

# ---------- Configuración ----------
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN')
API_KEY = os.environ.get('API_KEY')
OWNER = 'thegoatzzbad02-blip'    # ← Cambia por tu usuario
REPO = 'PAGINApRUEBA'            # ← Cambia por tu repositorio
BRANCH = 'main'

# ---------- Funciones auxiliares de GitHub API ----------
def github_request(method, url, data=None):
    """Realiza una petición a la API de GitHub con autenticación"""
    headers = {
        'Authorization': f'Bearer {GITHUB_TOKEN}',
        'Accept': 'application/vnd.github.v3+json'
    }
    if data:
        headers['Content-Type'] = 'application/json'
        data = json.dumps(data)
    resp = requests.request(method, url, headers=headers, data=data)
    if not resp.ok:
        raise Exception(f"GitHub API error: {resp.status_code} - {resp.text}")
    return resp.json()

def get_file_content(path):
    """Obtiene contenido y SHA de un archivo del repositorio"""
    url = f'https://api.github.com/repos/{OWNER}/{REPO}/contents/{path}'
    data = github_request('GET', url)
    content = base64.b64decode(data['content']).decode('utf-8')
    return content, data['sha']

def update_file_content(path, content, commit_message, sha=None):
    """Crea o actualiza un archivo en el repositorio"""
    url = f'https://api.github.com/repos/{OWNER}/{REPO}/contents/{path}'
    payload = {
        'message': commit_message,
        'content': base64.b64encode(content.encode('utf-8')).decode('utf-8'),
        'branch': BRANCH
    }
    if sha:
        payload['sha'] = sha
    return github_request('PUT', url, payload)

def delete_file(path, sha, commit_message):
    """Elimina un archivo del repositorio"""
    url = f'https://api.github.com/repos/{OWNER}/{REPO}/contents/{path}'
    payload = {
        'message': commit_message,
        'sha': sha,
        'branch': BRANCH
    }
    return github_request('DELETE', url, payload)

def list_noticias():
    """Devuelve lista de archivos .md en _posts/noticias"""
    url = f'https://api.github.com/repos/{OWNER}/{REPO}/contents/_posts/noticias'
    try:
        data = github_request('GET', url)
        files = [{'name': f['name'], 'sha': f['sha'], 'download_url': f['download_url']} 
                 for f in data if f['name'].endswith('.md')]
        return files
    except:
        return []

def get_noticia(slug):
    """Obtiene contenido de una noticia específica"""
    path = f'_posts/noticias/{slug}.md'
    content, sha = get_file_content(path)
    return {'content': content, 'sha': sha}

def create_noticia(filename, content, commit_msg):
    path = f'_posts/noticias/{filename}'
    return update_file_content(path, content, commit_msg)

def update_noticia(filename, content, sha, commit_msg):
    path = f'_posts/noticias/{filename}'
    return update_file_content(path, content, commit_msg, sha)

def delete_noticia(filename, sha):
    path = f'_posts/noticias/{filename}'
    return delete_file(path, sha, f'Eliminar {filename}')

def get_yaml(filepath):
    """Obtiene contenido y SHA de un archivo YAML"""
    content, sha = get_file_content(filepath)
    return {'content': content, 'sha': sha}

def update_yaml(filepath, content, commit_msg, sha=None):
    return update_file_content(filepath, content, commit_msg, sha)

# ---------- Manejador principal de Vercel ----------
def handler(request):
    # Verificar autenticación
    api_key = request.headers.get('x-api-key')
    if api_key != API_KEY:
        return {
            'statusCode': 401,
            'body': json.dumps({'error': 'No autorizado'})
        }
    
    # Solo POST (para acciones) o GET (para listar noticias)
    method = request.method
    if method == 'GET':
        # GET devuelve lista de noticias (para carga inicial)
        return {
            'statusCode': 200,
            'body': json.dumps(list_noticias())
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'body': json.dumps({'error': 'Método no permitido'})
        }
    
    # Parsear body
    try:
        body = json.loads(request.body)
    except:
        body = {}
    
    action = body.get('action')
    
    try:
        if action == 'list_noticias':
            data = list_noticias()
        elif action == 'get_noticia':
            slug = body.get('slug')
            if not slug:
                raise Exception('Falta slug')
            data = get_noticia(slug)
        elif action == 'create_noticia':
            filename = body.get('filename')
            content = body.get('content')
            msg = body.get('message', 'Crear noticia')
            if not filename or not content:
                raise Exception('Faltan datos')
            data = create_noticia(filename, content, msg)
        elif action == 'update_noticia':
            filename = body.get('filename')
            content = body.get('content')
            sha = body.get('sha')
            msg = body.get('message', 'Actualizar noticia')
            if not filename or not content or not sha:
                raise Exception('Faltan datos')
            data = update_noticia(filename, content, sha, msg)
        elif action == 'delete_noticia':
            filename = body.get('filename')
            sha = body.get('sha')
            if not filename or not sha:
                raise Exception('Faltan datos')
            data = delete_noticia(filename, sha)
        elif action == 'get_emprendedores':
            data = get_yaml('_data/emprendedores.yml')
        elif action == 'update_emprendedores':
            content = body.get('content')
            sha = body.get('sha')
            msg = body.get('message', 'Actualizar emprendedores')
            if not content:
                raise Exception('Falta contenido')
            data = update_yaml('_data/emprendedores.yml', content, msg, sha)
        elif action == 'get_alertas':
            data = get_yaml('_data/alertas.yml')
        elif action == 'update_alertas':
            content = body.get('content')
            sha = body.get('sha')
            msg = body.get('message', 'Actualizar alertas')
            if not content:
                raise Exception('Falta contenido')
            data = update_yaml('_data/alertas.yml', content, msg, sha)
        elif action == 'get_eventos':
            data = get_yaml('_data/eventos.yml')
        elif action == 'update_eventos':
            content = body.get('content')
            sha = body.get('sha')
            msg = body.get('message', 'Actualizar eventos')
            if not content:
                raise Exception('Falta contenido')
            data = update_yaml('_data/eventos.yml', content, msg, sha)
        elif action == 'get_servicios':
            data = get_yaml('_data/servicios.yml')
        elif action == 'update_servicios':
            content = body.get('content')
            sha = body.get('sha')
            msg = body.get('message', 'Actualizar servicios')
            if not content:
                raise Exception('Falta contenido')
            data = update_yaml('_data/servicios.yml', content, msg, sha)
        elif action == 'get_configuracion':
            data = get_yaml('_data/configuracion.yml')
        elif action == 'update_configuracion':
            content = body.get('content')
            sha = body.get('sha')
            msg = body.get('message', 'Actualizar configuración')
            if not content:
                raise Exception('Falta contenido')
            data = update_yaml('_data/configuracion.yml', content, msg, sha)
        else:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': f'Acción desconocida: {action}'})
            }
        
        return {
            'statusCode': 200,
            'body': json.dumps(data)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }