from flask import Flask, render_template, jsonify, send_from_directory
from flask_cors import CORS  # Importando CORS
import requests 
import os 
from datetime import datetime

app = Flask(__name__)
CORS(app)

BIBLE_API_BASE = "https://bible-api.com"

@app.route('/')
def serve_index():
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('../frontend', path)

@app.route('/api/books', methods=['GET'])
def get_books():
    books = [
        "Gênesis", "Êxodo", "Levítico", "Números", "Deuteronômio",
        "Josué", "Juízes", "Rute", "1 Samuel", "2 Samuel", "1 Reis",
        "2 Reis", "1 Crônicas", "2 Crônicas", "Esdras", "Neemias",
        "Ester", "Jó", "Salmos", "Provérbios", "Eclesiastes",
        "Cânticos", "Isaías", "Jeremias", "Lamentações", "Ezequiel",
        "Daniel", "Oséias", "Joel", "Amós", "Obadias", "Jonas",
        "Miquéias", "Naum", "Habacuque", "Sofonias", "Ageu",
        "Zacarias", "Malaquias", "Mateus", "Marcos", "Lucas", "João",
        "Atos", "Romanos", "1 Coríntios", "2 Coríntios", "Gálatas",
        "Efésios", "Filipenses", "Colossenses", "1 Tessalonicenses",
        "2 Tessalonicenses", "1 Timóteo", "2 Timóteo", "Tito",
        "Filemom", "Hebreus", "Tiago", "1 Pedro", "2 Pedro",
        "1 João", "2 João", "3 João", "Judas", "Apocalipse"
    ]
    return jsonify(books)

@app.route('/api/chapters/<book>', methods=['GET'])
def get_chapters(book):
    chapters = {
        "Gênesis": 50, "Êxodo": 40, "Levítico": 27, "Números": 36,
        "Deuteronômio": 34, "Josué": 24, "Juízes": 21, "Rute": 4,
        "1 Samuel": 31, "2 Samuel": 24, "1 Reis": 22, "2 Reis": 25,
        "1 Crônicas": 29, "2 Crônicas": 36, "Esdras": 10, "Neemias": 13,
        "Ester": 10, "Jó": 42, "Salmos": 150, "Provérbios": 31,
        "Eclesiastes": 12, "Cânticos": 8, "Isaías": 66, "Jeremias": 52,
        "Lamentações": 5, "Ezequiel": 48, "Daniel": 12, "Oséias": 14,
        "Joel": 3, "Amós": 9, "Obadias": 1, "Jonas": 4, "Miquéias": 7,
        "Naum": 3, "Habacuque": 3, "Sofonias": 3, "Ageu": 2,
        "Zacarias": 14, "Malaquias": 4, "Mateus": 28, "Marcos": 16,
        "Lucas": 24, "João": 21, "Atos": 28, "Romanos": 16,
        "1 Coríntios": 16, "2 Coríntios": 13, "Gálatas": 6,
        "Efésios": 6, "Filipenses": 4, "Colossenses": 4,
        "1 Tessalonicenses": 5, "2 Tessalonicenses": 3, "1 Timóteo": 6,
        "2 Timóteo": 4, "Tito": 3, "Filemom": 1, "Hebreus": 13,
        "Tiago": 5, "1 Pedro": 5, "2 Pedro": 3, "1 João": 5,
        "2 João": 1, "3 João": 1, "Judas": 1, "Apocalipse": 22
    }
    return jsonify(chapters.get(book, 0))

@app.route('/api/verse/<book>/<chapter>', methods=['GET'])
def get_verse(book, chapter):
    try:
        # Converte nome do livro para formato da API
        book_map = {
            "Gênesis": "genesis", "Êxodo": "exodus", "João": "john",
            # Adicione mais mapeamentos conforme necessário
        }
        api_book = book_map.get(book, book.lower())
        
        response = requests.get(
            f"{BIBLE_API_BASE}/{api_book}+{chapter}?translation=almeida"
        )
        data = response.json()
        return jsonify({
            "text": data["text"],
            "reference": f"{book} {chapter}"
        })
    except Exception as e:
        return jsonify({
            "error": "Versículo não encontrado",
            "text": "Erro ao carregar o texto bíblico."
        }), 404

@app.route('/random_verse', methods=['GET'])
def random_verse():
    try:
        response = requests.get(f"{BIBLE_API_BASE}/random/OT,NT?translation=almeida")
        data = response.json()
        return jsonify({
            "reference": data["reference"],
            "text": data["text"]
        })
    except Exception as e:
        return jsonify({
            "reference": "João 3:16",
            "text": "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna."
        })


# Rota para obter o endereço da igreja

# Rota para listar documentos

# Rota para obter eventos do calendário


# Rota para obter a playlist do Spotify


    
if __name__ == '__main__':
    app.run(debug=True)
    