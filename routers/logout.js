const express = require('express');
const router = express();

const controller = require('../controllers/logout');

router.post('/', controller.post);

module.exports = router;