const {connection} = require('../util/database');

async function insert(domainsOfExpertiseId, freelancerId) {
    const sql = "INSERT INTO freelancers_domainsOfExpertise (domainsOfExpertiseId, freelancerId) VALUES (?,?)";
    const [result] = await connection.promise().query(sql, [domainsOfExpertiseId, freelancerId]);
    return result;
}

async function removeAll(freelancerId) {
    const sql = "DELETE FROM freelancers_domainsOfExpertise WHERE freelancerId = ?";
    const [result] = await connection.promise().query(sql, [freelancerId]);
    return result;
}

async function getAll(freelancerId) {
    const sql = "SELECT domainsOfExpertiseId FROM freelancers_domainsOfExpertise WHERE freelancerId = ?";
    const [rows] = await connection.promise().query(sql, [freelancerId]);
    return rows.map(row => row.domainsOfExpertiseId);
}

exports.getAll = getAll;
exports.insert = insert;
exports.removeAll = removeAll;
