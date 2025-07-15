const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: false });

async function sendPromotionMessage(chatId, message) {
  try {
    await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    return true;
  } catch (error) {
    console.error('Erro ao enviar mensagem para o Telegram:', error.message);
    return false;
  }
}

module.exports = { sendPromotionMessage }; 