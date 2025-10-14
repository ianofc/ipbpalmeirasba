from flask import jsonify, render_template, send_from_directory, send_file
from functools import wraps
from werkzeug.utils import secure_filename
from PIL import Image
from io import BytesIO
import sqlite3, os, requests, random, logging
from config import Config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Certifique-se de que as pastas de dados existem
os.makedirs(Config.DATA_DIR, exist_ok=True)
os.makedirs(Config.DOCUMENTS_DIR, exist_ok=True)

fallback_count_file = os.path.join(Config.DATA_DIR, 'visitors.txt')

def register_routes(app):
    
    # --- FUNÇÕES DE BANCO DE DADOS (Sem alterações) ---
    def init_db():
        try:
            conn = sqlite3.connect(Config.VISITORS_DB)
            c = conn.cursor()
            c.execute('''CREATE TABLE IF NOT EXISTS visitors (id INTEGER PRIMARY KEY, count INTEGER)''')
            c.execute('INSERT OR IGNORE INTO visitors (id, count) VALUES (1, 0)')
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Erro ao inicializar DB: {e}")

    def get_visitor_count():
        try:
            conn = sqlite3.connect(Config.VISITORS_DB)
            c = conn.cursor()
            c.execute('SELECT count FROM visitors WHERE id = 1')
            result = c.fetchone()
            conn.close()
            return result[0] if result else 0
        except Exception:
            return 0

    def increment_visitor_count():
        try:
            conn = sqlite3.connect(Config.VISITORS_DB)
            c = conn.cursor()
            c.execute('UPDATE visitors SET count = count + 1 WHERE id = 1')
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Erro ao incrementar visitantes: {e}")

    def track_visitors(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if f.__name__ == 'index':
                increment_visitor_count()
            return f(*args, **kwargs)
        return decorated

    init_db()

    # --- ROTAS DE PÁGINAS HTML (CORRIGIDAS E FINALIZADAS) ---
    @app.route('/')
    @track_visitors
    def index():
        return render_template('index.html')

    @app.route('/downloads.html')
    def downloads():
        return render_template('downloads.html')

    @app.route('/history.html')
    def history():
        return render_template('history.html')
        
    # ROTA ADICIONADA PARA A PÁGINA DA BÍBLIA
    @app.route('/bible.html')
    def bible():
        return render_template('bible.html')

    # --- ROTAS DE API (CORRIGIDAS E FINALIZADAS) ---

    # ROTAS ADICIONADAS PARA A API DA BÍBLIA
    @app.route('/api/random-verse')
    def get_random_verse():
        try:
            response = requests.get(f"{Config.BIBLE_API_URL}/random?translation=almeida", timeout=10)
            response.raise_for_status()
            data = response.json()
            return jsonify({"reference": data['reference'], "text": data['text'].strip()})
        except Exception as e:
            logger.error(f"Erro na API de versículo aleatório: {e}")
            fallback = {"reference": "João 3:16", "text": "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna."}
            return jsonify(fallback), 503

    @app.route('/api/bible/<book>/<chapter>')
    def get_bible_chapter(book, chapter):
        url = f"https://bible-api.com/{book}+{chapter}?translation=almeida"
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status() 
            data = response.json()
            if 'verses' not in data:
                return jsonify({"error": "Resposta inválida da API da Bíblia"}), 500
            return jsonify(data)
        except requests.exceptions.HTTPError as e:
            logger.error(f"Erro HTTP da API da Bíblia para {book} {chapter}: {e}")
            return jsonify({"error": "Livro ou capítulo não encontrado."}), 404
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro de conexão com a API da Bíblia: {e}")
            return jsonify({"error": "Não foi possível conectar à API da Bíblia."}), 503

    # --- RESTANTE DAS SUAS ROTAS (Sem alterações) ---
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
                        'url': f'/static/imgs/igr/{file}', 
                        'description': os.path.splitext(file)[0].replace('_', ' ')
                    })
        return jsonify(photos)

    @app.route('/api/documents')
    def get_documents():
        documents = []
        if os.path.exists(Config.DOCUMENTS_DIR):
            for file in os.listdir(Config.DOCUMENTS_DIR):
                if file.lower().endswith(('.pdf', '.docx', '.txt')):
                    documents.append({
                        'name': os.path.splitext(file)[0].replace('_', ' '),
                        'path': f'/data/documents/{secure_filename(file)}'
                    })
        return jsonify(documents)

    @app.route('/data/documents/<path:filename>')
    def serve_document(filename):
        safe_filename = secure_filename(filename)
        return send_from_directory(Config.DOCUMENTS_DIR, safe_filename, as_attachment=True)
