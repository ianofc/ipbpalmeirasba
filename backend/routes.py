from flask import jsonify, render_template, send_from_directory, request
from functools import wraps
from werkzeug.utils import secure_filename
import os
import requests
import logging
import deepl  
from sqlalchemy import desc 
from config import Config
from models import ( 
    db, Membro, User, Oficial, Visitor, Publicacao, Evento
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Certifique-se de que as pastas de dados existem
os.makedirs(Config.DATA_DIR, exist_ok=True)
os.makedirs(Config.DOCUMENTS_DIR, exist_ok=True)

# --- NOVO: Inicialização da API de Tradução (DeepL) ---
translator = None
if not Config.DEEPL_AUTH_KEY:
    logger.warning("DEEPL_AUTH_KEY não definida no .env. A API de tradução não funcionará.")
else:
    try:
        # Usa a URL do servidor gratuito, conforme sua documentação
        translator = deepl.Translator(
            Config.DEEPL_AUTH_KEY,
            server_url="https://api-free.deepl.com" 
        )
        logger.info("Tradutor DeepL (Free) inicializado com sucesso.")
    except Exception as e:
        logger.error(f"Falha ao inicializar o tradutor DeepL: {e}")


def register_routes(app):

    # --- FUNÇÕES DE CONTADOR DE VISITANTES (REFEITAS COM SQLALCHEMY) ---
    
    def get_visitor_count_internal():
        """Função interna para buscar ou criar o contador de visitantes."""
        # Tenta buscar o registro (id=1)
        visitor_row = db.session.get(Visitor, 1)
        if not visitor_row:
            # Se não existir, cria
            try:
                visitor_row = Visitor(id=1, count=0)
                db.session.add(visitor_row)
                db.session.commit()
                logger.info("Registro de visitante (id=1) criado no banco de dados.")
            except Exception as e:
                db.session.rollback()
                logger.error(f"Erro ao criar registro de visitante: {e}")
                return 0 # Retorna 0 em caso de falha na criação
        return visitor_row.count

    def track_visitors(f):
        """Decorator para incrementar a contagem de visitantes na rota principal."""
        @wraps(f)
        def decorated(*args, **kwargs):
            # Só incrementa se a rota for a 'index'
            if f.__name__ == 'index':
                try:
                    visitor_row = db.session.get(Visitor, 1)
                    if not visitor_row:
                        # Se não existir, cria e define como 1
                        visitor_row = Visitor(id=1, count=1)
                        db.session.add(visitor_row)
                    else:
                        # Se existir, incrementa
                        visitor_row.count = (visitor_row.count or 0) + 1
                    
                    db.session.commit()
                except Exception as e:
                    db.session.rollback()
                    logger.error(f"Erro ao incrementar visitantes (SQLAlchemy): {e}")
            return f(*args, **kwargs)
        return decorated

    # --- ROTAS DE PÁGINAS HTML (SVM - Site Público) ---
    @app.route('/')
    @track_visitors  # Agora usa o decorator corrigido
    def index():
        return render_template('svm/index.html')

    @app.route('/downloads.html')
    def downloads():
        return render_template('svm/downloads.html')

    @app.route('/history.html')
    def history():
        return render_template('svm/history.html')
        
    @app.route('/bible.html')
    def bible():
        return render_template('svm/bible.html')

    # --- ROTAS SGI (Sistema de Gestão) - (INSEGURAS, NECESSITAM LOGIN) ---

    @app.route('/sgi/home.html')
    def sgi_home():
        # (Futuramente, protegeremos esta rota)
        return render_template('sgi/home.html')

    @app.route('/sgi/login.html')
    def sgi_login():
        return render_template('sgi/login.html')

    # Rotas SGI/CAD
    @app.route('/sgi/cad/cadagendas.html')
    def sgi_cad_agendas():
        # (Futuramente, protegeremos esta rota)
        return render_template('sgi/cad/cadagendas.html')

    @app.route('/sgi/cad/cadclasseebd.html')
    def sgi_cad_classeebd():
        # (Futuramente, protegeremos esta rota)
        return render_template('sgi/cad/cadclasseebd.html')

    @app.route('/sgi/cad/cadeventos.html')
    def sgi_cad_eventos():
        # (Futuramente, protegeremos esta rota)
        return render_template('sgi/cad/cadeventos.html')

    @app.route('/sgi/cad/cadfinancas.html')
    def sgi_cad_financas():
        # (Futuramente, protegeremos esta rota)
        return render_template('sgi/cad/cadfinancas.html')

    @app.route('/sgi/cad/cadkids.html')
    def sgi_cad_kids():
        # (Futuramente, protegeremos esta rota)
        return render_template('sgi/cad/cadkids.html')

    @app.route('/sgi/cad/cadmembros.html')
    def sgi_cad_membros():
        # (Futuramente, protegeremos esta rota)
        return render_template('sgi/cad/cadmembros.html')

    @app.route('/sgi/cad/cadoficiais.html')
    def sgi_cad_oficiais():
        # (Futuramente, protegeremos esta rota)
        return render_template('sgi/cad/cadoficiais.html')

    @app.route('/sgi/cad/cadpatrimonio.html')
    def sgi_cad_patrimonio():
        # (Futuramente, protegeremos esta rota)
        return render_template('sgi/cad/cadpatrimonio.html')

    @app.route('/sgi/cad/cadpublicacoes.html')
    def sgi_cad_publicacoes():
        # (Futuramente, protegeremos esta rota)
        return render_template('sgi/cad/cadpublicacoes.html')

    @app.route('/sgi/cad/cadsociedades.html')
    def sgi_cad_sociedades():
        # (Futuramente, protegeremos esta rota)
        return render_template('sgi/cad/cadsociedades.html')

    # ... (Restante das rotas SGI/DASH e SGI/PESQ) ...
    # (O ideal é adicionar proteção de login em todas elas)

    @app.route('/sgi/user/perfuser.html')
    def sgi_user_perfuser():
        # (Futuramente, protegeremos esta rota)
        return render_template('sgi/user/perfuser.html')


    # --- ROTAS DE API PÚBLICAS (SVM) ---

    # API de Tradução (DeepL)
    @app.route('/api/translate', methods=['POST'])
    def translate_text():
        if not translator:
            return jsonify({'error': 'API de tradução não configurada no servidor.'}), 503

        data = request.json
        text_to_translate = data.get('text')
        target_lang = data.get('target_lang', 'EN-US') # Ex: 'EN-US', 'ES'

        if not text_to_translate:
            return jsonify({'error': 'Nenhum texto fornecido'}), 400

        try:
            result = translator.translate_text(text_to_translate, target_lang=target_lang)
            return jsonify({'translation': result.text})
        except deepl.DeepLException as e:
            logger.error(f"Erro na API DeepL: {e}")
            return jsonify({'error': f'Erro da API DeepL: {str(e)}'}), 500
        except Exception as e:
            logger.error(f"Erro inesperado na tradução: {e}")
            return jsonify({'error': 'Erro interno ao traduzir.'}), 500
            
    # API do Tocador de Música (Hardcoded por enquanto)
    @app.route('/api/music')
    def get_music_playlist():
        # Futuramente, isso pode vir de um modelo 'Musica' ou 'Publicacao' no BD
        playlist = [
            {'title': 'Hino 001 - HNC', 'videoId': 'YOUTUBE_ID_1'},
            {'title': 'Hino 123 - HNC', 'videoId': 'YOUTUBE_ID_2'},
            {'title': 'Pregação Domingo', 'videoId': 'YOUTUBE_ID_3'}
        ]
        return jsonify(playlist)

    # API de Publicações (Editoriais, Notícias, Devocionais)
    @app.route('/api/publicacoes')
    def get_publicacoes():
        try:
            # Permite filtrar por tipo: /api/publicacoes?tipo=Devocional
            tipo_pub = request.args.get('tipo')
            query = Publicacao.query.order_by(desc(Publicacao.data_publicacao))

            if tipo_pub:
                # Use 'ilike' para busca case-insensitive
                query = query.filter(Publicacao.tipo.ilike(f'%{tipo_pub}%'))
            
            publicacoes = query.limit(10).all() # Pega as 10 mais recentes
            
            results = [{
                'id': p.id,
                'titulo': p.titulo,
                'conteudo': p.conteudo,
                'autor': p.autor,
                'tipo': p.tipo,
                'data_publicacao': p.data_publicacao.isoformat()
            } for p in publicacoes]
            
            return jsonify(results)
        except Exception as e:
            logger.error(f"Erro ao buscar publicações: {e}")
            return jsonify({"error": "Erro interno ao buscar publicações"}), 500

    # API de Eventos (Agenda/Calendário)
    @app.route('/api/eventos')
    def get_eventos():
        try:
            # Ordena por data do evento
            eventos = Evento.query.order_by(Evento.data_evento).all()
            
            results = [{
                'id': e.id,
                'titulo': e.titulo,
                'data_evento': e.data_evento.isoformat(), # Formato ISO (JS entende)
                'local': e.local,
                'descricao': e.descricao
            } for e in eventos]
            
            return jsonify(results)
        except Exception as e:
            logger.error(f"Erro ao buscar eventos: {e}")
            return jsonify({"error": "Erro interno ao buscar eventos"}), 500

    # API da Bíblia (Rotas existentes mantidas)
    @app.route('/api/random-verse')
    def get_random_verse():
        try:
            # Nota: BIBLE_API_URL precisa estar no seu Config.py
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

    # API de Contagem de Visitantes (Corrigida para SQLAlchemy)
    @app.route('/visitor-count')
    def visitor_count():
        try:
            count = get_visitor_count_internal()
            return jsonify({'count': count})
        except Exception as e:
            logger.error(f"Erro ao buscar contagem de visitantes (SQLAlchemy): {e}")
            return jsonify({'count': 0}), 500 # Retorna 0 em caso de erro
        
    # APIs Públicas (Existentes)
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


    # --- ROTAS DE API DE GERENCIAMENTO (SGI - INSEGURAS) ---

    # API SGI: Membros (Existente)
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
            return jsonify({'success': False, 'message': 'Erro interno ao salvar no banco de dados.'}), 500

    # API SGI: Busca de Membros (Existente)
    @app.route('/sgi/api/membros/search')
    def search_membros():
        # (Futuramente, protegeremos esta rota)
        query = request.args.get('q', '')
        if not query:
            return jsonify([])
        membros = Membro.query.filter(Membro.nome_completo.ilike(f'%{query}%')).limit(10).all()
        results = [{'id': membro.id, 'nome_completo': membro.nome_completo} for membro in membros]
        return jsonify(results)

    # API SGI: Oficiais (Existente)
    @app.route('/sgi/api/oficiais', methods=['POST'])
    def add_oficial():
        # (Futuramente, protegeremos esta rota)
        data = request.form
        membro_id = data.get('membro_id')
        
        if not membro_id:
            return jsonify({'success': False, 'message': 'É necessário selecionar um membro válido.'}), 400
        
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

    # --- NOVO: API SGI CRUD para Publicações ---

    @app.route('/sgi/api/publicacoes', methods=['POST'])
    def add_publicacao():
        # (Futuramente, protegeremos esta rota)
        data = request.json
        try:
            nova_publicacao = Publicacao(
                titulo=data.get('titulo'),
                conteudo=data.get('conteudo'),
                autor=data.get('autor'),
                tipo=data.get('tipo') # 'Devocional', 'Notícia', 'Artigo'
            )
            db.session.add(nova_publicacao)
            db.session.commit()
            return jsonify({'success': True, 'message': 'Publicação cadastrada com sucesso!'})
        except Exception as e:
            db.session.rollback()
            logger.error(f"Erro ao cadastrar publicação: {e}")
            return jsonify({'success': False, 'message': 'Erro interno ao salvar.'}), 500
    
    # (Adicione também rotas PUT e DELETE para publicações)

    # --- NOVO: API SGI CRUD para Eventos (Agenda) ---
    
    @app.route('/sgi/api/eventos', methods=['POST'])
    def add_evento():
        # (Futuramente, protegeremos esta rota)
        data = request.json
        try:
            novo_evento = Evento(
                titulo=data.get('titulo'),
                data_evento=data.get('data_evento'), # Espera formato ISO (ex: "2025-12-31T19:00:00")
                local=data.get('local'),
                descricao=data.get('descricao')
            )
            db.session.add(novo_evento)
            db.session.commit()
            return jsonify({'success': True, 'message': 'Evento cadastrado com sucesso!'})
        except Exception as e:
            db.session.rollback()
            logger.error(f"Erro ao cadastrar evento: {e}")
            return jsonify({'success': False, 'message': 'Erro interno ao salvar.'}), 500

    @app.route('/sgi/api/eventos/<int:id>', methods=['PUT'])
    def update_evento(id):
        # (Futuramente, protegeremos esta rota)
        evento = db.session.get(Evento, id)
        if not evento:
            return jsonify({'success': False, 'message': 'Evento não encontrado.'}), 404
        
        data = request.json
        try:
            evento.titulo = data.get('titulo', evento.titulo)
            evento.data_evento = data.get('data_evento', evento.data_evento)
            evento.local = data.get('local', evento.local)
            evento.descricao = data.get('descricao', evento.descricao)
            db.session.commit()
            return jsonify({'success': True, 'message': 'Evento atualizado com sucesso!'})
        except Exception as e:
            db.session.rollback()
            logger.error(f"Erro ao atualizar evento: {e}")
            return jsonify({'success': False, 'message': 'Erro interno ao atualizar.'}), 500

    @app.route('/sgi/api/eventos/<int:id>', methods=['DELETE'])
    def delete_evento(id):
        # (Futuramente, protegeremos esta rota)
        evento = db.session.get(Evento, id)
        if not evento:
            return jsonify({'success': False, 'message': 'Evento não encontrado.'}), 404
        
        try:
            db.session.delete(evento)
            db.session.commit()
            return jsonify({'success': True, 'message': 'Evento deletado com sucesso!'})
        except Exception as e:
            db.session.rollback()
            logger.error(f"Erro ao deletar evento: {e}")
            return jsonify({'success': False, 'message': 'Erro interno ao deletar.'}), 500