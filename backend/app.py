from flask import Flask, render_template
from flask_cors import CORS
from routes import register_routes
from config import Config
import os

def create_app():
    # Cria app Flask
    app = Flask(
        __name__,
        template_folder=Config.FRONTEND_DIR,
        static_folder=Config.STATIC_DIR
    )

    app.config.from_object(Config)

    # CORS (somente domínios confiáveis)
    CORS(app, resources={r"/*": {"origins": [
        "https://clownfish-app-suiwz.ondigitalocean.app",
        "http://localhost:3000"
    ]}})

    # Registrar rotas
    register_routes(app)

    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
