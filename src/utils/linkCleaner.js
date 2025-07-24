const { chromium } = require("playwright");

async function limparLink(url) {
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
    });
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    });
    const page = await context.newPage();

    await page.goto(url, { waitUntil: "load", timeout: 20000 });

    let finalUrl = page.url();

    if (finalUrl.includes("pelando.com.br")) {
      const storeLinkSelector = "a.link-button.store-link-button";
      const storeLink = page.locator(storeLinkSelector).first();

      try {
        await storeLink.waitFor({ state: "visible", timeout: 7000 });

        const [newPage] = await Promise.all([
          context.waitForEvent("page"),
          storeLink.click({ timeout: 5000 }),
        ]);

        await newPage.waitForLoadState("load", { timeout: 20000 });
        finalUrl = newPage.url();
        await newPage.close();
      } catch (e) {
        console.error(
          `O seletor "${storeLinkSelector}" não foi encontrado ou não foi possível interagir com ele. Erro: ${e.message}`
        );
      }
    }

    return finalUrl;
  } catch (error) {
    console.error(`Ocorreu um erro geral ao limpar o link: ${error.message}`);
    return url;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { limparLink };
