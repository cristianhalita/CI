const {connection} = require('../util/database');

async function getMargin(lspId) {
    const sql = "SELECT margin FROM lsps WHERE id = ?";
    const [rows] = await connection.promise().query(sql, [lspId]);
    return rows[0].margin;
}

exports.getById = async (id) => {
    const sql = "SELECT * FROM lsps WHERE id = ?";
    const [[row]] = await connection.promise().query(sql, [id]);
    return row || null;
};

exports.getMargin = getMargin;
