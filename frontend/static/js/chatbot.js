// Configuração das respostas do chatbot (Pode ser transferido para um JSON ou API em um projeto maior)
const botResponses = {
    horarios: {
        keywords: ['1', 'horário', 'horarios', 'culto', 'cultos', 'agenda'],
        response: 'Os cultos acontecem nos seguintes horários:\n- Domingo: Escola Dominical às 10:00 e Culto Solene às 19:00\n- Terça-feira: Congregação Vila Jason Alves às 19:30\n- Quarta-feira: Culto de Oração às 19:30\n- Sexta-feira: Culto de Doutrina às 19:30'
    },
    oracao: {
        keywords: ['2', 'oração', 'oracao', 'orar', 'pedido'],
        response: 'Ficarei feliz em ajudar com seu pedido de oração! Clique aqui para enviar seu pedido diretamente ao Pastor Josué: https://wa.me/5575991437628'
    },
    doacao: {
        keywords: ['3', 'doar', 'doação', 'doacao', 'ofertar', 'dizimo', 'contribuir'],
        response: 'Para fazer uma doação à igreja, você pode usar:\nPIX: (chave a ser fornecida)\nConta Bancária: (dados a serem fornecidos)\nSua contribuição é muito importante para nossa missão!'
    },
    visita: {
        keywords: ['4', 'visita', 'pastor', 'conversar', 'encontro', 'reunião'],
        response: 'Que bom que você quer agendar uma visita pastoral! Clique aqui para falar diretamente com o Pastor Josué: https://wa.me/5575991437628'
    },
    sobre: {
        keywords: ['5', 'sobre', 'história', 'missão', 'ipb'],
        response: 'A Igreja Presbiteriana em Palmeiras (IPB) tem a missão de glorificar a Deus. Somos uma comunidade de fé histórica e reformada. Nossa visão é expandir o Reino de Cristo em nossa cidade. Navegue pelo nosso site para saber mais!'
    },
    default: {
        keywords: [],
        response: "Olá! Eu sou Sarcinha, o assistente virtual da IPB Palmeiras. Como posso te ajudar hoje?\n\nDigite o número ou a palavra-chave de sua dúvida:\n1. **Horários de Culto**\n2. **Pedido de Oração**\n3. **Doações/Dízimo**\n4. **Agendar Visita**\n5. **Sobre a Igreja**"
    }
};

class Chatbot {
    constructor() {
        this.inputField = document.getElementById('chat-input');
        this.sendButton = document.getElementById('chat-send-button');
        
        this.setupEventListeners();
        this.addWelcomeMessage();
    }

    /**
     * Configura os listeners para o campo de entrada e botão de envio.
     */
    setupEventListeners() {
        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => this.processInput());
        }
        if (this.inputField) {
            this.inputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.processInput();
                }
            });
        }
    }

    /**
     * Adiciona a mensagem de boas-vindas do bot ao inicializar.
     */
    addWelcomeMessage() {
        setTimeout(() => {
            this.addMessage('bot', botResponses.default.response);
        }, 500);
    }

    /**
     * Adiciona uma mensagem à interface do chat.
     * @param {string} type - 'bot' ou 'user'.
     * @param {string} text - O conteúdo da mensagem.
     */
    addMessage(type, text) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        
        // Classes Tailwind para estilização de acordo com o tipo (bot ou user)
        const isBot = type === 'bot';
        const messageClasses = isBot 
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 flex items-start' 
            : 'bg-green-600 text-white';

        const alignmentClass = isBot ? 'text-left' : 'text-right';

        messageDiv.className = `mb-4 ${alignmentClass}`;
        
        messageDiv.innerHTML = `
            <div class="${messageClasses} inline-block rounded-lg p-3 max-w-[85%] shadow-md">
                ${isBot ? '<img src="/static/imgs/acs/sarcinha.png" alt="Sarcinha" class="w-8 h-8 rounded-full mr-2">' : ''}
                <div>${text.replace(/\n/g, '<br>')}</div>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Processa a entrada do usuário.
     */
    processInput() {
        if (!this.inputField) return;

        const input = this.inputField.value.trim();
        if (input === '') return;

        // 1. Adiciona a mensagem do usuário
        this.addMessage('user', input);
        
        // 2. Limpa o campo de entrada
        this.inputField.value = '';

        // 3. Processa e responde
        setTimeout(() => {
            const response = this.getResponse(input.toLowerCase());
            this.addMessage('bot', response);
        }, 500);
    }

    /**
     * Encontra a resposta do bot com base nas palavras-chave.
     * @param {string} input - A entrada do usuário em minúsculas.
     * @returns {string} - A resposta correspondente.
     */
    getResponse(input) {
        for (const key in botResponses) {
            if (key === 'default') continue; // Ignora a default por enquanto
            const category = botResponses[key];
            if (category.keywords.some(keyword => input.includes(keyword))) {
                return category.response;
            }
        }
        
        // Resposta para quando nenhuma palavra-chave for encontrada
        return 'Desculpe, não entendi sua pergunta. Por favor, tente reformular ou use as opções de 1 a 5 para me guiar.';
    }
}

// Inicializa o chatbot quando a janela estiver carregada
window.onload = function() {
    // Certifica-se de que a janela do chatbot está oculta por padrão (o CSS ou script.js cuida disso)
    // E só inicializa a lógica se os elementos da interface existirem
    if (document.getElementById('chat-input')) {
        new Chatbot();
    }
};
