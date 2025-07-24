// Lógica para enviar mensagens para o Telegram (o "Carteiro")

const TelegramBot = require("node-telegram-bot-api");

/**
 * Classe de serviço para gerenciar operações do bot do Telegram e mensagens
 * @class TelegramService
 */

/**
 * Cria uma nova instância do TelegramService
 * @constructor
 * @param {string} token - O token do bot do Telegram para autenticação
 */

/**
 * Configura os manipuladores de eventos para o bot do Telegram, incluindo comando start e listeners de mensagens
 * @method setupEventHandlers
 * @private
 */

/**
 * Envia uma mensagem de texto para um chat específico
 * @method sendMessage
 * @async
 * @param {string|number} chatId - O ID do chat para enviar a mensagem
 * @param {string} message - O texto da mensagem a ser enviada
 * @returns {Promise<Object>} O resultado da operação de envio
 * @throws {Error} Quando o envio da mensagem falha
 */

/**
 * Envia uma foto com legenda opcional para um chat específico
 * @method sendPhoto
 * @async
 * @param {string|number} chatId - O ID do chat para enviar a foto
 * @param {string|Buffer} photo - O caminho do arquivo da foto, URL ou buffer
 * @param {string} [caption=""] - Legenda opcional para a foto
 * @returns {Promise<Object>} O resultado da operação de envio
 * @throws {Error} Quando o envio da foto falha
 */

/**
 * Transmite uma mensagem para múltiplos chats simultaneamente
 * @method broadcastMessage
 * @async
 * @param {Array<string|number>} chatIds - Array de IDs de chat para transmitir
 * @param {string} message - O texto da mensagem a ser transmitida
 * @returns {Promise<Array<Object>>} Array de resultados para cada chat, contendo status de sucesso e resultado/erro
 */
class TelegramService {
  constructor(token) {
    this.bot = new TelegramBot(token, { polling: true });
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(chatId, "Olá! Bem-vindo ao bot de promoções!");
    });

    this.bot.on("message", (msg) => {
      const chatId = msg.chat.id;
      console.log(`Mensagem recebida de ${chatId}: ${msg.text}`);
    });
  }

  async sendMessage(chatId, message) {
    try {
      return await this.bot.sendMessage(chatId, message);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      throw error;
    }
  }

  async sendPhoto(chatId, photo, caption = "") {
    try {
      return await this.bot.sendPhoto(chatId, photo, { caption });
    } catch (error) {
      console.error("Erro ao enviar foto:", error);
      throw error;
    }
  }

  async broadcastMessage(chatIds, message) {
    const results = [];
    for (const chatId of chatIds) {
      try {
        const result = await this.sendMessage(chatId, message);
        results.push({ chatId, success: true, result });
      } catch (error) {
        results.push({ chatId, success: false, error: error.message });
      }
    }
    return results;
  }
}

module.exports = TelegramService;
