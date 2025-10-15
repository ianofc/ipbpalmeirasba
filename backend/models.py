from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

# Inicializa a extensão, mas sem conectar a um app ainda.
db = SQLAlchemy()

# --- Modelos do SGI ---

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(80), nullable=False, default='editor') # Ex: admin, pastor, tesoureiro

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Membro(db.Model):
    __tablename__ = 'membros'
    id = db.Column(db.Integer, primary_key=True)
    nome_completo = db.Column(db.String(200), nullable=False)
    data_nascimento = db.Column(db.Date)
    cpf = db.Column(db.String(14), unique=True)
    rg = db.Column(db.String(20))
    endereco = db.Column(db.String(255))
    telefone = db.Column(db.String(20))
    email = db.Column(db.String(120), unique=True)
    estado_civil = db.Column(db.String(50))
    data_batismo = db.Column(db.Date)
    igreja_batismo = db.Column(db.String(150))
    data_profissao_fe = db.Column(db.Date)
    tipo_membro = db.Column(db.String(50)) # Comungante, Não-Comungante
    status = db.Column(db.String(50), default='Ativo') # Ativo, Inativo, Transferido
    foto_perfil_path = db.Column(db.String(255))
    observacoes = db.Column(db.Text)

# --- Modelos do SVM (Site Público) ---
class Visitor(db.Model):
    # ... (modelos de Visitor, Editorial, etc. que criamos antes) ...