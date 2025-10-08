// Sarcinha.js

import { initialMessage } from './botResponses.js';
import { ResponseManager } from './ChatbotCore.js';

export class Sarcinha {
    constructor() {
        this.responseManager = new ResponseManager();
        this.createChatInterface();
        this.initializeEventListeners();
    }

    createChatInterface() {
        // O código de criação da interface (DOM/HTML) permanece o mesmo.
        const chatContainer = document.createElement('div');
        chatContainer.innerHTML = `
            <div class="fixed bottom-2 right-4 z-50">
                <div id="chat-window" class="hidden bg-white rounded-lg shadow-xl w-80">
                    <div class="bg-green-700 text-white p-4 rounded-t-lg flex items-center">
                        <img static="/static/imgs/acs/sarcinha.png" alt="Sarcinha" class="w-10 h-10 rounded-full mr-3">
                        <span class="flex-grow">Sarcinha - Assistente Virtual</span>
                        <button id="close-chat" class="text-white hover:text-gray-300">×</button>
                    </div>
                    <div id="chat-messages" class="h-96 overflow-y-auto p-4"></div>
                    <div class="p-4 border-t">
                        <input type="text" id="chat-input" 
                               class="w-full border rounded-lg p-2" 
                               placeholder="Digite sua mensagem...">
                    </div>
                </div>
                <button id="chat-button" class="bg-yellow-600 text-white rounded-full p-2 shadow-lg hover:bg-green-600 flex items-center">
                    <img static="/static/imgs/acs/sarcinha.png" alt="Sarcinha" class="w-6 h-6 rounded-full">
                </button>
            </div>
        `;
        document.body.appendChild(chatContainer);
    }

    initializeEventListeners() {
        const chatButton = document.getElementById('chat-button');
        const chatWindow = document.getElementById('chat-window');
        const closeChat = document.getElementById('close-chat');
        const chatInput = document.getElementById('chat-input');

        chatButton.addEventListener('click', () => {
            chatWindow.classList.toggle('hidden');
            if (!chatWindow.classList.contains('hidden')) {
                // Usa a mensagem inicial importada
                this.addMessage('bot', initialMessage);
            }
        });

        closeChat.addEventListener('click', () => {
            chatWindow.classList.add('hidden');
        });

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && chatInput.value.trim()) {
                this.handleUserInput(chatInput.value.trim());
                chatInput.value = '';
            }
        });
    }

    addMessage(type, text) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        
        // Uso de um objeto de configuração para classes para maior legibilidade
        const classes = {
            bot: 'bg-gray-100 flex items-start',
            user: 'bg-green-100'
        };

        messageDiv.className = `mb-4 ${type === 'bot' ? 'text-left' : 'text-right'}`;
        messageDiv.innerHTML = `
            <div class="${classes[type]} inline-block rounded-lg p-2 max-w-[80%]">
                ${type === 'bot' ? '<img static="/static/imgs/acs/sarcinha.png" alt="Sarcinha" class="w-8 h-8 rounded-full mr-2">' : ''}
                <div>${text.replace(/\n/g, '<br>')}</div>
            </div>
        `;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    handleUserInput(input) {
        this.addMessage('user', input);

        // O timeout de 500ms simula o "bot pensando"
        setTimeout(() => {
            // Chama o ResponseManager para obter a resposta
            const response = this.responseManager.getResponse(input.toLowerCase());
            this.addMessage('bot', response);
        }, 500);
    }
}
