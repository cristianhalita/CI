const {connection} = require('../util/database');

async function getAll() {
    const sql = "SELECT id, NDA, subcontractor FROM NDA";
    const [rows] = await connection.promise().query(sql);

    return rows;
}

exports.getAll = getAll;