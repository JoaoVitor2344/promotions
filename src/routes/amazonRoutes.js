const express = require('express');
const router = express.Router();
const amazonController = require('../controllers/amazonController');

router.post('/import', amazonController.importAmazonPromotions);

module.exports = router; 