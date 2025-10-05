   import os

   class Config:
       SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-change-in-prod'
       BIBLE_API_URL = "https://bible-api.com"
       BIBLE_VERSION = "almeida"
       CALENDAR_API_URL = "https://calendarific.com/api/v2/holidays"
       CALENDARIFIC_API_KEY = os.environ.get('CALENDARIFIC_API_KEY') or None
       CHURCH_ADDRESS = "Rua Coronel Antônio Afonso, 38, Palmeiras-BA"  # Consistente
   
