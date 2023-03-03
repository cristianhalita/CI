const {connection} = require('../util/database');

async function getAll() {
    let sql = "SELECT * FROM paymentMethods WHERE name NOT LIKE '%NO LONGER SUPPORTED%'";

    const [rows] = await connection.promise().query(sql, []);
    return rows;
}

async function getName(id) {
    let sql = "SELECT name FROM paymentMethods WHERE id = ?";

    const [rows] = await connection.promise().query(sql, [id]);

    if (rows.length < 1) {
        throw new Error("Couldn't find payment method with id " + id);
    }
    else {
        return rows[0].name;
    }
}

exports.getName = getName;
exports.getAll = getAll;