const {connection} = require('../util/database');

async function checkEmail(email) {
    const sql = "SELECT id FROM scammers WHERE email = ?";
    const [rows] = await connection.promise().query(sql, [email]);

    if (rows.length > 0) {
        return rows[0].id;
    }
    else {
        return false;
    }
}

exports.checkEmail = checkEmail;