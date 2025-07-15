const express = require('express');
const router = express.Router();
const mercadoLivreController = require('../controllers/mercadoLivreController');

router.post('/import', mercadoLivreController.importMercadoLivrePromotions);

module.exports = router; 