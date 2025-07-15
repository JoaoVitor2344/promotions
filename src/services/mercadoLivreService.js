const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const LOMADEE_API_KEY = process.env.LOMADEE_API_KEY;
const LOMADEE_SOURCE_ID = process.env.LOMADEE_SOURCE_ID;

// Função base para buscar produtos no Mercado Livre (pronta para integração real)
async function fetchMercadoLivrePromotions({ keyword = 'promo', page = 1 }) {
  if (!LOMADEE_API_KEY || !LOMADEE_SOURCE_ID) {
    throw new Error('Credenciais da Lomadee não configuradas no .env');
  }
  // Exemplo de busca real na API pública do Mercado Livre
  // https://api.mercadolibre.com/sites/MLB/search?q=palavra&page=1
  // Para link de afiliado, use a documentação da Lomadee/Awin
  // Por enquanto, retorna mock para manter compatibilidade
  return [
    {
      title: 'Smart TV 50" 4K Samsung Crystal UHD',
      description: 'Tela 50 polegadas, 4K, HDR, Wi-Fi, Bluetooth, Alexa integrada.',
      url: 'https://www.mercadolivre.com.br/oferta/123?aff_id=SEUAFILIADO',
      imageUrl: 'https://http2.mlstatic.com/D_NQ_NP_2X_123-MLB1234567890_0123-F.jpg',
    },
    {
      title: 'Notebook Acer Aspire 5 8GB 256GB SSD',
      description: 'Intel Core i5, Tela 15.6", Windows 11, Prata.',
      url: 'https://www.mercadolivre.com.br/oferta/456?aff_id=SEUAFILIADO',
      imageUrl: 'https://http2.mlstatic.com/D_NQ_NP_2X_456-MLB1234567890_0123-F.jpg',
    },
  ];
}

module.exports = { fetchMercadoLivrePromotions }; 