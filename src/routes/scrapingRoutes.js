const express = require('express');
const router = express.Router();
const scrapingController = require('../controllers/scrapingController');

router.post('/magalu/import', scrapingController.importMagaluPromotions);

module.exports = router; 