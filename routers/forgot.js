const express = require('express');
const router = express.Router();

const forgotController = require('../controllers/forgot');

router.get('/', forgotController.get);
router.post('/', forgotController.post);

module.exports = router;