const {connection} = require('../util/database');

async function getAll() {
    const sql = "SELECT email FROM pms";
    const [rows] = await connection.promise().query(sql, []);
    return rows;
}

async function getOne(pmId) {
    const sql = "SELECT id, firstName, email FROM pms WHERE id = ?";
    const [rows] = await connection.promise().query(sql, [pmId]);
    return rows[0];
}

exports.getOne = getOne;
exports.getAll = getAll;