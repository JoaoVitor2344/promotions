// Estrutura base para integração com Mercado Livre (API pública + afiliado via Lomadee/Awin)
// Substitua a função mockada por integração real quando tiver as credenciais

// Exemplo de função para buscar promoções (mock)
async function fetchMercadoLivrePromotions({ keyword = 'promo', page = 1 }) {
  // Aqui você faria a chamada real à API do Mercado Livre e montaria o link de afiliado via Lomadee/Awin
  // Exemplo de retorno mockado:
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