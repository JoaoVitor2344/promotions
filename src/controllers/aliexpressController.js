const prisma = require('../models/promotion');
const { fetchAliExpressPromotions } = require('../services/aliexpressService');

exports.importAliExpressPromotions = async (req, res) => {
  const { keyword, page } = req.body;
  try {
    const promos = await fetchAliExpressPromotions({ keyword, page });
    let imported = 0;
    for (const promo of promos) {
      // Evitar duplicidade pelo link
      const exists = await prisma.promotion.findFirst({ where: { url: promo.url } });
      if (!exists) {
        await prisma.promotion.create({
          data: {
            title: promo.title,
            description: promo.description,
            url: promo.url,
            imageUrl: promo.imageUrl,
            approved: false,
          },
        });
        imported++;
      }
    }
    res.json({ message: `Promoções importadas da AliExpress: ${imported}` });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao importar promoções da AliExpress.' });
  }
}; 