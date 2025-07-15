const prisma = require('../models/sendLog');

// Listar logs de envio com filtros opcionais
exports.getSendLogs = async (req, res) => {
  const { promotionId, chatId, status } = req.query;
  try {
    const where = {};
    if (promotionId) where.promotionId = Number(promotionId);
    if (chatId) where.chatId = chatId;
    if (status) where.status = status;
    const logs = await prisma.sendLog.findMany({
      where,
      include: { promotion: true },
      orderBy: { sentAt: 'desc' },
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar logs de envio.' });
  }
}; 