const {connection} = require('../util/database');

async function createOne(scammerId, ip) {
    const sql = "INSERT INTO scammerAttempts (scammerId, ip) VALUES (?,?)";
    const [result] = await connection.promise().query(sql, [scammerId, ip]);
    return result;
}

exports.createOne = createOne;