// Função para adicionar o ID de afiliado (o "Monetizer")

function monetizarLink(url) {
  const urlObj = new URL(url);
  const hostname = urlObj.hostname;

  switch (true) {
    case hostname.includes("mercadolivre.com"):
      // O programa de afiliados do Mercado Livre pode não usar um simples tag na URL.
      // Pode ser necessário um tratamento diferente ou usar links gerados na plataforma deles.
      break;
    case hostname.includes("amazon.com"):
      urlObj.searchParams.set("tag", "seutagamazon-20");
      break;
    case hostname.includes("shopee.com"):
      urlObj.searchParams.set("af_id", "seutagshopee"); // O parâmetro pode variar
      break;
    case hostname.includes("aliexpress.com"):
      urlObj.searchParams.set("aff_fcid", "seutagaliexpress"); // O parâmetro pode variar
      break;
  }

  return urlObj.toString();
}

module.exports = { monetizarLink };
