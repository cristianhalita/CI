const {connection} = require('../util/database');

async function getWorkTimes() {
    let sql = "SELECT * FROM workTimes";

    const [rows] = await connection.promise().query(sql);
    return rows
}

exports.getAll = getWorkTimes;