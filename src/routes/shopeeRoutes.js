const express = require('express');
const router = express.Router();
const shopeeController = require('../controllers/shopeeController');

router.post('/import', shopeeController.importShopeePromotions);

module.exports = router; 