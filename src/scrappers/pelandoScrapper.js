require("dotenv").config();

const { chromium } = require("playwright");

async function searchPromotions(
  maxRetries = parseInt(process.env.SCRAPER_MAX_RETRIES),
  isTest = false
) {
  const log = (message) => {
    if (isTest) {
      console.log(message);
    }
  };

  const logError = (message, error) => {
    if (isTest) {
      console.error(message, error);
    }
  };

  for (let attemptIndex = 1; attemptIndex <= maxRetries; attemptIndex++) {
    log(`\n=== Tentativa ${attemptIndex}/${maxRetries} ===`);

    try {
      const promotion = await attemptScraping(isTest);
      if (promotion && promotion.title) {
        log("✓ Promoção encontrada com sucesso!");
        return promotion;
      }

      if (attemptIndex < maxRetries) {
        log(
          `Tentativa ${attemptIndex} não retornou dados válidos, tentando novamente...`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, parseInt(process.env.SCRAPER_RETRY_DELAY))
        );
      }
    } catch (error) {
      logError(`Erro na tentativa ${attemptIndex}:`, error.message);
      if (attemptIndex < maxRetries) {
        log("Tentando novamente...");
        await new Promise((resolve) =>
          setTimeout(resolve, parseInt(process.env.SCRAPER_ERROR_DELAY))
        );
      }
    }
  }

  log("Todas as tentativas falharam");
  return null;
}

async function attemptScraping(isTest = false) {
  const log = (message) => {
    if (isTest) {
      console.log(message);
    }
  };

  const logError = (message, error) => {
    if (isTest) {
      console.error(message, error);
    }
  };

  const isHeadless = process.env.HEADLESS_MODE === "true";

  const browser = await chromium.launch({
    headless: isHeadless,
    args: process.env.BROWSER_ARGS.split(","),
  });

  const context = await browser.newContext({
    userAgent: process.env.USER_AGENT,
    viewport: {
      width: parseInt(process.env.VIEWPORT_WIDTH),
      height: parseInt(process.env.VIEWPORT_HEIGHT),
    },
  });

  const page = await context.newPage();

  try {
    log("Navegando para o Pelando...");
    await page.goto(process.env.PELANDO_URL, {
      timeout: parseInt(process.env.PAGE_TIMEOUT),
      waitUntil: "load",
    });

    log("Página carregada, aguardando estabilização...");
    await page.waitForTimeout(
      parseInt(process.env.PAGE_STABILIZATION_DELAY) + 2000
    );

    log("Verificando conteúdo da página...");
    const pageTitle = await page.title();
    log("Título da página:", pageTitle);

    const dealCardSelector = process.env.PELANDO_DEAL_CARD_SELECTOR;

    try {
      log(`Aguardando por cards de promoção...`);
      await page.waitForSelector(dealCardSelector, {
        timeout: parseInt(process.env.SELECTOR_TIMEOUT),
      });
      log(`✓ Cards de promoção encontrados!`);
    } catch (error) {
      log(`✗ Cards de promoção não encontrados`);

      const bodyHTML = await page.evaluate(() => document.body.innerHTML);
      log(
        "Primeiros 500 caracteres do HTML:",
        bodyHTML.substring(0, parseInt(process.env.DEBUG_HTML_LENGTH))
      );

      throw new Error("Não foi possível encontrar cards de promoção na página");
    }

    log("Extraindo dados da primeira promoção...");
    const promotion = await page.evaluate(
      ({ isTest, selectors, baseUrl }) => {
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
            title = titleElement.textContent?.trim() || "";
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
            price = priceElement.textContent?.trim() || "";
          }

          const storeElement = contentContainer.querySelector(STORE_SELECTOR);
          if (storeElement) {
            store = storeElement.textContent?.trim() || "";
          }
        }

        let link = "";
        const linkElement = firstItem.querySelector("a[href]");
        if (linkElement) {
          link = linkElement.href || linkElement.getAttribute("href") || "";
        }

        return {
          title: title,
          price: price,
          store: store,
          link: link.startsWith("http")
            ? link
            : link
            ? `${baseUrl}${link}`
            : "",
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
            itemHTML: firstItem?.outerHTML?.substring(0, 200) + "...",
          },
        };
      },
      {
        isTest,
        selectors: {
          dealCard: process.env.PELANDO_DEAL_CARD_SELECTOR,
          titleContainer: process.env.PELANDO_TITLE_CONTAINER_SELECTOR,
          title: process.env.PELANDO_TITLE_SELECTOR,
          contentContainer: process.env.PELANDO_CONTENT_CONTAINER_SELECTOR,
          price: process.env.PELANDO_PRICE_SELECTOR,
          store: process.env.PELANDO_STORE_SELECTOR,
        },
        baseUrl: process.env.PELANDO_BASE_URL,
      }
    );

    if (isTest) {
      console.log("Promoção encontrada:", promotion);
    }
    return promotion;
  } catch (error) {
    logError("Erro ao buscar promocoes:", error);

    try {
      const screenshotPath = process.env.ERROR_SCREENSHOT_PATH;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      log(`Screenshot salvo como ${screenshotPath}`);
    } catch (screenshotError) {
      log("Não foi possível capturar screenshot");
    }

    throw error;
  } finally {
    await browser.close();
  }
}

module.exports = {
  searchPromotions,
};
