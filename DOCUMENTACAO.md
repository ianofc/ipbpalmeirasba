# Documentação Técnica — Igreja Presbiteriana em Palmeiras

## 1. Visão Geral do Projeto

Portal web para divulgação institucional, conteúdos cristãos, interação e serviços para membros e visitantes da IPB Palmeiras-BA.

**Objetivo:** Facilitar o acesso à informação, promover integração e oferecer recursos digitais à comunidade.

**Problema resolvido:** Centralização de informações, automação de conteúdos e comunicação eficiente.

---

## 2. Arquitetura do Sistema

- **Frontend:** HTML, CSS (Tailwind), JS (ES6)
- **Backend:** Python (API REST)
- **APIs externas:** Bible API, YouTube, Google Calendar, Leaflet
- **Estrutura de pastas:**
  ```
  frontend/
    static/
      css/
      js/
      imgs/
      apis/
    index.html
  backend/
    (rotas, controllers, models)
  ```

**Fluxo:** Usuário acessa frontend → solicita dados via JS → backend responde (ou API externa) → renderização dinâmica.

---

## 3. Guia de Uso

- Acesse o site.
- Navegue pelo menu para acessar: cultos, eventos, galeria, downloads, bíblia, contato.
- Use o player de música, chatbot, contador de visitantes, troca de tema e tradução.
- Para baixar documentos, clique em "Downloads".
- Para ler a bíblia, selecione livro/capítulo.

---

## 4. Guia para Desenvolvedores

- Clone o repositório.
- Instale dependências com `npm install`.
- Rode o backend com `npm start` (ou `node backend/index.js`).
- Edite arquivos em `frontend/static/` para customizações.
- Scripts principais: `frontend/static/js/script.js`, `frontend/static/js/chatbot.js`.

---

## 5. API

### Endpoints principais:

- `/random_verse` — Versículo aleatório (GET)
- `/api/music` — Lista de músicas (GET)
- `/api/photos` — Galeria de fotos (GET)
- `/api/documents` — Documentos para download (GET)
- `/visitor-count` — Contador de visitantes (GET)

**Exemplo de resposta:**
```json
{
  "reference": "João 3:16",
  "text": "Porque Deus amou o mundo..."
}
```

**Status codes:** 200 (OK), 500 (erro interno), 404 (não encontrado)

---

## 6. Banco de Dados

- Estrutura simples (JSON ou MongoDB)
- Tabelas/coleções: music, photos, documents, visitors
- Relacionamentos: não-relacional, cada entidade independente

---

## 7. Testes

- Testes manuais via navegador e Postman.
- Scripts de teste automatizado podem ser adicionados (Jest, Cypress).

---

## 8. Segurança

- Validação de entradas no backend.
- CORS habilitado para APIs públicas.
- Sem dados sensíveis no frontend.
- Uso de HTTPS recomendado em produção.

---

## 9. Roadmap / Atualizações

- [ ] Área restrita para membros
- [ ] Notificações push
- [ ] Integração com agenda Google
- [x] Chatbot virtual
- [x] Leitura bíblica online

---

## 10. FAQ / Problemas Conhecidos

**Q:** O player de música não carrega?
**A:** Verifique conexão com YouTube e backend.

**Q:** Versículo não aparece?
**A:** API pode estar fora do ar, fallback local será usado.

**Q:** Como trocar o tema?
**A:** Clique no ícone de tinta no topo do site.

**Q:** Como traduzir o site?
**A:** Clique na bandeira do idioma desejado.

---

**Dúvidas adicionais:** abra uma issue ou contate o administrador.
