const {connection} = require('../util/database');

async function getAll() {
    const sql = "SELECT * FROM origins";
    const [rows] = await connection.promise().query(sql);

    return rows;
}

exports.getAll = getAll;