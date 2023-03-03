const {connection} = require('../util/database');

async function getAll() {
    const sql = "SELECT * FROM invoiceTypes";
    const [rows] = await connection.promise().query(sql, []);
    return rows;
}

async function getOne(invoiceTypeId) {
    const sql = "SELECT name FROM invoiceTypes WHERE id = ?";
    const [rows] = await connection.promise().query(sql, [invoiceTypeId]);
    return rows;
}

exports.getOne = getOne;
exports.getAll = getAll;