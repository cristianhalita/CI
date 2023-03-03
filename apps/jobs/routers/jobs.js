const express = require('express');
const router = express.Router();

const controller = require('../controllers/job');
const screenshotController = require('../controllers/screenshot');
const videoController = require('../controllers/video');
const previewController = require('../controllers/preview');


const availableRouter = require('./available');
const inProgressRouter = require('./inProgress');
const deliveredRouter = require('./delivered');
const instructionsRouter = require('./instructions');
const generateInvoiceRouter = require('./generateInvoice');

const isNotSubcontractor = require('../../../middlewares/isNotSubcontractor');

router.use('/delivered', deliveredRouter);
router.use('/available', availableRouter);
router.use('/inProgress', inProgressRouter);
router.use('/generateInvoice', isNotSubcontractor, generateInvoiceRouter);

router.get('/help', controller.help);
router.get('/:id', controller.get);
router.post('/:id/take', controller.take);
router.post('/:id/deliver', controller.deliver);
router.get('/:id/screenshot', screenshotController.get);
router.get('/:id/video', videoController.get);
router.get('/:id/preview', previewController.get);

router.use('/:id/instructions', instructionsRouter);

module.exports = router;
