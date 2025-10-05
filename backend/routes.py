   from flask import jsonify, render_template, send_file, send_from_directory
   from functools import wraps
   from io import BytesIO
   from PIL import Image
   import sqlite3
   import os
   import requests
   import random
   import logging  # Para logs

   logging.basicConfig(level=logging.INFO)
   logger = logging.getLogger(__name__)

   BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # backend/
   DATA_DIR = os.path.abspath(os.path.join(BASE_DIR, 'data'))  # backend/data
   DB_PATH = os.path.join(DATA_DIR, 'visitors.db')
   FRONTEND_STATIC_DIR = os.path.abspath(os.path.join(BASE_DIR, '../frontend/src'))  # ../frontend/src

   os.makedirs(DATA_DIR, exist_ok=True)  # Crie data/ sempre

   def register_routes(app):
       # -----------------------
       # Banco de dados visitantes (com fallback)
       # -----------------------
       def init_db():
           try:
               conn = sqlite3.connect(DB_PATH)
               c = conn.cursor()
               c.execute('''CREATE TABLE IF NOT EXISTS visitors
                            (id INTEGER PRIMARY KEY AUTOINCREMENT, count INTEGER)''')
               c.execute('INSERT OR IGNORE INTO visitors (id, count) VALUES (1, 0)')
               conn.commit()
               conn.close()
               logger.info("DB inicializado com sucesso")
           except Exception as e:
               logger.error(f"Erro init DB: {e}")
               # Fallback: arquivo simples para count (não persistente no DO)
               global fallback_count_file
               fallback_count_file = os.path.join(DATA_DIR, 'visitors.txt')
               if not os.path.exists(fallback_count_file):
                   with open(fallback_count_file, 'w') as f:
                       f.write('0')

       def get_visitor_count():
           try:
               conn = sqlite3.connect(DB_PATH)
               c = conn.cursor()
               c.execute('SELECT count FROM visitors WHERE id = 1')
               result = c.fetchone()
               conn.close()
               return result[0] if result else 0
           except Exception:
               # Fallback arquivo
               if os.path.exists(fallback_count_file):
                   with open(fallback_count_file, 'r') as f:
                       return int(f.read().strip())
               return 0

       def increment_visitor_count():
           try:
               conn = sqlite3.connect(DB_PATH)
               c = conn.cursor()
               c.execute('UPDATE visitors SET count = count + 1 WHERE id = 1')
               conn.commit()
               conn.close()
           except Exception:
               # Fallback
               if os.path.exists(fallback_count_file):
                   count = get_visitor_count()
                   with open(fallback_count_file, 'w') as f:
                       f.write(str(count + 1))

       fallback_count_file = None  # Global para fallback

       def track_visitors(f):
           @wraps(f)
           def decorated_function(*args, **kwargs):
               if f.__name__ == 'index':
                   increment_visitor_count()
               return f(*args, **kwargs)
           return decorated_function

       # Inicializa DB aqui (uma vez por load)
       init_db()

       # -----------------------
       # Rotas (resto igual, mas ajuste paths)
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
               "address": "Rua Coronel Antônio Afonso, 38, Palmeiras-BA",  # Corrigido
               "coordinates": {
                   "latitude": -12.5152504,
                   "longitude": -41.5760951
               }
           })

       @app.route('/api/photos', methods=['GET'])
       def get_photos():
           photos_path = os.path.join(FRONTEND_STATIC_DIR, 'imgs', 'igr')  # Absoluto
           photos = []
           if os.path.exists(photos_path):
               for file in os.listdir(photos_path):
                   if file.lower().endswith(('.jpg', '.jpeg', '.png')):
                       photos.append({
                           'url': f'/static/imgs/igr/{file}',  # Use /static para consistência
                           'description': file.split('.')[0].replace('_', ' ')
                       })
           logger.info(f"Fotos encontradas: {len(photos)}")
           return jsonify(photos)

       # Função optimize_image (igual)

       @app.route('/optimized-image/<path:image_path>')
       def serve_optimized_image(image_path):
           full_path = os.path.join(FRONTEND_STATIC_DIR, 'imgs', image_path)
           if os.path.exists(full_path):
               return send_file(optimize_image(full_path), mimetype='image/jpeg', cache_timeout=31536000)
           return '', 404

       # /api/random-verse (igual, mas adicione log)
       @app.route('/api/random-verse', methods=['GET'])
       def get_random_verse():
           try:
               response = requests.get('https://bible-api.com/random', timeout=10)
               response.raise_for_status()
               data = response.json()
               return jsonify({
                   "reference": data['reference'],
                   "text": data['text']
               })
           except Exception as e:
               logger.error(f"Erro Bible API: {e}")
               verses = [  # Expanda se quiser
                   {"reference": "João 3:16", "text": "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito..."},
                   {"reference": "Salmos 23:1", "text": "O Senhor é o meu pastor, nada me faltará."}
               ]
               return jsonify(random.choice(verses))

       # /api/verse/... (igual)

       @app.route('/api/calendar', methods=['GET'])
       def get_calendar():
           return jsonify({
               "calendar_url": "https://calendar.google.com/calendar/embed?src=pt.brazilian%23holiday%40group.v.calendar.google.com"
           })

       @app.route('/api/documents', methods=['GET'])
       def get_documents():
           documents_path = os.path.join(DATA_DIR, 'documents')  # backend/data/documents
           os.makedirs(documents_path, exist_ok=True)
           documents = []
           if os.path.exists(documents_path):
               for file in os.listdir(documents_path):
                   if file.lower().endswith(('.pdf', '.docx', '.txt')):
                       documents.append({
                           'name': file.split('.')[0].replace('_', ' '),
                           'path': f'/data/documents/{file}'
                       })
           return jsonify(documents)

       @app.route('/data/documents/<path:filename>')
       def serve_document(filename):
           return send_from_directory(os.path.join(DATA_DIR, 'documents'), filename)

       @app.route('/api/music', methods=['GET'])
       def get_music():
           # Playlist igual
           playlist = [  # Seu array aqui ]
           return jsonify(playlist)

       # Rota catch-all para static (ajuste para usar static_folder)
       @app.route('/<path:path>')
       def serve_static(path):
           # Tente servir de static_folder primeiro
           if os.path.exists(os.path.join(app.static_folder, path)):
               return send_from_directory(app.static_folder, path)
           # Fallback para outros dirs se necessário
           return 'Not Found', 404
   
