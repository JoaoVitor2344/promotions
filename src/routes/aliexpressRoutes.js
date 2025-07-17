const express = require("express");
const router = express.Router();
const aliexpressController = require("../controllers/aliexpressController");

// Importar promoções por palavra-chave
router.post(
  "/import/promotions",
  aliexpressController.importAliExpressPromotions
);

// Importar produtos por categoria
router.post(
  "/import/category",
  aliexpressController.importAliExpressProductsByCategory
);

// Importar hot products
router.post(
  "/import/hot-products",
  aliexpressController.importAliExpressHotProducts
);

// Gerar link de afiliado
router.post(
  "/generate-affiliate-link",
  aliexpressController.generateAffiliateLink
);

// Buscar categorias disponíveis
router.get("/categories", aliexpressController.getAliExpressCategories);

// Atualizar preços de produtos existentes
router.post("/update-prices", aliexpressController.updateAliExpressPrices);

module.exports = router;
