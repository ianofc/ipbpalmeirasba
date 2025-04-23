# Dockerfile

FROM python:3.11-slim

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos do backend
COPY backend/ /app/

# Instalar dependências
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Expor a porta
EXPOSE 5000

# Comando para rodar o app
CMD ["python", "app.py"]
