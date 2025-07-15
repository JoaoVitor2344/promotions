const cron = require('node-cron');
const prisma = require('../models/promotion');
const { fetchAmazonPromotions } = require('./amazonService');
const { fetchShopeePromotions } = require('./shopeeService');
const { fetchMercadoLivrePromotions } = require('./mercadoLivreService');
const { fetchAliExpressPromotions } = require('./aliexpressService');

// Palavras-chave/categorias para busca automática
const KEYWORDS = ['promo', 'smartphone', 'notebook', 'tv', 'fones'];

async function importAndSave(promos, source) {
  let imported = 0;
  for (const promo of promos) {
    const exists = await prisma.promotion.findFirst({ where: { url: promo.url } });
    if (!exists) {
      await prisma.promotion.create({
        data: {
          title: promo.title,
          description: promo.description,
          url: promo.url,
          imageUrl: promo.imageUrl,
          approved: false,
          // Você pode adicionar um campo 'source' se quiser rastrear a origem
        },
      });
      imported++;
    }
  }
  if (imported > 0) console.log(`[${source}] Importadas ${imported} promoções.`);
}

function scheduleAffiliateImports() {
  // Amazon
  cron.schedule('0 * * * *', async () => {
    for (const keyword of KEYWORDS) {
      try {
        const promos = await fetchAmazonPromotions({ keyword });
        await importAndSave(promos, 'Amazon');
      } catch (e) { console.error('[Amazon]', e.message); }
    }
  }, { timezone: 'America/Sao_Paulo' });

  // Shopee
  cron.schedule('10 * * * *', async () => {
    for (const keyword of KEYWORDS) {
      try {
        const promos = await fetchShopeePromotions({ keyword });
        await importAndSave(promos, 'Shopee');
      } catch (e) { console.error('[Shopee]', e.message); }
    }
  }, { timezone: 'America/Sao_Paulo' });

  // Mercado Livre
  cron.schedule('20 * * * *', async () => {
    for (const keyword of KEYWORDS) {
      try {
        const promos = await fetchMercadoLivrePromotions({ keyword });
        await importAndSave(promos, 'MercadoLivre');
      } catch (e) { console.error('[MercadoLivre]', e.message); }
    }
  }, { timezone: 'America/Sao_Paulo' });

  // AliExpress
  cron.schedule('30 * * * *', async () => {
    for (const keyword of KEYWORDS) {
      try {
        const promos = await fetchAliExpressPromotions({ keyword });
        await importAndSave(promos, 'AliExpress');
      } catch (e) { console.error('[AliExpress]', e.message); }
    }
  }, { timezone: 'America/Sao_Paulo' });
}

module.exports = { scheduleAffiliateImports }; 