const express = require('express');
const app = express();

const path = require('path');

app.set('views', path.join(__dirname, "views"));

const router = require('./routers/invoices');

app.use('/', router);

module.exports = app;
