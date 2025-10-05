Perfeito, Ian 🙌
Como agora o projeto **usa Python (Flask)** e está **hospedado no DigitalOcean App Platform**, o README precisa refletir isso corretamente — incluindo o backend Flask, APIs REST, e a forma de rodar localmente.

Aqui está a **versão refeita e atualizada do README.md**, totalmente alinhada ao seu projeto real 👇

---

````markdown
# ⛪ Igreja Presbiteriana em Palmeiras

Um portal web completo da **Igreja Presbiteriana em Palmeiras-BA**, desenvolvido com **Python (Flask)**, oferecendo informações institucionais, versículos bíblicos, músicas, galeria de fotos, documentos e um assistente virtual cristão.

---

## ✨ Descrição Resumida

O projeto tem como objetivo facilitar o acesso dos membros e visitantes da **IPB Palmeiras** a conteúdos cristãos, agenda de cultos, histórico da igreja, downloads e muito mais — tudo de forma simples, moderna e acessível.

📍 **Público-alvo:** membros da igreja, visitantes e comunidade em geral.  
🌐 **Hospedagem:** DigitalOcean App Platform  
💾 **Banco de dados:** SQLite (local) — podendo ser migrado para PostgreSQL

---

## 🎬 Demonstração Online

Acesse a versão atual:  
🔗 [https://clownfish-app-suiwz.ondigitalocean.app](https://clownfish-app-suiwz.ondigitalocean.app)

---

## 🚀 Funcionalidades

- 📖 **Versículo diário automático** (via API)
- 🎵 **Player de músicas cristãs** (YouTube embutido)
- 🖼️ **Galeria de fotos dinâmica**
- 📄 **Downloads de documentos da igreja**
- 🗓️ **Agenda e eventos**
- 🤖 **Assistente Virtual “Sarcinha”**
- 🌗 **Alternância de temas** (claro, escuro e verde)
- 🌍 **Tradução automática de idiomas**
- 📊 **Contador de visitantes**
- 📚 **Leitura bíblica online** integrada à API
- 🕊️ **Design responsivo** e leve

---

## 🛠️ Tecnologias Utilizadas

### 🔹 Backend
- **Python 3.12**
- **Flask** – framework web principal
- **Flask-CORS** – controle de acesso entre front e back
- **Gunicorn** – servidor WSGI para deploy
- **Requests** – consumo de APIs externas
- **SQLite** – banco local (pode ser substituído por PostgreSQL)
- **Pillow (PIL)** – manipulação de imagens
- **DigitalOcean App Platform** – hospedagem em nuvem

### 🔹 Frontend
- **HTML5, CSS3 (TailwindCSS), JavaScript (ES6)**
- **APIs externas:** Bible API, YouTube Embed, Leaflet Maps
- **Font Awesome**, **Google Fonts**

---

## ⚙️ Instalação e Execução Local

### 🧩 Pré-requisitos
- Python 3.12+
- Pip (gerenciador de pacotes)
- Git instalado

### 🧠 Passos

```bash
# Clonar o repositório
git clone https://github.com/ianofc/ipbpalmeirasba.git

# Acessar o diretório do projeto
cd ipbpalmeirasba/backend

# Criar ambiente virtual (recomendado)
python -m venv venv
venv\Scripts\activate  # Windows
# ou
source venv/bin/activate  # Linux/Mac

# Instalar dependências
pip install -r ../requirements.txt

# Rodar localmente
python app.py
````

Abra no navegador:
➡️ [http://localhost:5000](http://localhost:5000)

---

## 🌐 Deploy na DigitalOcean

O deploy é automatizado via GitHub.
Cada push no branch `main` dispara um **rebuild** e **redeploy** automático.

### Configurações importantes:

* **Procfile:**

  ```
  web: gunicorn app:app --chdir backend --bind 0.0.0.0:$PORT
  ```
* **Variáveis de ambiente:**

  * `SECRET_KEY`
  * `PYTHON_VERSION=3.12`
  * (Opcional) `DATABASE_URL` se usar PostgreSQL

---

## 🧩 Estrutura de Pastas

```
ipbpalmeirasba/
├── backend/
│   ├── app.py              # Arquivo principal Flask
│   ├── routes.py           # Rotas e APIs
│   ├── config.py           # Configurações gerais
│   ├── data/               # Banco local e documentos
│   ├── templates/
│   │   └── index.html      # Página principal
│   └── static/
│       └── style.css       # Estilos e assets
│
├── frontend/
│   ├── src/                # Imagens, scripts e vídeos
│   └── imgs/               # Galeria
│
├── requirements.txt
├── Procfile
└── README.md
```

---

## 🤝 Como Contribuir

1. Faça um **fork** do repositório
2. Crie uma branch:

   ```bash
   git checkout -b minha-feature
   ```
3. Faça suas alterações e commit:

   ```bash
   git commit -m "feat: nova funcionalidade"
   ```
4. Envie ao seu fork:

   ```bash
   git push origin minha-feature
   ```
5. Abra um **Pull Request** 🚀

---

## 📄 Licença

Distribuído sob a **MIT License**.
Consulte o arquivo `LICENSE` para mais informações.

---

## 👤 Autor

**Ian S. A. Santos**
🔗 [GitHub](https://github.com/ianofc)
🔗 [LinkedIn](https://www.linkedin.com/in/iansantosdev/)
📞 [WhatsApp do pastor](https://wa.me/5575991437628)

---

## 📌 Roadmap Futuro

* 🔑 Área restrita para membros
* 📆 Integração com Google Calendar
* 📢 Notificações push de eventos
* 💬 Chat em tempo real com o assistente
* ☁️ Migração do SQLite para PostgreSQL
* 📱 Aplicativo mobile (Flutter)

---

> “Com efeito, grandes coisas fez o Senhor por nós; por isso, estamos alegres.” — *Salmo 126:3* 🙏

