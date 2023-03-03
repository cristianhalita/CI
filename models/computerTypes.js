const {connection} = require('../util/database');

async function getComputerTypes() {
    let sql = "SELECT * FROM computerTypes";

    let [rows] = await connection.promise().query(sql, []);
    return rows;
}

exports.getAll = getComputerTypes;