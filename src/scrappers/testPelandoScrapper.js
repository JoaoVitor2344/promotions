const { searchPromotions } = require("./pelandoScrapper");

(async () => {
  const resultado = await searchPromotions(process.env.PAGE_NUMBER, true);
  console.log(resultado);
})();
