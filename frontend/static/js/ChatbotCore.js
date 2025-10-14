// ChatbotCore.js

import { botResponses, defaultFallback } from './botResponses.js';

/**
 * Gerencia a lógica de mapeamento da entrada do usuário para a resposta correta.
 */
export class ResponseManager {
    constructor(responses = botResponses, fallback = defaultFallback) {
        this.responses = responses;
        this.fallback = fallback;
    }

    /**
     * Encontra a resposta correspondente à entrada do usuário.
     * @param {string} input - A entrada do usuário em letras minúsculas.
     * @returns {string} A resposta do bot.
     */
    getResponse(input) {
        for (const category in this.responses) {
            const entry = this.responses[category];
            // Verifica se alguma palavra-chave da categoria está na entrada
            if (entry.keywords.some(keyword => input.includes(keyword))) {
                return entry.response;
            }
        }
        return this.fallback;
    }
}
