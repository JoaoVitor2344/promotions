const KEYWORDS = [
  'Amazon', 'Shopee', 'Magalu', 'Frete Grátis', '% OFF', 'Desconto', 'Cupom'
];
const BLOCKED_WORDS = [
  'Mercado Livre', 'OLX', 'usado'
];

function isPromotionApproved(promotion) {
  const text = `${promotion.title} ${promotion.description}`.toLowerCase();
  // Deve conter pelo menos uma palavra-chave
  const hasKeyword = KEYWORDS.some(k => text.includes(k.toLowerCase()));
  // Não pode conter palavras bloqueadas
  const hasBlocked = BLOCKED_WORDS.some(b => text.includes(b.toLowerCase()));
  return hasKeyword && !hasBlocked;
}

module.exports = { isPromotionApproved }; 