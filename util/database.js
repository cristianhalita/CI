const mysql = require('mysql2');
const fs = require('fs');

let connectionParams = {
    host: process.env.mySqlHost,
    user: process.env.mySqlUser,
    password: process.env.mySqlPassword,
    port: process.env.mySqlPort,
    database: "datamundi",
    decimalNumbers: true
}

if (process.env.mySqlCertificate) {
    connectionParams.ssl = {
        ca: fs.readFileSync(process.env.mySqlCertificate)
    }
}

console.log(connectionParams);

const connection = mysql.createPool(connectionParams);

module.exports = {connection, connectionParams};