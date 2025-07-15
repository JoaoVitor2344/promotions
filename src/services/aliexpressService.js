const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const AWIN_API_KEY = process.env.AWIN_API_KEY;
const AWIN_PUBLISHER_ID = process.env.AWIN_PUBLISHER_ID;

// Função base para buscar produtos na AliExpress (pronta para integração real)
async function fetchAliExpressPromotions({ keyword = 'promo', page = 1 }) {
  if (!AWIN_API_KEY || !AWIN_PUBLISHER_ID) {
    throw new Error('Credenciais da Awin não configuradas no .env');
  }
  // Exemplo de busca real na API/feed do Awin/Portals
  // Para link de afiliado, use a documentação da Awin/Portals
  // Por enquanto, retorna mock para manter compatibilidade
  return [
    {
      title: 'Fone de Ouvido Bluetooth Xiaomi Redmi Airdots 2',
      description: 'Fone sem fio, Bluetooth 5.0, Estojo carregador, Preto.',
      url: 'https://aliexpress.com/item/123.html?aff_id=SEUAFILIADO',
      imageUrl: 'https://ae01.alicdn.com/kf/HTB1.jpg',
    },
    {
      title: 'Relógio Inteligente Amazfit Bip U Pro',
      description: 'Monitoramento de saúde, GPS, 5 ATM, Notificações.',
      url: 'https://aliexpress.com/item/456.html?aff_id=SEUAFILIADO',
      imageUrl: 'https://ae01.alicdn.com/kf/HTB2.jpg',
    },
  ];
}

module.exports = { fetchAliExpressPromotions }; 