require("dotenv").config();

const { BaseScrapper } = require("./baseScrapper");

/**
 * Scrapper específico para o site Pelando
 * Herda funcionalidades comuns do BaseScrapper
 */
class PelandoScrapper extends BaseScrapper {
  constructor(config = {}) {
    super(config);
    this.baseUrl = process.env.PELANDO_BASE_URL
      ? process.env.PELANDO_BASE_URL
      : "https://www.pelando.com.br";
    this.url = process.env.PELANDO_URL;
    this.selectors = {
      dealCard: process.env.PELANDO_DEAL_CARD_SELECTOR,
      titleContainer: process.env.PELANDO_TITLE_CONTAINER_SELECTOR,
      title: process.env.PELANDO_TITLE_SELECTOR,
      contentContainer: process.env.PELANDO_CONTENT_CONTAINER_SELECTOR,
      price: process.env.PELANDO_PRICE_SELECTOR,
      store: process.env.PELANDO_STORE_SELECTOR,
    };
  }

  /**
   * Implementação específica do scraping para o Pelando
   */
  async searchPromotions(isTest = false) {
    const log = this._createLogger(isTest);
    const logError = this._createErrorLogger(isTest);

    const browser = await this.createBrowser();
    const context = await this.createContext(browser);
    const page = await context.newPage();

    try {
      log("Navegando para o Pelando...");
      await this.navigateToPage(page, this.url);

      log("Página carregada, aguardando estabilização...");
      await this.debugPageContent(page, isTest);

      try {
        log(`Aguardando por cards de promoção...`);
        await this.waitForSelector(page, this.selectors.dealCard);
        log(`✓ Cards de promoção encontrados!`);
      } catch (error) {
        log(`✗ Cards de promoção não encontrados`);
        await this.debugPageContent(page, isTest);
        throw new Error(
          "Não foi possível encontrar cards de promoção na página"
        );
      }

      log("Extraindo dados da primeira promoção...");
      const promotion = await page.evaluate(
        (params) => {
          const { isTest, selectors, baseUrl } = params;
          const log = (message) => {
            if (isTest) {
              console.log(message);
            }
          };

          // Variáveis com as classes específicas vindas do env
          const DEAL_CARD_SELECTOR = selectors.dealCard;
          const TITLE_CONTAINER_SELECTOR = selectors.titleContainer;
          const TITLE_SELECTOR = selectors.title;
          const CONTENT_CONTAINER_SELECTOR = selectors.contentContainer;
          const PRICE_SELECTOR = selectors.price;
          const STORE_SELECTOR = selectors.store;

          const firstItem = document.querySelector(DEAL_CARD_SELECTOR);

          if (!firstItem) {
            log("Nenhum card de promoção encontrado");
            return null;
          }

          log("Card de promoção encontrado");

          let title = "";
          const titleContainer = firstItem.querySelector(
            TITLE_CONTAINER_SELECTOR
          );
          if (titleContainer) {
            const titleElement = titleContainer.querySelector(TITLE_SELECTOR);
            if (titleElement) {
              title = titleElement.textContent
                ? titleElement.textContent.trim()
                : "";
            }
          }

          let price = "";
          let store = "";
          const contentContainer = firstItem.querySelector(
            CONTENT_CONTAINER_SELECTOR
          );
          if (contentContainer) {
            const priceElement = contentContainer.querySelector(PRICE_SELECTOR);
            if (priceElement) {
              price = priceElement.textContent
                ? priceElement.textContent.trim()
                : "";
            }

            const storeElement = contentContainer.querySelector(STORE_SELECTOR);
            if (storeElement) {
              store = storeElement.textContent
                ? storeElement.textContent.trim()
                : "";
            }
          }

          let link = "";
          const linkElement = firstItem.querySelector("a[href]");
          if (linkElement) {
            link = linkElement.href
              ? linkElement.href
              : linkElement.getAttribute("href")
              ? linkElement.getAttribute("href")
              : "";
          }

          const finalLink = link.startsWith("http")
            ? link
            : link
            ? `${baseUrl}${link}`
            : "";

          return {
            title: title,
            price: price,
            store: store,
            link: finalLink,
            debug: {
              foundElements: {
                firstItem: !!firstItem,
                titleContainer: !!titleContainer,
                contentContainer: !!contentContainer,
                titleFound: !!title,
                priceFound: !!price,
                storeFound: !!store,
                linkFound: !!link,
              },
              selectors: {
                dealCard: DEAL_CARD_SELECTOR,
                titleContainer: TITLE_CONTAINER_SELECTOR,
                title: TITLE_SELECTOR,
                contentContainer: CONTENT_CONTAINER_SELECTOR,
                price: PRICE_SELECTOR,
                store: STORE_SELECTOR,
              },
              itemHTML: firstItem
                ? firstItem.outerHTML.substring(0, 200) + "..."
                : "",
            },
          };
        },
        {
          isTest,
          selectors: this.selectors,
          baseUrl: this.baseUrl,
        }
      );

      if (isTest) {
        console.log("Promoção encontrada:", promotion);
      }
      return promotion;
    } catch (error) {
      logError("Erro ao buscar promocoes:", error);
      await this.captureErrorScreenshot(page, isTest);
      throw error;
    } finally {
      await browser.close();
    }
  }
}

// Para manter compatibilidade com o código existente
// Função wrapper que usa a nova classe
async function searchPromotions(maxRetries, isTest = false) {
  const scrapper = new PelandoScrapper({ maxRetries });
  return await scrapper.searchPromotionsWithRetry(isTest);
}

module.exports = {
  searchPromotions,
  PelandoScrapper,
};
