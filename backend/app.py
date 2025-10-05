   from flask import Flask
   from flask_cors import CORS
   import os
   from routes import register_routes
   from config import Config

   def create_app():
       BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # backend/
       FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, '../frontend'))  # ../frontend
       STATIC_DIR = os.path.join(FRONTEND_DIR, 'src')  # ../frontend/src

       # Verifique se diretórios existem (log erro se não)
       if not os.path.exists(FRONTEND_DIR):
           print(f"ERRO: Frontend dir não encontrado: {FRONTEND_DIR}")
           # Fallback: sirva um erro simples
           from flask import render_template_string
           return Flask(__name__), render_template_string("<h1>Erro: Frontend não encontrado</h1>")

       app = Flask(
           __name__,
           template_folder=FRONTEND_DIR,  # Agora absoluto
           static_folder=STATIC_DIR
       )

       app.config.from_object(Config)

       # CORS: Restrinja para seu domínio em prod
       CORS(app, resources={r"/*": {"origins": ["https://clownfish-app-suiwz.ondigitalocean.app", "http://localhost:3000"]}})

       # Registrar rotas
       register_routes(app)

       return app

   app = create_app()

   if __name__ == "__main__":
       port = int(os.environ.get('PORT', 5000))
       app.run(host="0.0.0.0", port=port, debug=True)  # debug só local
   
