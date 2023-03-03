const {connection} = require('../util/database');

async function updateFreelancerId(freelancerId, email) {
    const sql = "UPDATE testResults SET freelancerId = ? WHERE email = ?";
    const [result] = await connection.promise().query(sql, [freelancerId, email]);
    return result;
}

exports.updateFreelancerId = updateFreelancerId;