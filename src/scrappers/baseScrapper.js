require("dotenv").config();

const { chromium } = require("playwright");
const { limparLink } = require("../utils/linkCleaner");
const { monetizarLink } = require("../utils/affiliateMonetizer");

class BaseScrapper {
  constructor(config = {}) {
    this.maxRetries =
      config.maxRetries || parseInt(process.env.SCRAPER_MAX_RETRIES);
    this.retryDelay =
      config.retryDelay || parseInt(process.env.SCRAPER_RETRY_DELAY);
    this.errorDelay =
      config.errorDelay || parseInt(process.env.SCRAPER_ERROR_DELAY);
    this.headless =
      config.headless !== undefined
        ? config.headless
        : process.env.HEADLESS_MODE === "true";
    this.userAgent = config.userAgent || process.env.USER_AGENT;
    this.viewport = config.viewport || {
      width: parseInt(process.env.VIEWPORT_WIDTH),
      height: parseInt(process.env.VIEWPORT_HEIGHT),
    };
    this.browserArgs =
      config.browserArgs ||
      (process.env.BROWSER_ARGS ? process.env.BROWSER_ARGS.split(",") : []);
    this.pageTimeout = config.pageTimeout || parseInt(process.env.PAGE_TIMEOUT);
    this.stabilizationDelay =
      config.stabilizationDelay ||
      parseInt(process.env.PAGE_STABILIZATION_DELAY);
    this.selectorTimeout =
      config.selectorTimeout || parseInt(process.env.SELECTOR_TIMEOUT);
    this.debugHtmlLength =
      config.debugHtmlLength || parseInt(process.env.DEBUG_HTML_LENGTH);
    this.screenshotPath =
      config.screenshotPath || process.env.ERROR_SCREENSHOT_PATH;
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
        const promotion = await this.searchPromotions(isTest);
        if (promotion && promotion.title) {
          log("✓ Promoção encontrada com sucesso!");

          if (promotion.link) {
            promotion.link = await this.processLink(promotion.link, isTest);
          }

          return promotion;
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
    return null;
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
    return await chromium.launch({
      headless: this.headless,
      args: this.browserArgs,
    });
  }

  async createContext(browser) {
    return await browser.newContext({
      userAgent: this.userAgent,
      viewport: this.viewport,
    });
  }

  async navigateToPage(page, url) {
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
