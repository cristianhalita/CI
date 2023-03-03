const {connectionParams} = require('./util/database');
const session = require("express-session");

const MySQLStore = require('express-mysql-session')(session);
const store = new MySQLStore(connectionParams);

const cookie = {
    maxAge: 3600000
};

if (process.env.NODE_ENV === "eu") {
    cookie.domain = "datamundi.eu";
}
else if (process.env.NODE_ENV === "production") {
    cookie.domain = "datamundi.space";
}

module.exports = session({
    name: "datamundi-portals",
    resave: false,
    saveUninitialized: false,
    secret: "sdf655sd65f4152dsf1//*dsfc",
    store: store,
    cookie,
    rolling: true
});