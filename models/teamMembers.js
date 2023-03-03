const {connection} = require('../util/database');

exports.getAll = async (teamId) => {
	const sql = "SELECT * FROM teamMembers WHERE teamId = ?";
	const [rows] = await connection.promise().query(sql, [teamId]);
	return rows;
};
