const { BaseScrapper } = require("./baseScrapper");

class PelandoScrapper extends BaseScrapper {
  constructor(config = {}) {
    super(config);
    this.url = process.env.PELANDO_URL;
    // Environment-driven selectors
    this.cardSelector = process.env.PELANDO_DEAL_CARD_SELECTOR;
    this.storeSelector = process.env.PELANDO_STORE_SELECTOR;
    this.titleSelector = process.env.PELANDO_TITLE_SELECTOR;
    this.priceSelector = process.env.PELANDO_PRICE_SELECTOR;
  }

  async init() {
    this.browser = await this.createBrowser();
    const context = await this.createContext(this.browser);
    this.page = await context.newPage();
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async extractPromotionData(card) {
    try {
      const storeNameElement = await card.$(this.storeSelector);
      const titleElement = await card.$(this.titleSelector);
      const priceElement = await card.$(this.priceSelector);

      const storeName = storeNameElement
        ? (await storeNameElement.innerText()).trim().toLowerCase()
        : null;

      const title = titleElement
        ? (await titleElement.innerText()).trim()
        : "Título não encontrado";
      const link = titleElement
        ? await titleElement.getAttribute("href")
        : "Link não encontrado";
      const price = priceElement
        ? (await priceElement.innerText()).trim()
        : "Preço não encontrado";

      if (title !== "Título não encontrado" && link !== "Link não encontrado") {
        return { title, price, link, store: storeName };
      }

      return null;
    } catch (error) {
      console.error(
        "Erro ao extrair dados de um card individual:",
        error.message
      );
      return null;
    }
  }

  async searchPromotions() {
    await this.init();

    try {
      await this.page.goto(this.url, { waitUntil: "domcontentloaded" });
      await this.page.waitForSelector(this.cardSelector, { timeout: 20000 });

      const cards = await this.page.$$(this.cardSelector);
      const rawPromotions = [];

      for (const card of cards) {
        const promotionData = await this.extractPromotionData(card);
        if (promotionData) {
          rawPromotions.push(promotionData);
        }
      }

      const promotions = rawPromotions.filter((promo) =>
        this.isStoreAllowed(promo.store)
      );

      return promotions;
    } catch (error) {
      console.error(
        "Ocorreu um erro geral no scraper do Pelando:",
        error.message
      );
      await this.page.screenshot({ path: "error_screenshot.png" });
      return [];
    } finally {
      await this.close();
    }
  }
}

async function searchAllPromotions() {
  const scrapper = new PelandoScrapper();
  return await scrapper.searchPromotions();
}

async function searchFirstPromotion() {
  const scrapper = new PelandoScrapper();
  const allPromotions = await scrapper.searchPromotions();
  return allPromotions.length > 0 ? allPromotions[0] : null;
}

module.exports = {
  searchAllPromotions,
  searchFirstPromotion,
};
