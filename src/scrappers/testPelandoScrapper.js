require("dotenv").config();

const { searchAllPromotions } = require("./pelandoScrapper");

// Executa a busca de promoções no Pelando e exibe apenas o resumo com total e estatísticas por loja
async function test() {
  try {
    const maxRetries = parseInt(process.env.SCRAPER_MAX_RETRIES) || 3;
    const promotions = await searchAllPromotions(maxRetries, true);

    console.log(`\nRESUMO:`);

    if (!promotions || promotions.length === 0) {
      console.log("   Nenhuma promoção encontrada.");
      return;
    }

    console.log(`   Total de promoções: ${promotions.length}`);

    const storeStats = {};

    promotions.forEach((promo) => {
      if (promo.store) {
        const cleanStore = promo.store
          .replace(/^(\||vendido por|\| vendido por)\s*/gi, "")
          .trim();

        storeStats[cleanStore] = (storeStats[cleanStore] || 0) + 1;
      }
    });

    console.log(`   Lojas encontradas:`);
    Object.entries(storeStats).forEach(([store, count]) => {
      console.log(`      - ${store}: ${count} promoção(ões)`);
    });
  } catch (error) {
    console.error("Erro durante o teste:", error.message);
  }
}

// Função principal que inicia o processo de teste
async function main() {
  await test();
}

main().catch((error) => {
  console.error("Erro fatal:", error);
  process.exit(1);
});
