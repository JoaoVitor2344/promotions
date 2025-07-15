const cron = require('node-cron');
const prisma = require('../models/schedule');
const promotionPrisma = require('../models/promotion');
const sendLogPrisma = require('../models/schedule'); // Usar o mesmo PrismaClient
const { sendPromotionMessage } = require('./telegramService');
const { importAllRssPromotions } = require('./rssImportService');

async function scheduleAll() {
  // Agendar importação de todos os feeds RSS a cada 10 minutos
  cron.schedule('*/10 * * * *', async () => {
    await importAllRssPromotions();
    console.log('Importação automática dos feeds concluída.');
  }, { timezone: 'America/Sao_Paulo' });

  // Busca todos os agendamentos ativos
  const schedules = await prisma.schedule.findMany({
    where: { active: true },
    include: { promotion: true },
  });

  schedules.forEach(schedule => {
    // Só agenda se a promoção estiver aprovada
    if (!schedule.promotion || !schedule.promotion.approved) return;
    // Agenda a tarefa
    cron.schedule(schedule.cron, async () => {
      // Verifica se já foi enviado para esse chatId
      const alreadySent = await sendLogPrisma.sendLog.findFirst({
        where: {
          promotionId: schedule.promotionId,
          chatId: schedule.chatId,
        },
      });
      if (alreadySent) return;
      const message = `<b>${schedule.promotion.title}</b>\n${schedule.promotion.description}\n<a href=\"${schedule.promotion.url}\">Ver promoção</a>`;
      const sent = await sendPromotionMessage(schedule.chatId, message);
      await sendLogPrisma.sendLog.create({
        data: {
          promotionId: schedule.promotionId,
          chatId: schedule.chatId,
          status: sent ? 'success' : 'fail',
        },
      });
    }, {
      timezone: 'America/Sao_Paulo',
    });
  });
}

module.exports = { scheduleAll }; 