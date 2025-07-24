require("dotenv").config();

const { searchPromotions } = require("./src/scrappers/pelandoScrapper");
const { limparLink } = require("./src/utils/linkCleaner");
const { monetizarLink } = require("./src/utils/affiliateMonetizer");
const TelegramService = require("./src/services/telegramService");

const DEBUG_MODE = process.env.DEBUG_MODE === "true";

// Função auxiliar para logs condicionais
function debugLog(message, ...args) {
  if (DEBUG_MODE) {
    console.log(message, ...args);
  }
}

// Script de teste que integra todo o fluxo do bot
// Executa sequencialmente: busca promoções, limpa link, monetiza e envia para Telegram
async function testCompleteFlow() {
  debugLog("Iniciando teste do fluxo completo...\n");

  try {
    // Verificar se as variáveis de ambiente necessárias estão configuradas
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error("TELEGRAM_BOT_TOKEN não configurado no .env");
    }
    if (!process.env.TELEGRAM_CHANNEL_ID) {
      throw new Error("TELEGRAM_CHANNEL_ID não configurado no .env");
    }

    // 1. Buscar promoções no Pelando
    debugLog("Passo 1: Buscando promoções no Pelando...");
    const maxRetries = parseInt(process.env.SCRAPER_MAX_RETRIES) || 3;
    const promotion = await searchPromotions(maxRetries, DEBUG_MODE);

    if (!promotion || !promotion.title) {
      debugLog("Nenhuma promoção encontrada. Encerrando teste.");
      return;
    }

    debugLog("Promoção encontrada:");
    debugLog(`   Título: ${promotion.title}`);
    debugLog(`   Preço: ${promotion.price}`);
    debugLog(`   Loja: ${promotion.store}`);
    debugLog(`   Link original: ${promotion.link}\n`);

    // 2. Limpar o link
    debugLog("Passo 2: Limpando o link...");
    let cleanedLink = promotion.link;

    if (promotion.link) {
      try {
        cleanedLink = await limparLink(promotion.link);
        debugLog(`Link limpo: ${cleanedLink}\n`);
      } catch (error) {
        debugLog(`Erro ao limpar link, usando original: ${error.message}\n`);
      }
    } else {
      debugLog("Nenhum link encontrado na promoção\n");
    }

    // 3. Monetizar o link
    debugLog("Passo 3: Monetizando o link...");
    const monetizedLink = monetizarLink(cleanedLink);
    debugLog(`Link monetizado: ${monetizedLink}\n`);

    // 4. Formatar mensagem para o Telegram
    debugLog("Passo 4: Formatando mensagem...");
    const message = formatTelegramMessage(promotion, monetizedLink);
    debugLog("Mensagem formatada:");
    debugLog("---BEGIN MESSAGE---");
    debugLog(message);
    debugLog("---END MESSAGE---\n");

    // 5. Enviar para o Telegram
    debugLog("Passo 5: Enviando para o Telegram...");
    const telegramService = new TelegramService(process.env.TELEGRAM_BOT_TOKEN);
    const channelId = process.env.TELEGRAM_CHANNEL_ID;

    const result = await telegramService.sendMessage(channelId, message);
    debugLog("Mensagem enviada com sucesso!");
    debugLog(`   Message ID: ${result.message_id}`);
    debugLog(`   Chat ID: ${result.chat.id}\n`);

    debugLog("Teste do fluxo completo finalizado com sucesso!");
  } catch (error) {
    console.error("Erro durante o teste do fluxo:", error.message);
    if (DEBUG_MODE) {
      console.error("Stack trace:", error.stack);
    }
    process.exit(1);
  }
}

// Formata a promoção em uma mensagem para o Telegram
// Recebe os dados da promoção e o link monetizado, retorna mensagem formatada
function formatTelegramMessage(promotion, monetizedLink) {
  const priceText = promotion.price
    ? `Preço: ${promotion.price}`
    : "Preço não informado";
  const storeText = promotion.store
    ? `Loja: ${promotion.store}`
    : "Loja não informada";

  return `NOVA PROMOÇÃO

${promotion.title}

${priceText}
${storeText}

Ver Oferta: ${monetizedLink}

#promoção #oferta #desconto`;
}

// Função para testar apenas a formatação da mensagem sem fazer scraping
async function testMessageFormatting() {
  debugLog("Testando apenas a formatação da mensagem...\n");

  const mockPromotion = {
    title: "Smartphone Samsung Galaxy A54 128GB - Preto",
    price: "R$ 899,99",
    store: "Amazon",
    link: "https://www.amazon.com.br/smartphone-example",
  };

  const monetizedLink = monetizarLink(mockPromotion.link);
  const message = formatTelegramMessage(mockPromotion, monetizedLink);

  debugLog("Mensagem formatada:");
  debugLog("---BEGIN MESSAGE---");
  debugLog(message);
  debugLog("---END MESSAGE---");
}

// Verificar argumentos da linha de comando e executar função apropriada
const args = process.argv.slice(2);

if (args.includes("--format-only")) {
  testMessageFormatting();
} else {
  testCompleteFlow().catch((error) => {
    console.error("Erro fatal:", error);
    process.exit(1);
  });
}
