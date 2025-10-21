from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import datetime
from datetime import date # Importação específica para campos Date

# Inicializa a extensão SQLAlchemy
db = SQLAlchemy()

# --- Modelos do SGI (Sistema de Gestão da Igreja) ---

class User(db.Model):
    """ Modelo para usuários administrativos do SGI (login) """
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    # Corrigido para 512 para acomodar hashes mais longos
    password_hash = db.Column(db.String(512), nullable=False) 
    role = db.Column(db.String(80), nullable=False, default='editor')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Membro(db.Model):
    """ Modelo central para os membros da igreja """
    __tablename__ = 'membros'
    id = db.Column(db.Integer, primary_key=True)
    nome_completo = db.Column(db.String(200), nullable=False)
    data_nascimento = db.Column(db.Date)
    endereco = db.Column(db.String(255))
    telefone = db.Column(db.String(20))
    estado_civil = db.Column(db.String(50))
    data_batismo = db.Column(db.Date)
    igreja_batismo = db.Column(db.String(150))
    data_profissao_fe = db.Column(db.Date)
    tipo_membro = db.Column(db.String(50)) # Ex: 'Comungante', 'Não-Comungante'
    status = db.Column(db.String(50), default='Ativo') # Ex: 'Ativo', 'Inativo', 'Transferido'
    foto_perfil_path = db.Column(db.String(255))
    observacoes = db.Column(db.Text)

class Oficial(db.Model):
    """ Modelo para oficiais (Pastores, Presbíteros, Diáconos) """
    __tablename__ = 'oficiais'
    id = db.Column(db.Integer, primary_key=True)
    membro_id = db.Column(db.Integer, db.ForeignKey('membros.id'), nullable=False, unique=True)
    cargo = db.Column(db.String(50), nullable=False) # 'Pastor', 'Presbítero', 'Diácono'
    data_ordenacao = db.Column(db.Date)
    mandato_inicio = db.Column(db.Date)
    mandato_fim = db.Column(db.Date)
    status_oficio = db.Column(db.String(50), default='Ativo')
    
    # Relacionamento 1-para-1 com Membro
    membro = db.relationship('Membro', backref=db.backref('oficio', uselist=False))

class SociedadeInterna(db.Model):
    """ Modelo para as sociedades (SAF, UPH, UMP, UPA, UCP) """
    __tablename__ = 'sociedades_internas'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False, unique=True) # Ex: "Sociedade Auxiliadora Feminina"
    sigla = db.Column(db.String(10), nullable=False, unique=True) # Ex: "SAF"
    presidente_id = db.Column(db.Integer, db.ForeignKey('membros.id'))
    logo_path = db.Column(db.String(255))
    
    # Sugestão de backref adicionada
    presidente = db.relationship('Membro', foreign_keys=[presidente_id], 
                                backref=db.backref('sociedade_presidida', uselist=False))

class ClasseEBD(db.Model):
    """ Modelo para as classes da Escola Bíblica Dominical """
    __tablename__ = 'classes_ebd'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False) # Ex: "Classe de Adultos"
    professor_id = db.Column(db.Integer, db.ForeignKey('membros.id'))

    # Sugestão de backref adicionada
    professor = db.relationship('Membro', foreign_keys=[professor_id], 
                               backref='classes_lecionadas')

class Publicacao(db.Model):
    """ Modelo para Notícias, Artigos e Devocionais do SVM """
    __tablename__ = 'publicacoes'
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    conteudo = db.Column(db.Text, nullable=False)
    autor = db.Column(db.String(100))
    tipo = db.Column(db.String(50), nullable=False) # 'Devocional', 'Notícia', 'Artigo'
    data_publicacao = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class Evento(db.Model):
    """ Modelo para eventos e agenda da igreja (visível no SVM) """
    __tablename__ = 'eventos'
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    data_evento = db.Column(db.DateTime, nullable=False)
    local = db.Column(db.String(200))
    descricao = db.Column(db.Text)

# --- (NOVOS MODELOS SGI) ---

class Conta(db.Model):
    """ (NOVO) Contas financeiras ou centros de custo (Ex: Dízimos, Ofertas, Manutenção) """
    __tablename__ = 'contas'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False, unique=True)
    tipo = db.Column(db.String(50), nullable=False, default='Receita') # 'Receita' ou 'Despesa'
    descricao = db.Column(db.Text)

class Transacao(db.Model):
    """ (NOVO) Registros de entradas e saídas financeiras """
    __tablename__ = 'transacoes'
    id = db.Column(db.Integer, primary_key=True)
    descricao = db.Column(db.String(255), nullable=False)
    valor = db.Column(db.Float, nullable=False)
    data = db.Column(db.Date, nullable=False, default=date.today)
    tipo_transacao = db.Column(db.String(50), nullable=False) # 'Entrada' ou 'Saída'
    
    # Chave estrangeira para a Conta (Centro de Custo)
    conta_id = db.Column(db.Integer, db.ForeignKey('contas.id'), nullable=False)
    conta = db.relationship('Conta', backref=db.backref('transacoes', lazy=True))
    
    # Chave estrangeira opcional para Membro (Ex: registro de dízimo)
    membro_id = db.Column(db.Integer, db.ForeignKey('membros.id'))
    membro = db.relationship('Membro', backref=db.backref('transacoes_financeiras', lazy=True))

class ItemPatrimonio(db.Model):
    """ (NOVO) Itens do inventário/patrimônio da igreja """
    __tablename__ = 'patrimonio'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(150), nullable=False)
    descricao = db.Column(db.Text)
    data_aquisicao = db.Column(db.Date)
    valor_estimado = db.Column(db.Float)
    localizacao = db.Column(db.String(100)) # Ex: 'Salão Social', 'Secretaria'
    status = db.Column(db.String(50), default='Em uso') # Ex: 'Em uso', 'Manutenção', 'Baixado'

class AgendaCulto(db.Model):
    """ (NOVO) Para gerenciar a agenda de cultos, boletins ou liturgia """
    __tablename__ = 'agendas_culto'
    id = db.Column(db.Integer, primary_key=True)
    data_culto = db.Column(db.Date, nullable=False, unique=True)
    periodo = db.Column(db.String(50)) # Ex: 'Matutino', 'Vespertino', 'Noturno'
    tema_sermao = db.Column(db.String(200))
    texto_biblico = db.Column(db.String(100))
    anuncios = db.Column(db.Text)
    ordem_culto = db.Column(db.Text) # Armazena a liturgia (acolhida, hinos, etc.)
    
    # Pode ser um membro (pastor) ou um convidado (string)
    pregador_membro_id = db.Column(db.Integer, db.ForeignKey('membros.id'))
    pregador_convidado = db.Column(db.String(150)) 
    
    pregador = db.relationship('Membro', foreign_keys=[pregador_membro_id])

# --- Modelos do SVM (Site Público) ---

class Visitor(db.Model):
    """ Modelo para contagem de visitantes únicos (Corrigido) """
    __tablename__ = 'visitors'
    # Corrigido: Removido 'default=1' para permitir auto-incremento padrão
    id = db.Column(db.Integer, primary_key=True) 
    count = db.Column(db.Integer, default=0)
# (Corrigido: Removida a chave '}' extra que causava erro de sintaxe)

class Documento(db.Model):
    """ (NOVO) Para gerenciar os arquivos da página 'Downloads' do site público """
    __tablename__ = 'documentos'
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    descricao = db.Column(db.Text)
    categoria = db.Column(db.String(50)) # Ex: 'Símbolos de Fé', 'História', 'Manuais'
    # Caminho para o arquivo estático (ex: /static/docs/Confissao_de_Westminster.pdf)
    file_path = db.Column(db.String(255), nullable=False) 
    data_upload = db.Column(db.DateTime, default=datetime.datetime.utcnow)