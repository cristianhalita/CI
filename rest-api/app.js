const express = require('express');
const app = express();

app.use('/v1/messages', require('./routers/messages'));
app.use('/v1/auth', require('./routers/auth'));

module.exports = app;