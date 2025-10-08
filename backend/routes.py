from flask import jsonify, render_template, send_from_directory, send_file
from functools import wraps
from werkzeug.utils import secure_filename
from PIL import Image
from io import BytesIO # IMPORT ADICIONADO para a função optimize_image
import sqlite3, os, requests, random, logging
from config import Config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Certifique-se de criar pastas
os.makedirs(Config.DATA_DIR, exist_ok=True)
os.makedirs(Config.DOCUMENTS_DIR, exist_ok=True)

fallback_count_file = os.path.join(Config.DATA_DIR, 'visitors.txt')

def register_routes(app):
    # -----------------------
    # Banco de dados visitantes
    # -----------------------
    def init_db():
        try:
            conn = sqlite3.connect(Config.VISITORS_DB)
            c = conn.cursor()
            c.execute('''CREATE TABLE IF NOT EXISTS visitors
                         (id INTEGER PRIMARY KEY AUTOINCREMENT, count INTEGER)''')
            c.execute('INSERT OR IGNORE INTO visitors (id, count) VALUES (1, 0)')
            conn.commit()
            conn.close()
            logger.info("DB inicializado com sucesso")
        except Exception as e:
            logger.error(f"Erro init DB: {e}")
            if not os.path.exists(fallback_count_file):
                with open(fallback_count_file, 'w') as f:
                    f.write('0')

    def get_visitor_count():
        try:
            conn = sqlite3.connect(Config.VISITORS_DB)
            c = conn.cursor()
            c.execute('SELECT count FROM visitors WHERE id = 1')
            result = c.fetchone()
            conn.close()
            return result[0] if result else 0
        except Exception:
            if os.path.exists(fallback_count_file):
                with open(fallback_count_file, 'r') as f:
                    return int(f.read().strip())
            return 0

    def increment_visitor_count():
        try:
            conn = sqlite3.connect(Config.VISITORS_DB)
            c = conn.cursor()
            c.execute('UPDATE visitors SET count = count + 1 WHERE id = 1')
            conn.commit()
            conn.close()
        except Exception:
            count = get_visitor_count()
            with open(fallback_count_file, 'w') as f:
                f.write(str(count + 1))

    def track_visitors(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if f.__name__ == 'index':
                increment_visitor_count()
            return f(*args, **kwargs)
        return decorated

    init_db()

    # -----------------------
    # Rotas
    # -----------------------
    @app.route('/')
    @track_visitors
    def index():
        return render_template('index.html')

    @app.route('/visitor-count')
    def visitor_count():
        return jsonify({'count': get_visitor_count()})

    @app.route('/api/location')
    def get_location():
        return jsonify({
            "name": "Igreja Presbiteriana em Palmeiras-BA",
            "address": Config.CHURCH_ADDRESS,
            "coordinates": {"latitude": -12.5152504, "longitude": -41.5760951}
        })

    @app.route('/api/photos')
    def get_photos():
        photos = []
        if os.path.exists(Config.PHOTOS_DIR):
            for file in os.listdir(Config.PHOTOS_DIR):
                if file.lower().endswith(('.jpg', '.jpeg', '.png')):
                    photos.append({
                        # Verifique se o caminho '/static/imgs/igr/' está correto
                        'url': f'/static/imgs/igr/{file}', 
                        'description': file.split('.')[0].replace('_', ' ')
                    })
        logger.info(f"Fotos encontradas: {len(photos)}")
        return jsonify(photos)

    def optimize_image(path):
        try:
            img = Image.open(path)
            img_io = BytesIO()
            img.save(img_io, 'JPEG', quality=85)
            img_io.seek(0)
            return img_io
        except Exception as e:
            logger.error(f"Erro ao otimizar imagem: {e}")
            return None

    @app.route('/optimized-image/<path:image_path>')
    def serve_optimized_image(image_path):
        full_path = os.path.join(Config.STATIC_DIR, 'imgs', image_path)
        if os.path.exists(full_path):
            optimized = optimize_image(full_path)
            if optimized:
                return send_file(optimized, mimetype='image/jpeg', cache_timeout=31536000)
        return '', 404

    # -----------------------
    # API da Bíblia (CORRIGIDA - Endpoint Principal)
    # -----------------------
    @app.route('/api/bible/<book>/<chapter>', defaults={'verse': ''})
    @app.route('/api/bible/<book>/<chapter>/<verse>')
    def get_bible_chapter(book, chapter, verse):
        # Usando a tradução Almeida (almeida) conforme indicado no apibible.txt
        reference = f"{book.strip()} {chapter.strip()}"
        if verse:
            reference += f":{verse.strip()}"

        # Usando o URL da API da Bíblia
        url = f"https://bible-api.com/{reference}?translation=almeida"

        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()

            if 'verses' not in data or not data['verses']:
                return jsonify({"reference": "Erro", "text": "Versículo não encontrado. Verifique o livro/capítulo/versículo."}), 404

            # Formata a resposta
            formatted_verses = [f"(${v['verse']}) {v['text']}" for v in data['verses']]
            text = " ".join(formatted_verses)

            return jsonify({
                "reference": data.get('reference', f"{book} {chapter}{':'+verse if verse else ''}"),
                "text": text
            })

        except requests.exceptions.RequestException as e:
            logger.error(f"Erro ao buscar na Bible-API: {e}")
            return jsonify({"reference": "Erro", "text": "Falha ao carregar o texto bíblico. API indisponível."}), 503

    @app.route('/api/random-verse')
    def get_random_verse():
        try:
            # CORRIGIDO para incluir a tradução Almeida
            response = requests.get(f"{Config.BIBLE_API_URL}/random?translation=almeida", timeout=10)
            response.raise_for_status()
            data = response.json()
            return jsonify({"reference": data['reference'], "text": data['text']})
        except Exception as e:
            logger.error(f"Erro Bible API: {e}")
            fallback = [
                {"reference": "João 3:16", "text": "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito..."},
                {"reference": "Salmos 23:1", "text": "O Senhor é o meu pastor, nada me faltará."}
            ]
            return jsonify(random.choice(fallback))

    # -----------------------
    # API de Eventos (NOVA ROTA)
    # -----------------------
    @app.route('/api/events')
    def get_events():
        # Dados placeholder para exibição
        events = [
            {"title": "Culto de Aniversário da IPP", "date": "10 de Dezembro, 19:30", "description": "Celebração especial pelos 100 anos da igreja com preletor convidado."},
            {"title": "Reunião de Oração da UMP", "date": "Toda Quarta-feira, 19:30", "description": "Reunião para os jovens e adolescentes da igreja no templo."},
            {"title": "Passeio Missionário", "date": "25 de Dezembro, 08:00", "description": "Saída para comunidades rurais com entrega de cestas básicas e evangelismo."}
        ]
        return jsonify(events)

    @app.route('/api/documents')
    def get_documents():
        documents = []
        for file in os.listdir(Config.DOCUMENTS_DIR):
            if file.lower().endswith(('.pdf', '.docx', '.txt')):
                documents.append({
                    'name': file.split('.')[0].replace('_', ' '),
                    'path': f'/data/documents/{secure_filename(file)}'
                })
        return jsonify(documents)

    @app.route('/data/documents/<path:filename>')
    def serve_document(filename):
        safe_filename = secure_filename(filename)
        return send_from_directory(Config.DOCUMENTS_DIR, safe_filename)

    @app.route('/api/music')
    def get_music():
        playlist = [
            {"title": "Louvor 1", "videoId": "Xx1"},
            {"title": "Louvor 2", "videoId": "Xx2"},
        ]
        return jsonify(playlist)

    @app.route('/<path:path>')
    def serve_static(path):
        static_path = os.path.join(app.static_folder, path)
        if os.path.exists(static_path):
            return send_from_directory(app.static_folder, path)
        return 'Not Found', 404
