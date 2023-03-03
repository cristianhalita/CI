const {connection} = require('../util/database');

async function getTimeZones() {
    let sql = "SELECT * FROM timeZones";

    const [rows] = await connection.promise().query(sql);
    return rows;
}

exports.getAll = getTimeZones;