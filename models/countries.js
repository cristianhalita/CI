const {connection} = require('../util/database');

async function getCountries() {
    const sql = "SELECT * FROM countries";
    const [rows] = await connection.promise().query(sql);
    return rows;
}

async function getName(countryId) {
    const sql = "SELECT name FROM countries WHERE id = ?";
    const [rows] = await connection.promise().query(sql, [countryId]);
    if (rows.length < 1) {
        throw new Error("Couldn't find country with id " + countryId);
    }
    else {
        return rows[0].name;
    }
}

exports.getName = getName;
exports.getAll = getCountries;
