from flask import jsonify, render_template, send_file, send_from_directory
from functools import wraps
from io import BytesIO
from PIL import Image
import sqlite3
import os
import requests
import random

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'data', 'visitors.db')

def register_routes(app):
    # -----------------------
    # Banco de dados visitantes
    # -----------------------
    def init_db():
        os.makedirs(os.path.join(BASE_DIR, 'data'), exist_ok=True)
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('''CREATE TABLE IF NOT EXISTS visitors
                     (id INTEGER PRIMARY KEY AUTOINCREMENT, count INTEGER)''')
        c.execute('INSERT OR IGNORE INTO visitors (id, count) VALUES (1, 0)')
        conn.commit()
        conn.close()

    def get_visitor_count():
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('SELECT count FROM visitors WHERE id = 1')
        result = c.fetchone()
        conn.close()
        return result[0] if result else 0

    def increment_visitor_count():
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('UPDATE visitors SET count = count + 1 WHERE id = 1')
        conn.commit()
        conn.close()

    def track_visitors(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if f.__name__ == 'index':
                increment_visitor_count()
            return f(*args, **kwargs)
        return decorated_function

    # -----------------------
    # Rotas
    # -----------------------
    @app.route('/')
    @track_visitors
    def index():
        return render_template('index.html')

    @app.route('/visitor-count', methods=['GET'])
    def visitor_count():
        return jsonify({'count': get_visitor_count()})

    @app.route('/api/location', methods=['GET'])
    def get_location():
        return jsonify({
            "name": "Igreja Presbiteriana em Palmeiras-BA",
            "address": "Rua Coronel Dreger, Palmeiras, Bahia, Brasil",
            "coordinates": {
                "latitude": -12.5152504,
                "longitude": -41.5760951
            }
        })

    @app.route('/api/photos', methods=['GET'])
    def get_photos():
        photos_path = os.path.join('../frontend/src/imgs/igr')
        photos = []
        if os.path.exists(photos_path):
            for file in os.listdir(photos_path):
                if file.lower().endswith(('.jpg', '.jpeg', '.png')):
                    photos.append({
                        'url': f'/src/imgs/igr/{file}',
                        'description': file.split('.')[0].replace('_', ' ')
                    })
        return jsonify(photos)

    # -----------------------
    # Função auxiliar: otimizar imagem
    # -----------------------
    def optimize_image(image_path, max_size=800):
        img = Image.open(image_path)
        if max(img.size) > max_size:
            ratio = max_size / max(img.size)
            new_size = tuple(int(dim * ratio) for dim in img.size)
            img = img.resize(new_size, Image.Resampling.LANCZOS)
        output = BytesIO()
        img.save(output, format='JPEG', quality=85, optimize=True)
        output.seek(0)
        return output

    @app.route('/optimized-image/<path:image_path>')
    def serve_optimized_image(image_path):
        full_path = os.path.join('../frontend/src/imgs', image_path)
        if os.path.exists(full_path):
            return send_file(optimize_image(full_path), mimetype='image/jpeg', cache_timeout=31536000)
        return '', 404

    # -----------------------
    # API de Versículos
    # -----------------------
    @app.route('/api/random-verse', methods=['GET'])
    def get_random_verse():
        try:
            response = requests.get('https://bible-api.com/random')
            response.raise_for_status()
            data = response.json()
            return jsonify({
                "reference": f"{data['reference']}",
                "text": data['text']
            })
        except Exception:
            verses = [
                {"reference": "João 3:16", "text": "Porque Deus amou o mundo..."},
                {"reference": "Salmos 23:1", "text": "O Senhor é o meu pastor, nada me faltará."}
            ]
            return jsonify(random.choice(verses))

    @app.route('/api/verse/<book>/<chapter>', methods=['GET'])
    def get_bible_chapter(book, chapter):
        try:
            response = requests.get(f'https://bible-api.com/{book}+{chapter}?translation=almeida')
            if response.status_code == 200:
                data = response.json()
                return jsonify({
                    'reference': data.get('reference', ''),
                    'text': data.get('text', '').replace('\n', ' ')
                })
            else:
                return jsonify({'error': 'Capítulo não encontrado'}), 404
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    # -----------------------
    # APIs Extras
    # -----------------------
    @app.route('/api/calendar', methods=['GET'])
    def get_calendar():
        return jsonify({
            "calendar_url": "https://calendar.google.com/calendar/embed?src=pt.brazilian%23holiday%40group.v.calendar.google.com"
        })

    @app.route('/api/music', methods=['GET'])
    def get_music():
        playlist = [
            {"title": "Teu Povo", "videoId": "4GC0uxYbJ-M"}, 
            {"title": "Porque Ele Vive", "videoId": "mgUasyYzCKQ"}, 
            {"title": "Castelo Forte", "videoId": "RGCzQjFKk2w"}, 
            {"title": "Isaías 53 & Foi na Cruz", "videoId": "HML9NUQJZEU"}, 
            {"title": "Maravilhosa Graça", "videoId": "c7hw86kSAvw"}, 
            {"title": "Firmeza na Fé", "videoId": "w_T_fG30TFw"}, 
            {"title": "Ao Pé da Cruz", "videoId": "2C6EPo0GE3I"}, 
            {"title": "O Rei Está Aqui", "videoId": "1oh4hdg0IAg"}, 
            {"title": "Noite de Paz", "videoId": "hjF4jI8jNAY"}, 
            {"title": "A Rua e o Mundo", "videoId": "3E84QBUyZFo"}, 
            {"title": "Êxodo", "videoId": "xgE_rNyOoSI"}, 
            {"title": "Oh Quão Lindo esse Nome É", "videoId": "uV6rRUc35io"}, 
            {"title": "Encarnação", "videoId": "rQctRkKODN8"}, 
            {"title": "Trindade Santíssima", "videoId": "z3nPTt2NiUo"}, 
            {"title": "É o Teu Povo", "videoId": "7DH_tKN_n-g"}, 
            {"title": "Recebe a Honra", "videoId": "NRcVLMbdD58"}
        ]
        return jsonify(playlist)

    @app.route('/<path:path>')
    def serve_static(path):
        return send_from_directory(app.static_folder, path)

    # Inicializa o banco na primeira execução
    init_db()
