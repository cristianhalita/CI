const express = require('express');
const router = express();
const controller = require('../controllers/pm-login');

router.post('/',  controller.post);

module.exports = router;