const express = require('express');
const router = express.Router();
const affiliateController = require('../controllers/affiliateController');

router.get('/', affiliateController.getAllAffiliates);
router.post('/', affiliateController.createAffiliate);
router.put('/:id', affiliateController.updateAffiliate);
router.delete('/:id', affiliateController.deleteAffiliate);

module.exports = router; 