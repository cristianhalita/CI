const express = require('express');
const app = express();

const path = require('path');

app.set('views', path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

const router = require('./routers/jobs');

app.use('/', router);

module.exports = app;
