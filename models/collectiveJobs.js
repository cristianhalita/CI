const {connection} = require('../util/database');

async function deliverJob(jobId, freelancerId, price) {
    const sql = "UPDATE collectiveJobs SET deliveryDate = ?, price = ? WHERE jobId = ? AND freelancerId = ? AND deliveryDate IS NULL";
    const [result] = await connection.promise().query(sql, [new Date(), price, jobId, freelancerId]);
    return result;
}

async function getDeliveryInfo(jobId, freelancerId) {
    const sql = "SELECT price, DATE_FORMAT(deliveryDate, \"%Y-%m-%d %H:%i:%s\") AS deliveryDate FROM collectiveJobs WHERE jobId = ? AND freelancerId = ?";
    const [rows] = await connection.promise().query(sql, [jobId, freelancerId]);
    return rows[0];
}

async function getPrice(jobId, freelancerId) {
    const sql = "SELECT price FROM collectiveJobs WHERE jobId = ? AND freelancerId = ?";
    const [rows] = await connection.promise().query(sql, [jobId, freelancerId]);
    return rows[0].price;
}

async function setInvoiceId(jobId, freelancerId, invoiceId) {
    const sql = "UPDATE collectiveJobs SET invoiceId = ? WHERE jobId = ? AND freelancerId = ?";
    const [result] = await connection.promise().query(sql, [invoiceId, jobId, freelancerId]);
    return result;
}

async function getAll(jobId) {
    const sql = "SELECT deliveryDate FROM collectiveJobs WHERE jobId = ?";
    const [rows] = await connection.promise().query(sql, [jobId]);
    return rows;
}

async function setReminded (jobIds) {
    const sql = "UPDATE collectiveJobs SET isReminded = 1 WHERE id IN (?)";
    const [result] = await connection.promise().query(sql, [jobIds]);

    return result;
}

async function getFreelancers(jobId)  {
    const sql = "SELECT CONCAT(f.firstName, ' ', f.lastName) AS fullName FROM collectiveJobs JOIN freelancers f ON f.id = collectiveJobs.freelancerId WHERE jobId = ?";
    const [rows] = await connection.promise().query(sql, [jobId]);
    return rows;
}

exports.getFreelancers = getFreelancers;
exports.getAll = getAll;
exports.setInvoiceId = setInvoiceId;
exports.getPrice = getPrice;
exports.getDeliveryInfo = getDeliveryInfo;
exports.deliverJob = deliverJob;
exports.setReminded = setReminded;