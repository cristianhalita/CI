const {connection} = require('../util/database');

async function createOne (freelancerId, ip) {
    const sql = "INSERT INTO freelancers_ips (freelancerId, ip) VALUES (?,?)";
    const [result] = await connection.promise().query(sql, [freelancerId, ip]);

    return result;
}

async function getLastIp(freelancerId) {
    const sql = "SELECT ip FROM freelancers_ips WHERE freelancerId = ? ORDER BY id DESC LIMIT 1";
    const [rows] = await connection.promise().query(sql, [freelancerId]);
    if (rows.length > 0) {
        return rows[0].ip;
    }
    else {
        return null;
    }
}

exports.getLastIp = getLastIp;
exports.createOne = createOne;