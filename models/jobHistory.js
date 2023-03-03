const {connection} = require('../util/database');

async function createOne(jobId, status) {
    const sql = "INSERT INTO jobHistory (jobId, status) VALUES (?,?)";
    const [result] = await connection.promise().query(sql, [jobId, status]);
    return result;
}

exports.createOne = createOne;