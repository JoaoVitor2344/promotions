const prisma = require("../models/promotion");
const {
  fetchAliExpressPromotions,
  fetchAliExpressProductsByCategory,
  fetchAliExpressHotProducts,
  generateAffiliateLink,
  fetchAliExpressCategories,
  exchangeCodeForToken,
} = require("../services/aliexpressService");

// Importar promoções do AliExpress por palavra-chave
exports.importAliExpressPromotions = async (req, res) => {
  const {
    keyword = "promo",
    page = 1,
    pageSize = 20,
    category = null,
    minPrice = null,
    maxPrice = null,
    sort = "SALE_PRICE_ASC",
  } = req.body;

  try {
    const promos = await fetchAliExpressPromotions({
      keyword,
      page,
      pageSize,
      category,
      minPrice,
      maxPrice,
      sort,
    });

    let imported = 0;
    let updated = 0;

    for (const promo of promos) {
      // Verificar se já existe pelo productId (mais confiável que URL)
      const existingPromo = await prisma.promotion.findFirst({
        where: {
          OR: [{ url: promo.url }, { productId: promo.productId?.toString() }],
        },
      });

      const promoData = {
        title: promo.title,
        description: promo.description,
        url: promo.url,
        imageUrl: promo.imageUrl,
        originalPrice: promo.originalPrice,
        salePrice: promo.salePrice,
        discount: promo.discount,
        currency: promo.currency,
        commission: promo.commission,
        categoryId: promo.categoryId?.toString(),
        sellerId: promo.sellerId?.toString(),
        volume: promo.volume,
        productId: promo.productId?.toString(),
        evaluateRate: promo.evaluateRate,
        hotProductCommissionRate: promo.hotProductCommissionRate,
        source: "aliexpress",
        approved: false,
        updatedAt: new Date(),
      };

      if (existingPromo) {
        // Atualizar promoção existente
        await prisma.promotion.update({
          where: { id: existingPromo.id },
          data: promoData,
        });
        updated++;
      } else {
        // Criar nova promoção
        await prisma.promotion.create({
          data: {
            ...promoData,
            createdAt: new Date(),
          },
        });
        imported++;
      }
    }

    res.json({
      message: `Promoções do AliExpress processadas com sucesso!`,
      imported,
      updated,
      total: promos.length,
    });
  } catch (error) {
    console.error("Erro ao importar promoções do AliExpress:", error);
    res.status(500).json({
      error: "Erro ao importar promoções do AliExpress.",
      details: error.message,
    });
  }
};

// Importar produtos por categoria
exports.importAliExpressProductsByCategory = async (req, res) => {
  const {
    categoryId,
    page = 1,
    pageSize = 20,
    sort = "SALE_PRICE_ASC",
  } = req.body;

  if (!categoryId) {
    return res.status(400).json({ error: "Category ID é obrigatório" });
  }

  try {
    const promos = await fetchAliExpressProductsByCategory({
      categoryId,
      page,
      pageSize,
      sort,
    });

    let imported = 0;
    let updated = 0;

    for (const promo of promos) {
      const existingPromo = await prisma.promotion.findFirst({
        where: {
          OR: [{ url: promo.url }, { productId: promo.productId?.toString() }],
        },
      });

      const promoData = {
        title: promo.title,
        description: promo.description,
        url: promo.url,
        imageUrl: promo.imageUrl,
        originalPrice: promo.originalPrice,
        salePrice: promo.salePrice,
        discount: promo.discount,
        currency: promo.currency,
        commission: promo.commission,
        categoryId: promo.categoryId?.toString(),
        sellerId: promo.sellerId?.toString(),
        volume: promo.volume,
        productId: promo.productId?.toString(),
        evaluateRate: promo.evaluateRate,
        hotProductCommissionRate: promo.hotProductCommissionRate,
        source: "aliexpress",
        approved: false,
        updatedAt: new Date(),
      };

      if (existingPromo) {
        await prisma.promotion.update({
          where: { id: existingPromo.id },
          data: promoData,
        });
        updated++;
      } else {
        await prisma.promotion.create({
          data: {
            ...promoData,
            createdAt: new Date(),
          },
        });
        imported++;
      }
    }

    res.json({
      message: `Produtos da categoria ${categoryId} processados com sucesso!`,
      imported,
      updated,
      total: promos.length,
    });
  } catch (error) {
    console.error("Erro ao importar produtos por categoria:", error);
    res.status(500).json({
      error: "Erro ao importar produtos por categoria.",
      details: error.message,
    });
  }
};

// Importar hot products (produtos em alta)
exports.importAliExpressHotProducts = async (req, res) => {
  const { page = 1, pageSize = 20, categoryId = null } = req.body;

  try {
    const promos = await fetchAliExpressHotProducts({
      page,
      pageSize,
      categoryId,
    });

    let imported = 0;
    let updated = 0;

    for (const promo of promos) {
      const existingPromo = await prisma.promotion.findFirst({
        where: {
          OR: [{ url: promo.url }, { productId: promo.productId?.toString() }],
        },
      });

      const promoData = {
        title: promo.title,
        description: promo.description,
        url: promo.url,
        imageUrl: promo.imageUrl,
        originalPrice: promo.originalPrice,
        salePrice: promo.salePrice,
        discount: promo.discount,
        currency: promo.currency,
        commission: promo.commission,
        categoryId: promo.categoryId?.toString(),
        sellerId: promo.sellerId?.toString(),
        volume: promo.volume,
        productId: promo.productId?.toString(),
        evaluateRate: promo.evaluateRate,
        hotProductCommissionRate: promo.hotProductCommissionRate,
        source: "aliexpress",
        approved: false,
        isHotProduct: true,
        updatedAt: new Date(),
      };

      if (existingPromo) {
        await prisma.promotion.update({
          where: { id: existingPromo.id },
          data: promoData,
        });
        updated++;
      } else {
        await prisma.promotion.create({
          data: {
            ...promoData,
            createdAt: new Date(),
          },
        });
        imported++;
      }
    }

    res.json({
      message: `Hot products processados com sucesso!`,
      imported,
      updated,
      total: promos.length,
    });
  } catch (error) {
    console.error("Erro ao importar hot products:", error);
    res.status(500).json({
      error: "Erro ao importar hot products.",
      details: error.message,
    });
  }
};

// Gerar link de afiliado para um produto específico
exports.generateAffiliateLink = async (req, res) => {
  const { productUrl } = req.body;

  if (!productUrl) {
    return res.status(400).json({ error: "URL do produto é obrigatória" });
  }

  try {
    const affiliateLink = await generateAffiliateLink(productUrl);

    res.json({
      originalUrl: productUrl,
      affiliateLink: affiliateLink,
      message: "Link de afiliado gerado com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao gerar link de afiliado:", error);
    res.status(500).json({
      error: "Erro ao gerar link de afiliado.",
      details: error.message,
    });
  }
};

// Buscar categorias disponíveis
exports.getAliExpressCategories = async (req, res) => {
  try {
    const categories = await fetchAliExpressCategories();

    res.json({
      categories: categories,
      total: categories.length,
      message: "Categorias buscadas com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    res.status(500).json({
      error: "Erro ao buscar categorias.",
      details: error.message,
    });
  }
};

// Atualizar preços de produtos existentes
exports.updateAliExpressPrices = async (req, res) => {
  try {
    const existingPromotions = await prisma.promotion.findMany({
      where: {
        source: "aliexpress",
        productId: { not: null },
      },
      select: { id: true, productId: true, url: true },
    });

    let updated = 0;
    let errors = 0;

    for (const promotion of existingPromotions) {
      try {
        // Buscar informações atualizadas do produto
        const updatedPromos = await fetchAliExpressPromotions({
          keyword: "",
          page: 1,
          pageSize: 1,
        });

        if (updatedPromos.length > 0) {
          const updatedPromo = updatedPromos[0];

          await prisma.promotion.update({
            where: { id: promotion.id },
            data: {
              originalPrice: updatedPromo.originalPrice,
              salePrice: updatedPromo.salePrice,
              discount: updatedPromo.discount,
              commission: updatedPromo.commission,
              volume: updatedPromo.volume,
              evaluateRate: updatedPromo.evaluateRate,
              updatedAt: new Date(),
            },
          });

          updated++;
        }
      } catch (error) {
        console.error(
          `Erro ao atualizar produto ${promotion.productId}:`,
          error
        );
        errors++;
      }
    }

    res.json({
      message: `Atualização de preços concluída!`,
      updated,
      errors,
      total: existingPromotions.length,
    });
  } catch (error) {
    console.error("Erro ao atualizar preços:", error);
    res.status(500).json({
      error: "Erro ao atualizar preços.",
      details: error.message,
    });
  }
};

// Handler para o callback do AliExpress OAuth
exports.aliexpressCallback = async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    return res.status(400).json({ error, error_description });
  }

  if (!code) {
    return res
      .status(400)
      .json({ error: "Código de autorização não recebido." });
  }

  // Troca o código pelo token de acesso (real)
  const tokenData = await exchangeCodeForToken(code);

  // Se obtiver access_token, salva no Affiliate
  if (tokenData.access_token) {
    // Procura o Affiliate do AliExpress
    const affiliate = await prisma.affiliate.findFirst({
      where: { platform: "AliExpress" },
    });
    if (affiliate) {
      await prisma.affiliate.update({
        where: { id: affiliate.id },
        data: { accessToken: tokenData.access_token },
      });
    }
  }

  return res.json({
    message: "Código de autorização recebido com sucesso!",
    code,
    state,
    tokenData,
  });
};

module.exports = exports;
