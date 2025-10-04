from flask import Flask
from flask_cors import CORS
import os
from routes import register_routes
from config import Config

def create_app():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    app = Flask(
        __name__,
        template_folder=os.path.join(BASE_DIR, '../frontend'),
        static_folder=os.path.join(BASE_DIR, '../frontend/src')
    )

    app.config.from_object(Config)

    # Permitir requisições de qualquer origem (ajuste se quiser limitar depois)
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Registrar rotas
    register_routes(app)

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host="0.0.0.0", port=port)
