from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import datetime

db = SQLAlchemy()

# --- Modelos do SGI (Sistema de Gestão da Igreja) ---

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(80), nullable=False, default='editor')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Membro(db.Model):
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
    tipo_membro = db.Column(db.String(50))
    status = db.Column(db.String(50), default='Ativo')
    foto_perfil_path = db.Column(db.String(255))
    observacoes = db.Column(db.Text)

class Oficial(db.Model):
    __tablename__ = 'oficiais'
    id = db.Column(db.Integer, primary_key=True)
    membro_id = db.Column(db.Integer, db.ForeignKey('membros.id'), nullable=False, unique=True)
    cargo = db.Column(db.String(50), nullable=False)
    data_ordenacao = db.Column(db.Date)
    mandato_inicio = db.Column(db.Date)
    mandato_fim = db.Column(db.Date)
    status_oficio = db.Column(db.String(50), default='Ativo')
    membro = db.relationship('Membro', backref=db.backref('oficio', uselist=False))

class SociedadeInterna(db.Model):
    __tablename__ = 'sociedades_internas'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False, unique=True) # Ex: "Sociedade Auxiliadora Feminina"
    sigla = db.Column(db.String(10), nullable=False, unique=True) # Ex: "SAF"
    presidente_id = db.Column(db.Integer, db.ForeignKey('membros.id'))
    logo_path = db.Column(db.String(255))
    
    presidente = db.relationship('Membro', foreign_keys=[presidente_id])

class ClasseEBD(db.Model):
    __tablename__ = 'classes_ebd'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False) # Ex: "Classe de Adultos"
    professor_id = db.Column(db.Integer, db.ForeignKey('membros.id'))

    professor = db.relationship('Membro', foreign_keys=[professor_id])

class Publicacao(db.Model):
    __tablename__ = 'publicacoes'
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    conteudo = db.Column(db.Text, nullable=False)
    autor = db.Column(db.String(100))
    tipo = db.Column(db.String(50), nullable=False) # 'Devocional', 'Notícia', 'Artigo'
    data_publicacao = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class Evento(db.Model):
    __tablename__ = 'eventos'
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    data_evento = db.Column(db.DateTime, nullable=False)
    local = db.Column(db.String(200))
    descricao = db.Column(db.Text)
    
# --- Modelos do SVM (Site Público) ---

class Visitor(db.Model):
    __tablename__ = 'visitors'
    id = db.Column(db.Integer, primary_key=True, default=1)
    count = db.Column(db.Integer, default=0)