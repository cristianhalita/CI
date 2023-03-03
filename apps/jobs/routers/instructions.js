const express = require('express');
const router = express.Router({mergeParams: true});

const controller = require('../controllers/instructions');

router.get('/:instruction', controller.get);

module.exports = router;
