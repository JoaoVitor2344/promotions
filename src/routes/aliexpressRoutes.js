const express = require('express');
const router = express.Router();
const aliexpressController = require('../controllers/aliexpressController');

router.post('/import', aliexpressController.importAliExpressPromotions);

module.exports = router; 