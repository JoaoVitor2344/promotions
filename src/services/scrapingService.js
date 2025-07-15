const axios = require('axios');
const cheerio = require('cheerio');

// Exemplo: scraping de ofertas do Magalu (mock/simples)
async function fetchMagaluPromotions({ keyword = 'promo', page = 1 }) {
  // Exemplo de scraping simples (ajuste a URL e parsing conforme o site real)
  const url = `https://www.magazineluiza.com.br/busca/${encodeURIComponent(keyword)}/?page=${page}`;
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const promos = [];
    $('.product').each((i, el) => {
      const title = $(el).find('.product-title').text().trim();
      const url = $(el).find('a').attr('href');
      const imageUrl = $(el).find('img').attr('src');
      const description = $(el).find('.product-price-installment').text().trim();
      if (title && url) {
        promos.push({
          title,
          description,
          url: url.startsWith('http') ? url : `https://www.magazineluiza.com.br${url}`,
          imageUrl,
        });
      }
    });
    return promos;
  } catch (err) {
    console.error('Erro no scraping Magalu:', err.message);
    return [];
  }
}

module.exports = { fetchMagaluPromotions }; 