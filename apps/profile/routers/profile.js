const express = require('express');
const router = express.Router();

const controller = require('../controllers/profile');

router.get('/', controller.get);

const personalRouter = require('./personal');
const professionalRouter = require('./professional');
const paymentRouter = require('./payment');
const ndaRouter = require('./nda');
const deleteRouter = require('./delete');
const messagesRouter = require('./messages');
const settingsRouter = require('./settings');
const datamundiStaffChatRouter = require('./datamundiStaffChat');

const checkedNotifications = require('../../../middlewares/checkedNotifications');
const isNotSubcontractor = require('../../../middlewares/isNotSubcontractor');

router.use('/personal', checkedNotifications, isNotSubcontractor, personalRouter);
router.use('/professional', checkedNotifications, isNotSubcontractor, professionalRouter);
router.use('/payment', checkedNotifications, isNotSubcontractor, paymentRouter);
router.use('/nda', checkedNotifications, ndaRouter);
router.use('/delete', checkedNotifications, isNotSubcontractor, deleteRouter);
router.use('/messages', messagesRouter);
router.use('/settings', checkedNotifications, settingsRouter);
router.use('/datamundiStaffChat', checkedNotifications, datamundiStaffChatRouter);

router.get('/help', checkedNotifications, controller.help);

module.exports = router;
