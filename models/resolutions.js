const {connection} = require('../util/database');

async function createOne(freelancerId, width, height) {
    const sql = "INSERT INTO resolutions (freelancerId, width, height) VALUES(?,?,?)";
    const [result] = await connection.promise().query(sql, [freelancerId, width, height]);

    return result;
}

exports.createOne = createOne;
