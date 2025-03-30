from flask import Flask, jsonify, send_from_directory
import requests
from datetime import datetime
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

# Rota para obter a mensagem do dia
@app.route('/api/mensagem_do_dia', methods=['GET'])
def get_mensagem_do_dia():
    response = requests.get(app.config['BIBLE_API_URL'])
    if response.status_code == 200:
        return jsonify(response.json())
    return jsonify({"error": "Não foi possível obter a mensagem do dia."}), 500

# Rota para obter o endereço da igreja
@app.route('/api/endereco', methods=['GET'])
def get_endereco():
    return jsonify({"endereco": app.config['CHURCH_ADDRESS']})

# Rota para listar documentos
@app.route('/api/docs/<path:filename>', methods=['GET'])
def get_document(filename):
    return send_from_directory('src/docs', filename)

# Rota para obter eventos do calendário
@app.route('/api/calendario', methods=['GET'])
def get_calendario():
    params = {
        'api_key': app.config['CALENDARIFIC_API_KEY'],
        'country': 'BR',
        'year': datetime.now().year
    }
    response = requests.get(app.config['CALENDAR_API_URL'], params=params)
    if response.status_code == 200:
        return jsonify(response.json())
    return jsonify({"error": "Não foi possível obter os eventos do calendário."}), 500

# Rota para obter a playlist do Spotify
@app.route('/api/musica', methods=['GET'])
def get_musica():
    return jsonify({"playlist_url": "https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M"})

if __name__ == '__main__':
    app.run(debug=True)

