const {connection} = require('../util/database');

async function getWorkTypes(freelancerId) {
    const sql = "SELECT workTypeId FROM freelancers_workTypes WHERE freelancerId = ?";

    const [rows] = await connection.promise().query(sql, [freelancerId]);
    return rows;
}

exports.getWorkTypes = getWorkTypes;