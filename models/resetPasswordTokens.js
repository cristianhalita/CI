const {connection} = require('../util/database');

exports.insert = async (resetPasswordToken) => {
    const sql = "INSERT INTO resetPasswordTokens SET ?";
    const [result] = await connection.promise().query(sql, [resetPasswordToken]);
    return result;
};

exports.getByToken = async (token) => {
    const sql = "SELECT * FROM resetPasswordTokens WHERE token = ?";
    const [[row]] = await connection.promise().execute(sql, [token]);
    return row || null;
};

exports.deleteById = async (id) => {
    const sql = "DELETE FROM resetPasswordTokens WHERE id = ?";
    const [result] = await connection.promise().execute(sql, [id]);
    return result;
}