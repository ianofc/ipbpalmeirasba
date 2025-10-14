import os

class Config:
    # Suas configurações originais
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-change-in-prod'
    BIBLE_API_URL = "https://bible-api.com"
    BIBLE_VERSION = "almeida"
    CALENDAR_API_URL = "https://calendarific.com/api/v2/holidays"
    CALENDARIFIC_API_KEY = os.environ.get('CALENDARIFIC_API_KEY') or None
    CHURCH_ADDRESS = "Rua Coronel Antônio Afonso, 38, Palmeiras-BA"

    # --- CAMINHOS CORRIGIDOS E FINALIZADOS ---

    # Define o diretório base como a raiz do projeto (a pasta que contém 'frontend' e 'backend')
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

    # Caminhos para as pastas do frontend
    FRONTEND_DIR = os.path.join(BASE_DIR, 'frontend')
    STATIC_DIR = os.path.join(FRONTEND_DIR, 'static')

    # Aponta para a pasta de documentos correta
    DOCUMENTS_DIR = os.path.join(STATIC_DIR, 'docs')
    
    # Caminho para as fotos da galeria
    PHOTOS_DIR = os.path.join(STATIC_DIR, 'imgs', 'igr')
    
    # Caminhos para os dados do backend
    # Usando o __file__ para garantir que o caminho seja relativo à localização do config.py
    DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
    VISITORS_DB = os.path.join(DATA_DIR, 'visitors.db')
