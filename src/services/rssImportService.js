const Parser = require('rss-parser');
const prisma = require('../models/promotion');
const schedulePrisma = require('../models/schedule');

const FEEDS = [
  {
    name: 'Promobit',
    url: 'https://www.promobit.com.br/promocoes.rss',
  },
  {
    name: 'Pelando',
    url: 'https://www.pelando.com.br/rss',
  },
  // Adicione mais feeds aqui
];

const DEFAULT_CHAT_ID = process.env.DEFAULT_TELEGRAM_CHAT_ID || null;
const DEFAULT_CRON = '*/5 * * * *';

async function importAllRssPromotions() {
  const parser = new Parser();
  for (const feedInfo of FEEDS) {
    try {
      const feed = await parser.parseURL(feedInfo.url);
      for (const item of feed.items) {
        // Evitar duplicidade pelo link
        const exists = await prisma.promotion.findFirst({ where: { url: item.link } });
        if (!exists) {
          const promotion = await prisma.promotion.create({
            data: {
              title: item.title,
              description: item.contentSnippet || item.content || '',
              url: item.link,
              imageUrl: item.enclosure ? item.enclosure.url : null,
              approved: false,
            },
          });
          // Criar agendamento automático para envio ao Telegram
          if (DEFAULT_CHAT_ID) {
            await schedulePrisma.schedule.create({
              data: {
                promotionId: promotion.id,
                chatId: DEFAULT_CHAT_ID,
                cron: DEFAULT_CRON,
                active: true,
              },
            });
          }
        }
      }
    } catch (err) {
      console.error(`Erro ao importar do feed ${feedInfo.name}:`, err.message);
    }
  }
}

module.exports = { importAllRssPromotions }; 