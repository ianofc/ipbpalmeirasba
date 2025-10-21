from flask import jsonify, render_template, send_from_directory, send_file, request
from functools import wraps
from werkzeug.utils import secure_filename
from PIL import Image
from io import BytesIO
import sqlite3, os, requests, random, logging
from config import Config
from models import db, Membro, User, Oficial

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
        return render_template('svm/index.html')

    @app.route('/downloads.html')
    def downloads():
        return render_template('svm/downloads.html')

    @app.route('/history.html')
    def history():
        return render_template('svm/history.html')
        
    # ROTA ADICIONADA PARA A PÁGINA DA BÍBLIA (Rota corrigida)
    @app.route('/bible.html')
    def bible():
        # Corrigido para apontar para o diretório 'svm'
        return render_template('svm/bible.html')

    # --- ROTAS SGI (Sistema de Gestão) - NOVAS ROTAS ADICIONADAS ---

    @app.route('/sgi/home.html')
    def sgi_home():
        return render_template('sgi/home.html')

    @app.route('/sgi/login.html')
    def sgi_login():
        return render_template('sgi/login.html')

    # Rotas SGI/CAD
    @app.route('/sgi/cad/cadagendas.html')
    def sgi_cad_agendas():
        return render_template('sgi/cad/cadagendas.html')

    @app.route('/sgi/cad/cadclasseebd.html')
    def sgi_cad_classeebd():
        return render_template('sgi/cad/cadclasseebd.html')

    @app.route('/sgi/cad/cadeventos.html')
    def sgi_cad_eventos():
        return render_template('sgi/cad/cadeventos.html')

    @app.route('/sgi/cad/cadfinancas.html')
    def sgi_cad_financas():
        return render_template('sgi/cad/cadfinancas.html')

    @app.route('/sgi/cad/cadkids.html')
    def sgi_cad_kids():
        return render_template('sgi/cad/cadkids.html')

    @app.route('/sgi/cad/cadmembros.html')
    def sgi_cad_membros():
        return render_template('sgi/cad/cadmembros.html')

    @app.route('/sgi/cad/cadoficiais.html')
    def sgi_cad_oficiais():
        return render_template('sgi/cad/cadoficiais.html')

    @app.route('/sgi/cad/cadpatrimonio.html')
    def sgi_cad_patrimonio():
        return render_template('sgi/cad/cadpatrimonio.html')

    @app.route('/sgi/cad/cadpublicacoes.html')
    def sgi_cad_publicacoes():
        return render_template('sgi/cad/cadpublicacoes.html')

    @app.route('/sgi/cad/cadsociedades.html')
    def sgi_cad_sociedades():
        return render_template('sgi/cad/cadsociedades.html')

    # Rotas SGI/DASH
    @app.route('/sgi/dash/dashagendas.html')
    def sgi_dash_agendas():
        return render_template('sgi/dash/dashagendas.html')

    @app.route('/sgi/dash/dashclasseebd.html')
    def sgi_dash_classeebd():
        return render_template('sgi/dash/dashclasseebd.html')

    @app.route('/sgi/dash/dasheventos.html')
    def sgi_dash_eventos():
        return render_template('sgi/dash/dasheventos.html')

    @app.route('/sgi/dash/dashfinancas.html')
    def sgi_dash_financas():
        return render_template('sgi/dash/dashfinancas.html')

    @app.route('/sgi/dash/dashkids.html')
    def sgi_dash_kids():
        return render_template('sgi/dash/dashkids.html')

    @app.route('/sgi/dash/dashmembros.html')
    def sgi_dash_membros():
        return render_template('sgi/dash/dashmembros.html')

    @app.route('/sgi/dash/dashoficiais.html')
    def sgi_dash_oficiais():
        return render_template('sgi/dash/dashoficiais.html')

    @app.route('/sgi/dash/dashpatrimonio.html')
    def sgi_dash_patrimonio():
        return render_template('sgi/dash/dashpatrimonio.html')

    @app.route('/sgi/dash/dashpublicacoes.html')
    def sgi_dash_publicacoes():
        return render_template('sgi/dash/dashpublicacoes.html')

    @app.route('/sgi/dash/dashsociedades.html')
    def sgi_dash_sociedades():
        return render_template('sgi/dash/dashsociedades.html')

    # Rotas SGI/PESQ
    @app.route('/sgi/pesq/pesqagendas.html')
    def sgi_pesq_agendas():
        return render_template('sgi/pesq/pesqagendas.html')

    @app.route('/sgi/pesq/pesqclasseebd.html')
    def sgi_pesq_classeebd():
        return render_template('sgi/pesq/pesqclasseebd.html')

    @app.route('/sgi/pesq/pesqeventos.html')
    def sgi_pesq_eventos():
        return render_template('sgi/pesq/pesqeventos.html')

    @app.route('/sgi/pesq/pesqfinancas.html')
    def sgi_pesq_financas():
        return render_template('sgi/pesq/pesqfinancas.html')

    @app.route('/sgi/pesq/pesqkids.html')
    def sgi_pesq_kids():
        return render_template('sgi/pesq/pesqkids.html')

    @app.route('/sgi/pesq/pesqmembros.html')
    def sgi_pesq_membros():
        return render_template('sgi/pesq/pesqmembros.html')

    @app.route('/sgi/pesq/pesqoficiais.html')
    def sgi_pesq_oficiais():
        return render_template('sgi/pesq/pesqoficiais.html')

    @app.route('/sgi/pesq/pesqpatrimonio.html')
    def sgi_pesq_patrimonio():
        return render_template('sgi/pesq/pesqpatrimonio.html')

    @app.route('/sgi/pesq/pesqpublicacoes.html')
    def sgi_pesq_publicacoes():
        return render_template('sgi/pesq/pesqpublicacoes.html')

    @app.route('/sgi/pesq/pesqsociedades.html')
    def sgi_pesq_sociedades():
        return render_template('sgi/pesq/pesqsociedades.html')

    # Rotas SGI/USER
    @app.route('/sgi/user/perfuser.html')
    def sgi_user_perfuser():
        return render_template('sgi/user/perfuser.html')


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


    # --- API PARA CADASTRO DE MEMBRO ---
    @app.route('/sgi/api/membros', methods=['POST'])
    def add_membro():
        # (Futuramente, adicionaremos a verificação de login aqui)
        
        data = request.form
        
        if not data.get('nome_completo'):
            return jsonify({'success': False, 'message': 'Nome completo é obrigatório.'}), 400

        try:
            novo_membro = Membro(
                nome_completo=data.get('nome_completo'),
                data_nascimento=data.get('data_nascimento') or None,
                # Os campos cpf, rg e email foram removidos daqui
                endereco=data.get('endereco'),
                telefone=data.get('telefone'),
                estado_civil=data.get('estado_civil'),
                data_batismo=data.get('data_batismo') or None,
                igreja_batismo=data.get('igreja_batismo'),
                data_profissao_fe=data.get('data_profissao_fe') or None,
                tipo_membro=data.get('tipo_membro'),
                status=data.get('status'),
                observacoes=data.get('observacoes')
            )
            
            db.session.add(novo_membro)
            db.session.commit()
            
            return jsonify({'success': True, 'message': 'Membro cadastrado com sucesso!'})

        except Exception as e:
            db.session.rollback()
            logger.error(f"Erro ao cadastrar membro: {e}")
            # Mensagem de erro simplificada
            return jsonify({'success': False, 'message': 'Erro interno ao salvar no banco de dados.'}), 500

    # --- API PARA BUSCAR MEMBROS (Autocomplete) ---
    @app.route('/sgi/api/membros/search')
    def search_membros():
        # Futuramente, protegeremos esta rota
        
        query = request.args.get('q', '') # Pega o termo de busca da URL (?q=nome)
        if not query:
            return jsonify([])

        # Busca membros cujo nome contenha o termo pesquisado (case-insensitive)
        membros = Membro.query.filter(Membro.nome_completo.ilike(f'%{query}%')).limit(10).all()
        
        # Formata o resultado para o frontend
        results = [{'id': membro.id, 'nome_completo': membro.nome_completo} for membro in membros]
        return jsonify(results)

    # --- API PARA CADASTRAR OFICIAL ---
    @app.route('/sgi/api/oficiais', methods=['POST'])
    def add_oficial():
        # Futuramente, protegeremos esta rota
        
        data = request.form
        membro_id = data.get('membro_id')
        
        # Validações
        if not membro_id:
            return jsonify({'success': False, 'message': 'É necessário selecionar um membro válido.'}), 400
        
        # Verifica se o membro já não é um oficial
        existing_oficial = Oficial.query.filter_by(membro_id=membro_id).first()
        if existing_oficial:
            return jsonify({'success': False, 'message': f'Este membro já é um {existing_oficial.cargo}.'}), 409

        try:
            novo_oficial = Oficial(
                membro_id=membro_id,
                cargo=data.get('cargo'),
                data_ordenacao=data.get('data_ordenacao') or None,
                mandato_inicio=data.get('mandato_inicio') or None,
                mandato_fim=data.get('mandato_fim') or None,
                status_oficio=data.get('status_oficio')
            )
            
            db.session.add(novo_oficial)
            db.session.commit()
            
            return jsonify({'success': True, 'message': f'{data.get("cargo")} cadastrado com sucesso!'})

        except Exception as e:
            db.session.rollback()
            logger.error(f"Erro ao cadastrar oficial: {e}")
            return jsonify({'success': False, 'message': 'Erro interno ao salvar o oficial.'}), 500