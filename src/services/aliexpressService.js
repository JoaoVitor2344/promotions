const axios = require('axios');
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();

// Prisma
const promotionPrisma = require('../models/promotion');
const affiliatePrisma = require('../models/affiliate');

// Configurações da API do AliExpress
const ALIEXPRESS_API_KEY = process.env.ALIEXPRESS_API_KEY;
const ALIEXPRESS_SECRET_KEY = process.env.ALIEXPRESS_SECRET_KEY;
const ALIEXPRESS_TRACKING_ID = process.env.ALIEXPRESS_TRACKING_ID;
// const ALIEXPRESS_APP_SIGNATURE = process.env.ALIEXPRESS_APP_SIGNATURE;

const API_BASE_URL = 'https://api-sg.aliexpress.com/sync';

// Função para gerar assinatura da API
function generateSignature(params, secret) {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}${params[key]}`)
    .join('');
  
  return crypto
    .createHmac('sha256', secret)
    .update(sortedParams)
    .digest('hex')
    .toUpperCase();
}

// Função para buscar produtos em promoção
async function fetchAliExpressPromotions({ 
  keyword = 'promo', 
  page = 1, 
  pageSize = 20,
  category = null,
  minPrice = null,
  maxPrice = null,
  sort = 'SALE_PRICE_ASC' // SALE_PRICE_ASC, SALE_PRICE_DESC, LAST_VOLUME_ASC, LAST_VOLUME_DESC
}) {
  
  if (!ALIEXPRESS_API_KEY || !ALIEXPRESS_SECRET_KEY || !ALIEXPRESS_TRACKING_ID) {
    throw new Error('Credenciais do AliExpress não configuradas no arquivo .env');
  }

  try {
    // Parâmetros base da requisição
    const timestamp = Date.now().toString();
    const params = {
      app_key: ALIEXPRESS_API_KEY,
      method: 'aliexpress.affiliate.product.query',
      timestamp: timestamp,
      format: 'json',
      v: '2.0',
      sign_method: 'sha256',
      tracking_id: ALIEXPRESS_TRACKING_ID,
      keywords: keyword,
      page_no: page,
      page_size: pageSize,
      sort: sort,
      target_currency: 'BRL', // Moeda brasileira
      target_language: 'PT', // Português
      ship_to_country: 'BR' // Brasil
    };

    // Adicionar filtros opcionais
    if (category) params.category_ids = category;
    if (minPrice) params.min_sale_price = minPrice;
    if (maxPrice) params.max_sale_price = maxPrice;

    // Gerar assinatura
    params.sign = generateSignature(params, ALIEXPRESS_SECRET_KEY);

    // Fazer requisição para a API
    const response = await axios.get(API_BASE_URL, {
      params: params,
      timeout: 10000
    });

    if (response.data.error_response) {
      throw new Error(`Erro da API AliExpress: ${response.data.error_response.msg}`);
    }

    const products = response.data.aliexpress_affiliate_product_query_response?.resp_result?.result?.products || [];
    
    // Processar produtos para o formato esperado
    const promotions = products.map(product => ({
      title: product.product_title,
      description: product.product_title, // AliExpress não fornece descrição separada
      url: product.promotion_link, // Link já com tracking de afiliado
      imageUrl: product.product_main_image_url,
      originalPrice: product.original_price,
      salePrice: product.sale_price,
      discount: product.discount,
      currency: product.target_sale_price_currency,
      commission: product.commission_rate,
      categoryId: product.category_id,
      sellerId: product.seller_id,
      volume: product.volume,
      productId: product.product_id,
      evaluateRate: product.evaluate_rate,
      hotProductCommissionRate: product.hot_product_commission_rate
    }));

    return promotions;

  } catch (error) {
    console.error('Erro ao buscar promoções do AliExpress:', error.message);
    throw new Error(`Falha ao conectar com a API do AliExpress: ${error.message}`);
  }
}

// Função utilitária para salvar promoções no banco, evitando duplicidade
async function saveAliExpressPromotionsToDb(promotions, affiliateId = null) {
  let imported = 0;
  for (const promo of promotions) {
    const exists = await promotionPrisma.promotion.findFirst({ where: { url: promo.url } });
    if (!exists) {
      await promotionPrisma.promotion.create({
        data: {
          title: promo.title,
          description: promo.description,
          url: promo.url,
          imageUrl: promo.imageUrl,
          approved: false,
          affiliateId: affiliateId || undefined,
        },
      });
      imported++;
    }
  }
  return imported;
}

// Função para buscar o affiliate do AliExpress
async function getAliExpressAffiliate() {
  return await affiliatePrisma.affiliate.findFirst({ where: { platform: 'AliExpress' } });
}

// Função para buscar produtos por categoria
async function fetchAliExpressProductsByCategory({ 
  categoryId, 
  page = 1, 
  pageSize = 20,
  sort = 'SALE_PRICE_ASC'
}) {
  return await fetchAliExpressPromotions({
    keyword: '', // Busca sem palavra-chave específica
    page,
    pageSize,
    category: categoryId,
    sort
  });
}

// Função para buscar hot products (produtos em alta)
async function fetchAliExpressHotProducts({ 
  page = 1, 
  pageSize = 20,
  categoryId = null 
}) {
  
  if (!ALIEXPRESS_API_KEY || !ALIEXPRESS_SECRET_KEY || !ALIEXPRESS_TRACKING_ID) {
    throw new Error('Credenciais do AliExpress não configuradas no arquivo .env');
  }

  try {
    const timestamp = Date.now().toString();
    const params = {
      app_key: ALIEXPRESS_API_KEY,
      method: 'aliexpress.affiliate.hotproduct.query',
      timestamp: timestamp,
      format: 'json',
      v: '2.0',
      sign_method: 'sha256',
      tracking_id: ALIEXPRESS_TRACKING_ID,
      page_no: page,
      page_size: pageSize,
      target_currency: 'BRL',
      target_language: 'PT',
      ship_to_country: 'BR'
    };

    if (categoryId) params.category_ids = categoryId;

    params.sign = generateSignature(params, ALIEXPRESS_SECRET_KEY);

    const response = await axios.get(API_BASE_URL, {
      params: params,
      timeout: 10000
    });

    if (response.data.error_response) {
      throw new Error(`Erro da API AliExpress: ${response.data.error_response.msg}`);
    }

    const products = response.data.aliexpress_affiliate_hotproduct_query_response?.resp_result?.result?.products || [];
    
    return products.map(product => ({
      title: product.product_title,
      description: product.product_title,
      url: product.promotion_link,
      imageUrl: product.product_main_image_url,
      originalPrice: product.original_price,
      salePrice: product.sale_price,
      discount: product.discount,
      currency: product.target_sale_price_currency,
      commission: product.commission_rate,
      categoryId: product.category_id,
      sellerId: product.seller_id,
      volume: product.volume,
      productId: product.product_id,
      evaluateRate: product.evaluate_rate,
      hotProductCommissionRate: product.hot_product_commission_rate
    }));

  } catch (error) {
    console.error('Erro ao buscar hot products do AliExpress:', error.message);
    throw new Error(`Falha ao conectar com a API do AliExpress: ${error.message}`);
  }
}

// Função para gerar link de afiliado personalizado
async function generateAffiliateLink(productUrl) {
  
  if (!ALIEXPRESS_API_KEY || !ALIEXPRESS_SECRET_KEY || !ALIEXPRESS_TRACKING_ID) {
    throw new Error('Credenciais do AliExpress não configuradas no arquivo .env');
  }

  try {
    const timestamp = Date.now().toString();
    const params = {
      app_key: ALIEXPRESS_API_KEY,
      method: 'aliexpress.affiliate.link.generate',
      timestamp: timestamp,
      format: 'json',
      v: '2.0',
      sign_method: 'sha256',
      tracking_id: ALIEXPRESS_TRACKING_ID,
      source_values: productUrl,
      promotion_link_type: 0 // 0 para link normal, 1 para link customizado
    };

    params.sign = generateSignature(params, ALIEXPRESS_SECRET_KEY);

    const response = await axios.get(API_BASE_URL, {
      params: params,
      timeout: 10000
    });

    if (response.data.error_response) {
      throw new Error(`Erro da API AliExpress: ${response.data.error_response.msg}`);
    }

    const result = response.data.aliexpress_affiliate_link_generate_response?.resp_result?.result;
    return result?.promotion_links?.[0]?.promotion_link || productUrl;

  } catch (error) {
    console.error('Erro ao gerar link de afiliado:', error.message);
    return productUrl; // Retorna o link original se falhar
  }
}

// Função para buscar categorias disponíveis
async function fetchAliExpressCategories() {
  
  if (!ALIEXPRESS_API_KEY || !ALIEXPRESS_SECRET_KEY) {
    throw new Error('Credenciais do AliExpress não configuradas no arquivo .env');
  }

  try {
    const timestamp = Date.now().toString();
    const params = {
      app_key: ALIEXPRESS_API_KEY,
      method: 'aliexpress.affiliate.category.get',
      timestamp: timestamp,
      format: 'json',
      v: '2.0',
      sign_method: 'sha256'
    };

    params.sign = generateSignature(params, ALIEXPRESS_SECRET_KEY);

    const response = await axios.get(API_BASE_URL, {
      params: params,
      timeout: 10000
    });

    if (response.data.error_response) {
      throw new Error(`Erro da API AliExpress: ${response.data.error_response.msg}`);
    }

    return response.data.aliexpress_affiliate_category_get_response?.resp_result?.result?.categories || [];

  } catch (error) {
    console.error('Erro ao buscar categorias do AliExpress:', error.message);
    throw new Error(`Falha ao buscar categorias: ${error.message}`);
  }
}

module.exports = { 
  fetchAliExpressPromotions,
  fetchAliExpressProductsByCategory,
  fetchAliExpressHotProducts,
  generateAffiliateLink,
  fetchAliExpressCategories,
  saveAliExpressPromotionsToDb,
  getAliExpressAffiliate
};
