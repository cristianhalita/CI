const express = require('express');
const router = express.Router();

const controller = require('../controllers/invoices');

const paidRouter = require('./paid');
const notPaidRouter = require('./notPaid');
const overviewRouter = require('./overview');

router.use('/paid', paidRouter);
router.use('/notPaid', notPaidRouter);
router.use('/overview', overviewRouter);

router.get('/help', controller.help);
router.get('/:id', controller.getOne);

router.post('/login', controller.login);

// router.get('/', controller.get);

module.exports = router;
