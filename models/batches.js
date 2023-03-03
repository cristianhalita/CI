const {connection} = require('../util/database');

async function getOne(batchId) {
    const sql = "SELECT batches.id, p.templateId, batches.customerTaskId, wt.collective, un.name AS unitName,  " +
        " batches.dueDate AS realDueDate, wt.name AS workType, wt.id AS workTypeId, batches.name, batches.projectId," +
        " batches.description, DATE_FORMAT(batches.dueDate, '%Y/%m/%d %H:%i:%S') AS dueDate," +
        " p.name AS project, CONCAT(c.firstName, \"_\", c.lastName) AS customer, c.id AS customerId" +
        " FROM batches JOIN projects p ON batches.projectId = p.id JOIN customers c ON p.customerId = c.id " +
        "JOIN workTypes wt ON wt.id = p.workTypeId JOIN unitNames un ON un.id = wt.unitNameId WHERE batches.id = ?";

    const [rows] = await connection.promise().query(sql, [batchId]);
    return rows[0];
}

async function getByName(batchName) {
    const sql = "SELECT * FROM batches WHERE name = ?";
    const [rows] = await connection.promise().query(sql, [batchName]);
    return rows[0];
}

exports.getOne = getOne;
exports.getByName=  getByName;