const express = require('express');
const router = express.Router();
const sendLogController = require('../controllers/sendLogController');

router.get('/', sendLogController.getSendLogs);

module.exports = router; 