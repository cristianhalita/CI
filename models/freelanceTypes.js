const {connection} = require('../util/database');

async function getFreelanceTypes() {
    let sql = "SELECT * FROM freelanceTypes";

    const [rows] = await connection.promise().query(sql);
    return rows;
}

exports.getAll = getFreelanceTypes;