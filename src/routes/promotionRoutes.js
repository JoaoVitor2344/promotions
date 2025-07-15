const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');

router.get('/', promotionController.getAllPromotions);
router.post('/', promotionController.createPromotion);
router.put('/:id', promotionController.editPromotion);
router.delete('/:id', promotionController.deletePromotion);
router.post('/:id/send-telegram', promotionController.sendPromotionToTelegram);
router.get('/pending', promotionController.getPendingPromotions);
router.post('/:id/approve', promotionController.approvePromotion);
router.post('/auto-approve', promotionController.autoApprovePromotions);

module.exports = router; 