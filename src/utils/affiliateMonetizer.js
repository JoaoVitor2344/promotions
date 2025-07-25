require("dotenv").config();

/**
 * Adiciona o ID de afiliado à URL se a loja estiver na lista permitida.
 * @param {string} url - URL original da promoção a ser monetizada
 * @returns {string} URL final com parâmetros de afiliado
 */
function monetizarLink(url) {
  const allowedStores = process.env.ALLOWED_STORES
    ? process.env.ALLOWED_STORES.split(",").map((s) =>
        s.trim().toLowerCase().replace(/\s+/g, "")
      )
    : [];

  const urlObj = new URL(url);
  const hostname = urlObj.hostname.toLowerCase();

  if (!allowedStores.some((store) => hostname.includes(store))) {
    return url;
  }

  if (hostname.includes("amazon")) {
    const tag = process.env.AMAZON_AFFILIATE_TAG;
    if (tag) urlObj.searchParams.set("tag", tag);
  } else if (hostname.includes("mercadolivre")) {
    const id = process.env.MERCADOLIVRE_AFFILIATE_ID;
    if (id) urlObj.searchParams.set("afiliado", id);
  } else if (hostname.includes("shopee")) {
    const id = process.env.SHOPEE_AFFILIATE_ID;
    if (id) urlObj.searchParams.set("aff_id", id);
  } else if (hostname.includes("aliexpress")) {
    const id = process.env.ALIEXPRESS_AFFILIATE_ID;
    if (id) urlObj.searchParams.set("aff_id", id);
  }

  return urlObj.toString();
}

module.exports = { monetizarLink };
