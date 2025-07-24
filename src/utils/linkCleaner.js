// Função para limpar e resolver os links (o "Cleaner")

const { chromium } = require("playwright");

async function limparLink(url) {
  let browser;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });
    const finalUrl = page.url();
    return finalUrl;
  } catch (error) {
    console.error("Erro ao limpar o link:", error);
    return url;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { limparLink };
