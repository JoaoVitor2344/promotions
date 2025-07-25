const { chromium } = require("playwright");

require("dotenv").config();
const HEADLESS_MODE = process.env.HEADLESS_MODE === "true";
const USER_AGENT = process.env.USER_AGENT;
const PAGE_TIMEOUT = parseInt(process.env.PAGE_TIMEOUT, 10) || 20000;
const SELECTOR_TIMEOUT = parseInt(process.env.SELECTOR_TIMEOUT, 10) || 7000;
const DEBUG_MODE = process.env.DEBUG_MODE === "true";

/**
 * Navega até a URL inicial e retorna o link final após redirecionamentos.
 * @param {string} url - URL inicial a ser limpa
 * @returns {Promise<string>} URL final após navegação
 */
async function limparLink(url) {
  let browser;

  try {
    browser = await chromium.launch({
      headless: HEADLESS_MODE,
    });

    const context = await browser.newContext({ userAgent: USER_AGENT });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "load", timeout: PAGE_TIMEOUT });

    let finalUrl = page.url();
    if (finalUrl.includes("pelando.com.br")) {
      const storeLinkSelector = "a.link-button.store-link-button";
      const storeLink = page.locator(storeLinkSelector).first();

      try {
        await storeLink.waitFor({
          state: "visible",
          timeout: SELECTOR_TIMEOUT,
        });

        const [newPage] = await Promise.all([
          context.waitForEvent("page"),
          storeLink.click({ timeout: SELECTOR_TIMEOUT }),
        ]);

        await newPage.waitForLoadState("load", { timeout: PAGE_TIMEOUT });
        finalUrl = newPage.url();
        await newPage.close();
      } catch (e) {
        if (DEBUG_MODE) {
          console.error(
            `Erro ao interagir com "${storeLinkSelector}": ${e.message}`
          );
        }
      }
    }

    finalUrl = finalUrl.split("?")[0];
    return finalUrl;
  } catch (error) {
    if (DEBUG_MODE) {
      console.error(`Erro geral ao limpar link: ${error.message}`);
    }

    return url.split("?")[0];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { limparLink };
