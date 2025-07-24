// Função para adicionar o ID de afiliado (o "Monetizer")

function monetizarLink(url) {
  const urlObj = new URL(url);
  const hostname = urlObj.hostname;

  switch (true) {
    // case hostname.includes("mercadolivre.com"):
    //   break;
    case hostname.includes("Amazon"):
      urlObj.searchParams.set("tag", "pegoupromo-03-20");
      break;
    // case hostname.includes("shopee.com"):
    //   urlObj.searchParams.set("af_id", "seutagshopee"); // O parâmetro pode variar
    //   break;
    // case hostname.includes("aliexpress.com"):
    //   urlObj.searchParams.set("aff_fcid", "seutagaliexpress"); // O parâmetro pode variar
    //   break;
  }

  return urlObj.toString();
}

module.exports = { monetizarLink };
