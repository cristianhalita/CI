const {connection} = require('../util/database');

async function getLanguages() {
    const sql = "SELECT * FROM languages";

    const [rows] = await connection.promise().query(sql);
    return rows;
}

async function getDirection(languageId) {
    const sql = "SELECT d.name AS direction FROM languages JOIN languageDirections d ON d.id = languages.languageDirectionId " +
        "WHERE languages.id = ?";
    const [rows] = await connection.promise().query(sql, [languageId]);

    if (rows.length < 1) {
        throw new Error("No language found with id " + languageId);
    }
    else {
        return rows[0].direction;
    }
}

async function getLangTag(languageId) {
    const sql = "SELECT langTag FROM languages WHERE languages.id = ?";
    const [rows] = await connection.promise().query(sql, [languageId]);

    if (rows.length < 1) {
        throw new Error("No language found with id " + languageId);
    }
    else {
        return rows[0].langTag;
    }
}

async function getName(languageId) {
    const sql = "SELECT name FROM languages WHERE id = ?";
    const [[{name}]] = await connection.promise().query(sql, [languageId]);
    return name;
}

exports.getName = getName;
exports.getLangTag = getLangTag;
exports.getAll = getLanguages;
exports.getDirection = getDirection;