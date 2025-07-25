const path = require("path");
const { chromium } = require("playwright");
const { limparLink } = require("../utils/linkCleaner");
const { monetizarLink } = require("../utils/affiliateMonetizer")
;
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

class BaseScrapper {
  constructor() {
    this.maxRetries = parseInt(process.env.SCRAPER_MAX_RETRIES);
    this.retryDelay = parseInt(process.env.SCRAPER_RETRY_DELAY);
    this.errorDelay = parseInt(process.env.SCRAPER_ERROR_DELAY);
    this.headless = process.env.HEADLESS_MODE;
    this.userAgent = process.env.USER_AGENT;
    const viewportWidth = parseInt(process.env.VIEWPORT_WIDTH);
    const viewportHeight = parseInt(process.env.VIEWPORT_HEIGHT);
    this.viewport = { width: viewportWidth, height: viewportHeight };
    this.browserArgs = process.env.BROWSER_ARGS.split(",");
    this.pageTimeout = parseInt(process.env.PAGE_TIMEOUT);
    this.stabilizationDelay = parseInt(process.env.PAGE_STABILIZATION_DELAY);
    this.selectorTimeout = parseInt(process.env.SELECTOR_TIMEOUT);
    this.debugHtmlLength = parseInt(process.env.DEBUG_HTML_LENGTH);
    this.screenshotPath = process.env.ERROR_SCREENSHOT_PATH;
    this.allowedStores = this.getAllowedStores();
    this.returnMultiple = true;
  }

  normalizeString(str) {
    if (!str) return "";

    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  getAllowedStores() {
    const envStores = process.env.ALLOWED_STORES;
    if (envStores) {
      return envStores.split(",").map((store) => this.normalizeString(store));
    }

    return [];
  }

  isStoreAllowed(storeName) {
    if (!storeName) return false;

    const normalizedStoreName = this.normalizeString(storeName);
    return this.allowedStores.some(
      (allowedStore) =>
        normalizedStoreName.includes(allowedStore) ||
        allowedStore.includes(normalizedStoreName)
    );
  }

  async searchPromotions(isTest = false) {
    throw new Error(
      "searchPromotions method must be implemented by child classes"
    );
  }

  async searchPromotionsWithRetry(isTest = false) {
    const log = this._createLogger(isTest);
    const logError = this._createErrorLogger(isTest);

    for (
      let attemptIndex = 1;
      attemptIndex <= this.maxRetries;
      attemptIndex++
    ) {
      log(`\n=== Tentativa ${attemptIndex}/${this.maxRetries} ===`);

      try {
        const result = await this.searchPromotions(isTest);

        if (this.returnMultiple) {
          if (result && Array.isArray(result) && result.length > 0) {
            log(`✓ ${result.length} promoções encontradas com sucesso!`);

            for (let i = 0; i < result.length; i++) {
              if (result[i].link) {
                result[i].link = await this.processLink(result[i].link, isTest);
              }
            }

            return result;
          }
        } else {
          if (result && result.title) {
            log("✓ Promoção encontrada com sucesso!");

            if (result.link) {
              result.link = await this.processLink(result.link, isTest);
            }

            return result;
          }
        }

        if (attemptIndex < this.maxRetries) {
          log(
            `Tentativa ${attemptIndex} não retornou dados válidos, tentando novamente...`
          );
          await this._sleep(this.retryDelay);
        }
      } catch (error) {
        logError(`Erro na tentativa ${attemptIndex}:`, error.message);
        if (attemptIndex < this.maxRetries) {
          log("Tentando novamente...");
          await this._sleep(this.errorDelay);
        }
      }
    }

    log("Todas as tentativas falharam");
    return this.returnMultiple ? [] : null;
  }

  async searchSinglePromotion(isTest = false) {
    const originalReturnMultiple = this.returnMultiple;
    this.returnMultiple = true;

    try {
      const promotions = await this.searchPromotionsWithRetry(isTest);
      return promotions && promotions.length > 0 ? promotions[0] : null;
    } finally {
      this.returnMultiple = originalReturnMultiple;
    }
  }

  async searchAllPromotions(isTest = false) {
    const originalReturnMultiple = this.returnMultiple;
    this.returnMultiple = true;

    try {
      return await this.searchPromotionsWithRetry(isTest);
    } finally {
      this.returnMultiple = originalReturnMultiple;
    }
  }

  async processLink(url, isTest = false) {
    const log = this._createLogger(isTest);

    try {
      log("Processando link...");

      const cleanedLink = await this.cleanLink(url);
      log(`Link limpo: ${cleanedLink}`);

      const monetizedLink = this.monetizeLink(cleanedLink);
      log(`Link monetizado: ${monetizedLink}`);

      return monetizedLink;
    } catch (error) {
      log(`Erro ao processar link: ${error.message}`);
      return url;
    }
  }

  async cleanLink(url) {
    return await limparLink(url);
  }

  monetizeLink(url) {
    return monetizarLink(url);
  }

  async createBrowser() {
    try {
      return await chromium.launch({
        headless: this.headless,
        args: this.browserArgs,
      });
    } catch (error) {
      console.error("Error creating browser:", error.message);
      console.log("Retrying with minimal browser arguments...");
      return await chromium.launch({
        headless: this.headless,
        args: ["--no-sandbox"],
      });
    }
  }

  async createContext(browser) {
    try {
      return await browser.newContext({
        userAgent: this.userAgent,
        viewport: this.viewport,
      });
    } catch (error) {
      console.error("Error creating context with viewport:", error.message);
      console.log("Retrying without viewport configuration...");
      return await browser.newContext({
        userAgent: this.userAgent,
      });
    }
  }

  async navigateToPage(page, url) {
    if (!url || typeof url !== "string") {
      throw new Error(
        `Invalid URL provided to navigateToPage: ${url}. Expected a valid URL string.`
      );
    }

    await page.goto(url, {
      timeout: this.pageTimeout,
      waitUntil: "load",
    });

    await page.waitForTimeout(this.stabilizationDelay);
  }

  async waitForSelector(page, selector) {
    return await page.waitForSelector(selector, {
      timeout: this.selectorTimeout,
    });
  }

  async captureErrorScreenshot(page, isTest = false) {
    const log = this._createLogger(isTest);

    try {
      await page.screenshot({ path: this.screenshotPath, fullPage: true });
      log(`Screenshot salvo como ${this.screenshotPath}`);
    } catch (screenshotError) {
      log("Não foi possível capturar screenshot");
    }
  }

  async debugPageContent(page, isTest = false) {
    const log = this._createLogger(isTest);

    const pageTitle = await page.title();
    log("Título da página:", pageTitle);

    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    log(
      `Primeiros ${this.debugHtmlLength} caracteres do HTML:`,
      bodyHTML.substring(0, this.debugHtmlLength)
    );
  }

  _createLogger(isTest) {
    return (message, ...args) => {
      if (isTest) {
        console.log(message, ...args);
      }
    };
  }

  _createErrorLogger(isTest) {
    return (message, error) => {
      if (isTest) {
        console.error(message, error);
      }
    };
  }

  async _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = { BaseScrapper };
