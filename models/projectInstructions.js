const {connection} = require('../util/database');

exports.getByProjectId = async (projectId) => {
	const sql = "SELECT pI.*, wI.fileName FROM projectInstructions pI JOIN workTypeInstructions wI ON wI.id = pI.workTypeInstructionId WHERE pI.projectId = ? ORDER BY wI.id ASC";
	const [rows] = await connection.promise().query(sql, [projectId]);
	return rows;
};