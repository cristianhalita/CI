const {connection} = require('../util/database');

async function getMessages() {
    const sql = "SELECT id, message, DATE_FORMAT(stamp, '%d-%m-%Y') AS stamp, stamp AS orderStamp FROM messages stamp " +
        "WHERE type = 'message' ORDER BY orderStamp DESC";

    const [rows] = await connection.promise().query(sql);
    return rows;
}

async function getWarnings() {
    const sql = "SELECT id, message, DATE_FORMAT(stamp, '%d-%m-%Y') AS stamp, stamp AS orderStamp FROM messages WHERE" +
        " type = 'warning' ORDER BY orderStamp DESC";

    const [rows] = await connection.promise().query(sql);
    return rows;
}

async function getAll() {
    const sql = "SELECT id FROM messages";
    const [rows] = await connection.promise().query(sql);

    return rows;
}

exports.getAll = getAll;
exports.getMessages = getMessages;
exports.getWarnings = getWarnings;