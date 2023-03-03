const {connection} = require('../util/database');

async function getAll() {
    const sql = "SELECT * FROM skills";
    const [rows] = await connection.promise().query(sql);
    return rows;
}

exports.getAll = getAll;
