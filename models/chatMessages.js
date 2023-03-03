const {connection} = require('../util/database');

exports.getByInvoiceId = async (invoiceId) => {
	const sql = "SELECT *, DATE_FORMAT(stamp, '%Y-%m-%d %H:%i:%s') AS stamp FROM chatMessages WHERE invoiceId = ?";
	const [rows] = await connection.promise().query(sql, [invoiceId]);
	return rows;
};

exports.getByFreelancerId = async (freelancerId) => {
	const sql = "SELECT chatMessages.*, DATE_FORMAT(chatMessages.stamp, '%Y-%m-%d %H:%i:%s') AS stamp FROM chatMessages JOIN invoices i ON i.id = chatMessages.invoiceId WHERE i.freelancerId = ? ORDER BY chatMessages.id ASC";
	const [rows] = await connection.promise().query(sql, [freelancerId]);
	return rows;
};