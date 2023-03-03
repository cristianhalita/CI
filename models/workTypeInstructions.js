const {connection} = require('../util/database');

exports.getById = async (id) => {
	const sql = "SELECT * FROM workTypeInstructions WHERE id = ?";
	const [[row]] = await connection.promise().query(sql, [id]);
	return row;
};