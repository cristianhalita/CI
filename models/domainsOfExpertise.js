const {connection} = require('../util/database');

async function getAll() {
    const sql = "SELECT * FROM domainsOfExpertise";
    const [rows] = await connection.promise().query(sql);
    return rows;
}

exports.getAll = getAll;
