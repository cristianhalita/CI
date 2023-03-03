const express = require('express');
const router = express.Router();

const controller = require('../controllers/overview');

router.get('/', controller.get);

module.exports = router;
