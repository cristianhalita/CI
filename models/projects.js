const {connection} = require('../util/database');

async function getInstructions(projectId) {
    const sql = "SELECT instruction1, instruction2, instruction3, instruction4, instruction5 FROM projects WHERE id = ?";
    const [rows] = await connection.promise().query(sql, [projectId]);
    return rows[0];
}

async function getOne(projectId) {
    const sql = "SELECT * FROM projects WHERE id = ?";
    const [rows] = await connection.promise().query(sql, [projectId]);
    return rows[0];
}

exports.getOne = getOne;
exports.getInstructions = getInstructions;