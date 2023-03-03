const {connection} = require('../util/database');

async function createOne(NDAId, freelancerId) {
    const sql = "INSERT INTO freelancers_NDA(NDAId, freelancerId) VALUES (?,?)";
    const [result] = await connection.promise().query(sql, [NDAId, freelancerId]);

    return result;
}

async function getAll(freelancerId) {
    const sql = "SELECT id, NDAId FROM freelancers_NDA WHERE freelancerId = ?";
    const [rows] = await connection.promise().query(sql, [freelancerId]);

    return rows;
}

exports.getAll = getAll;
exports.createOne = createOne;