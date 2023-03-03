const {connection} = require('../util/database');

async function getAuthorizedIps() {
    const sql = "SELECT t.ip FROM ( SELECT pmId, max(stamp) maxstamp FROM pm_ips GROUP BY pmId) AS m INNER JOIN pm_ips as" +
        " t ON t.pmId = m.pmId AND t.stamp = m.maxstamp";
    const [rows] = await connection.promise().query(sql, []);
    return rows.map(value => {
        return value.ip;
    });
}

exports.getAuthorizedIps = getAuthorizedIps;