const express = require('express');
const router = express.Router();

const controller = require('../controllers/messages');

router.post('/read', controller.readMessage);
router.post('/unRead', controller.unReadMessage);

module.exports = router;
