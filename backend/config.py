import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-change-in-prod'
    BIBLE_API_URL = "https://bible-api.com"
    BIBLE_VERSION = "almeida"
    CALENDAR_API_URL = "https://calendarific.com/api/v2/holidays"
    CALENDARIFIC_API_KEY = os.environ.get('CALENDARIFIC_API_KEY') or None
    CHURCH_ADDRESS = "Rua Coronel Antônio Afonso, 38, Palmeiras-BA"

    # Paths de mídia e dados
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATA_DIR = os.path.join(BASE_DIR, 'data')
    DOCUMENTS_DIR = os.path.join(DATA_DIR, 'documents')
    FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, '../frontend'))
    STATIC_DIR = os.path.join(FRONTEND_DIR, 'static')
    PHOTOS_DIR = os.path.join(STATIC_DIR, 'imgs', 'igr')
    VISITORS_DB = os.path.join(DATA_DIR, 'visitors.db')
