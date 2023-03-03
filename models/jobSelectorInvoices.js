const {connection} = require('../util/database');

async function authenticate(email, pin) {
    const sql = "SELECT * FROM jobSelectorInvoices WHERE email = ? AND oldPin = ?";
    const [rows] = await connection.promise().query(sql, [email, pin]);

    return rows;
}

async function getAll(freelancerId) {
    const sql = "SELECT id, serverGeneratedTag AS confirmationOfInvoiceReceipt, DATE_FORMAT(stamp, \"%Y-%m-%d\") AS stamp, docRef AS noteNumber, vatValue AS vat," +
        " toBePaid AS value FROM jobSelectorInvoices WHERE freelancerId = ?";
    const [rows] = await connection.promise().query(sql, [freelancerId]);

    return rows;
}


async function addFreelancerId(email, pin, freelancerId) {
    const sql = "UPDATE jobSelectorInvoices SET freelancerId = ? WHERE email = ? AND oldPin = ?";
    const [result] = await connection.promise().query(sql, [freelancerId, email, pin]);
    return result;
}

async function getOne(freelancerId, invoiceId) {
    const sql = "SELECT htmlBody AS html FROM jobSelectorInvoices WHERE freelancerId = ? AND id = ?";
    const [rows] = await connection.promise().query(sql, [freelancerId, invoiceId]);
    if (rows.length < 1) {
        throw new Error("No invoice with freelancerId = " + freelancerId + " and invoiceId = " + invoiceId);
    }
    else {
        return rows[0];
    }
}

exports.getOne = getOne;
exports.addFreelancerId = addFreelancerId;
exports.authenticate = authenticate;
exports.getAll = getAll;
