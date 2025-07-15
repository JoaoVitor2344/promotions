const prisma = require('../models/promotion');
const { fetchMercadoLivrePromotions } = require('../services/mercadoLivreService');

exports.importMercadoLivrePromotions = async (req, res) => {
  const { keyword, page } = req.body;
  try {
    const promos = await fetchMercadoLivrePromotions({ keyword, page });
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
    res.json({ message: `Promoções importadas do Mercado Livre: ${imported}` });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao importar promoções do Mercado Livre.' });
  }
}; 