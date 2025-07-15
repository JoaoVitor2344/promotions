const prisma = require('../models/promotion');
const { sendPromotionMessage } = require('../services/telegramService');
const { isPromotionApproved } = require('../services/promotionFilterService');

// Listar promoções
exports.getAllPromotions = async (req, res) => {
  try {
    const promotions = await prisma.promotion.findMany();
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar promoções.' });
  }
};

// Criar promoção
exports.createPromotion = async (req, res) => {
  const { title, description, url, imageUrl, affiliateId } = req.body;
  try {
    let affiliateUrl = url;
    let affiliate = null;
    if (affiliateId) {
      affiliate = await prisma.affiliate.findUnique({ where: { id: Number(affiliateId) } });
      if (affiliate) {
        // Monta o link de afiliado
        const hasQuery = url.includes('?');
        const params = affiliate.params ? affiliate.params : '';
        affiliateUrl = `${affiliate.baseUrl}${hasQuery ? '&' : '?'}${params}`;
      }
    }
    const promotion = await prisma.promotion.create({
      data: { title, description, url: affiliateUrl, imageUrl, affiliateId: affiliate ? affiliate.id : null },
    });
    res.status(201).json(promotion);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar promoção.' });
  }
};

// Editar promoção (para moderação)
exports.editPromotion = async (req, res) => {
  const { id } = req.params;
  const { title, description, url, imageUrl, affiliateId } = req.body;
  try {
    const promotion = await prisma.promotion.update({
      where: { id: Number(id) },
      data: { title, description, url, imageUrl, affiliateId },
    });
    res.json(promotion);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao editar promoção.' });
  }
};

// Deletar promoção
exports.deletePromotion = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.promotion.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar promoção.' });
  }
};

// Enviar promoção para o Telegram
exports.sendPromotionToTelegram = async (req, res) => {
  const { id } = req.params;
  const { chatId } = req.body;
  try {
    const promotion = await prisma.promotion.findUnique({ where: { id: Number(id) } });
    if (!promotion) {
      return res.status(404).json({ error: 'Promoção não encontrada.' });
    }
    // Montar mensagem formatada
    const message = `<b>${promotion.title}</b>\n${promotion.description}\n<a href=\"${promotion.url}\">Ver promoção</a>`;
    const sent = await sendPromotionMessage(chatId, message);
    if (sent) {
      res.json({ success: true, message: 'Promoção enviada para o Telegram!' });
    } else {
      res.status(500).json({ error: 'Erro ao enviar mensagem para o Telegram.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao processar envio.' });
  }
};

// Listar promoções pendentes de aprovação
exports.getPendingPromotions = async (req, res) => {
  try {
    const promotions = await prisma.promotion.findMany({ where: { approved: false } });
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar promoções pendentes.' });
  }
};

// Aprovar promoção
exports.approvePromotion = async (req, res) => {
  const { id } = req.params;
  try {
    const promotion = await prisma.promotion.update({
      where: { id: Number(id) },
      data: { approved: true },
    });
    res.json(promotion);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao aprovar promoção.' });
  }
};

// Aprovar automaticamente promoções pendentes que passam pelo filtro
exports.autoApprovePromotions = async (req, res) => {
  try {
    const pendings = await prisma.promotion.findMany({ where: { approved: false } });
    let approvedCount = 0;
    for (const promo of pendings) {
      if (isPromotionApproved(promo)) {
        await prisma.promotion.update({ where: { id: promo.id }, data: { approved: true } });
        approvedCount++;
      }
    }
    res.json({ message: `Promoções aprovadas automaticamente: ${approvedCount}` });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao aprovar promoções automaticamente.' });
  }
}; 