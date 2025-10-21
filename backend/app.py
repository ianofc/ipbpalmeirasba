from flask import Flask, render_template
from flask_cors import CORS
from routes import register_routes
from config import Config
import os
# --- IMPORTS NOVOS ---
from dotenv import load_dotenv
from models import db # Importe o 'db' do seu models.py

# --- CARREGUE O .ENV ---
# Encontre o arquivo .env na pasta raiz (um nível acima do 'backend')
# Isso deve ser feito ANTES de criar o app, para que a Config leia as variáveis.
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

def create_app():
    # Cria app Flask
    app = Flask(
        __name__,
        template_folder=Config.FRONTEND_DIR,
        static_folder=Config.STATIC_DIR
    )

    # Carrega a configuração (que agora inclui a SQLALCHEMY_DATABASE_URI)
    app.config.from_object(Config)

    # --- INICIALIZE O DB ---
    # Conecta a instância do SQLAlchemy (o 'db') ao seu aplicativo Flask
    db.init_app(app)

    # CORS (somente domínios confiáveis)
    CORS(app, resources={r"/*": {"origins": [
        "https://clownfish-app-suiwz.ondigitalocean.app",
        "http://localhost:3000"
    ]}})

    # Registrar rotas
    register_routes(app)

    # --- (OPCIONAL) CRIAR TABELAS ---
    # Isso garante que as tabelas do models.py sejam criadas no banco
    # quando o app iniciar pela primeira vez.
    with app.app_context():
        db.create_all()

    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host="0.0.0.0", port=port, debug=True)