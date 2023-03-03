const {connection} = require('../util/database');

async function getOne(freelancerId) {
    const sql = "SELECT * FROM emailNotifications WHERE freelancerId = ?";
    const [rows] = await connection.promise().query(sql, [freelancerId]);

    if (rows.length < 1) {
        return null;
    }
    else {
        return rows[0];
    }
}

async function createOne(freelancerId, assigned, deadLineIn24Hours, invoicePayed, bonusCreated) {
    const sql = "INSERT INTO emailNotifications(freelancerId, assigned, deadLineIn24Hours, invoicePayed, bonusCreated) VALUES (?,?,?,?,?)";
    const [result] = await connection.promise().query(sql, [freelancerId, assigned, deadLineIn24Hours, invoicePayed, bonusCreated]);
    return result;
}

async function update(freelancerId, assigned, deadLineIn24Hours, invoicePayed, bonusCreated) {
    const sql = "UPDATE emailNotifications SET assigned = ?, deadLineIn24Hours = ?, invoicePayed = ?, bonusCreated = ? WHERE freelancerId = ?";
    const [result] = await connection.promise().query(sql, [assigned, deadLineIn24Hours, invoicePayed, bonusCreated, freelancerId]);
    return result;
}

exports.createOne = createOne;
exports.update = update;
exports.getOne = getOne;