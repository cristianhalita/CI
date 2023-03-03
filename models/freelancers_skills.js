const {connection} = require('../util/database');

async function insert(skillId, freelancerId, score) {
    const sql = "INSERT INTO freelancers_skills (skillId, freelancerId, score) VALUES (?,?,?)";
    const [result] = await connection.promise().query(sql, [skillId, freelancerId, score]);
    return result;
}

async function removeAll(freelancerId) {
    const sql = "DELETE FROM freelancers_skills WHERE freelancerId = ?";
    const [result] = await connection.promise().query(sql, [freelancerId]);
    return result;
}

async function getOne(skillId, freelancerId) {
    const sql = "SELECT id FROM freelancers_skills WHERE skillId = ? AND freelancerId = ?";
    const [rows] = await connection.promise().query(sql, [skillId, freelancerId]);
    if (rows.length <= 0) {
        return null;
    }
    else {
        return rows[0];
    }
}

async function updateOne(freelancers_skillsId, score) {
    const sql = "UPDATE freelancers_skills SET score = ? WHERE id = ?";
    const [result] = await connection.promise().query(sql, [score, freelancers_skillsId]);
    return result;
}

async function getAll(freelancerId) {
    const sql = "SELECT skillId, score FROM freelancers_skills WHERE freelancerId = ?";
    const [rows] = await connection.promise().query(sql, [freelancerId]);
    return rows;
}

async function deleteOne(freelancers_skillsId) {
    const sql = "DELETE FROM freelancers_skills WHERE id = ?";
    const [result] = await connection.promise().query(sql, [freelancers_skillsId]);
    return result;
}

exports.deleteOne = deleteOne;
exports.getAll = getAll;
exports.insert = insert;
exports.removeAll = removeAll;
exports.getOne = getOne;
exports.updateOne = updateOne;
