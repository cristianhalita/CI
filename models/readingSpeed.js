const {connection} = require('../util/database');

async function createOne(freelancerId, timeSpend, linkClicked) {
    console.log(timeSpend);

    const sql = "INSERT INTO readingSpeed(freelancerId, timeSpend, linkClicked) VALUES (?,?,?)";
    const [result] = await connection.promise().query(sql, [freelancerId, timeSpend, linkClicked]);
    return result;
}

async function getAll(freelancerId) {
    const sql = "SELECT id FROM readingSpeed WHERE freelancerId = ?";
    const [rows] = await connection.promise().query(sql, [freelancerId]);
    return rows;
}

exports.getAll = getAll;
exports.createOne = createOne;