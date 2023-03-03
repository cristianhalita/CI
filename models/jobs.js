const languagePairs = require('./languagePairs');
const freelancers_workTypes = require('./freelancers_workTypes');
const batches = require('./batches');
const teamMembers = require('./teamMembers');

const workTypeMap = require('../workTypes/workTypeMap');

const {connection} = require('../util/database');

const NODE_ENV = process.env.NODE_ENV;

async function getDueDate(jobId) {
    const sql = "SELECT DATE_FORMAT(jobs.dueDate, \"%Y-%m-%d\") AS dueDate FROM jobs " +
        "WHERE jobs.id = ?";

    const [rows] = await connection.promise().query(sql, [jobId]);
    return rows[0].dueDate;
}

async function getPushedTo(jobId) {
    const sql = "SELECT pushedTo FROM jobs WHERE id = ?";
    const [rows] = await connection.promise().query(sql, [jobId]);
    return rows[0].pushedTo;
}

async function getAvailable(freelancerId) {
    const sql = "SELECT DISTINCT jobs.*, p.teamId AS teamId, wt.id AS workTypeId, wt.name AS workType, source.name AS sourceLanguage, target.name AS targetLanguage, \n" +
        "        source.id AS sourceId, target.id AS targetId, DATE_FORMAT(jobs.dueDate, '%Y-%m-%d %H:%i:%S') AS dueDate FROM jobs JOIN batches b ON b.id = jobs.batchId JOIN projects p on b.projectId = p.id \n" +
        "        JOIN workTypes wt ON wt.id = p.workTypeId LEFT JOIN collectiveJobs cj on jobs.id = \n" +
        "        cj.jobId AND cj.freelancerId = ? JOIN languagePairs lP on jobs.languagePairId = lP.id JOIN languages source on lP.sourceId = source.id\n" +
        "        JOIN languages target ON lP.targetId = target.id WHERE jobs.freelancerId IS NULL AND (jobs.pushedTo = ? OR (jobs.pushedTo IS NULL AND (SELECT COUNT(*) \n" +
        "        FROM \n" +
        "        collectiveJobs WHERE freelancerId = ? AND deliveryDate IS NULL) < 1 AND (SELECT COUNT(*) \n" +
        "        FROM jobs WHERE freelancerId = ? AND \n" +
        "        deliveryDate IS NULL) < 1)) AND (languagePairId = (SELECT lPair1 FROM freelancers WHERE id = ?) \n" +
        "        OR languagePairId = (SELECT lPair2 FROM freelancers WHERE id = ?) OR languagePairId = (SELECT lPair3 FROM freelancers WHERE id = ?) \n" +
        "        OR languagePairId = (SELECT lPair4 FROM freelancers WHERE id = ?)) AND p.workTypeId IN (SELECT workTypeId \n" +
        "        FROM datamundi.freelancers_workTypes WHERE freelancerId = ?) AND IF(wt.name IN ('TSE', 'HAA', 'ARE', 'GLT'), IF(hash IS NULL, 1 = 1, hash NOT IN \n" +
        "        (SELECT hash FROM jobs WHERE freelancerId = ? AND hash IS NOT NUll)), 1) AND jobs.deliveryDate IS NULL AND cj.deliveryDate IS NULL";

    const lps = await languagePairs.getLanguagePairsForFreelancer(freelancerId);
    let workTypes = await freelancers_workTypes.getWorkTypes(freelancerId);
    workTypes = workTypes.map(value => value.workTypeId);
    const [rows] = await connection.promise().query(sql, [freelancerId, freelancerId, freelancerId, freelancerId, freelancerId, freelancerId, freelancerId, freelancerId, freelancerId, freelancerId]);

    let realRows = [];
    let pushedTo = [];
    let lpsArray = [lps.lPair1, lps.lPair2, lps.lPair3, lps.lPair4];
    for (let i = 0; i < rows.length; i++) {
        const currentJob = rows[i];

        if (lpsArray.includes(currentJob.languagePairId) && workTypes.includes(currentJob.workTypeId)) {
            if (currentJob.teamId) {
                const members = await teamMembers.getAll(currentJob.teamId);
                if (members.map(value => value.freelancerId).includes(freelancerId)) {
                    realRows.push(currentJob);
                }
            }
            else {
                realRows.push(currentJob);
            }
        }
        if (currentJob.pushedTo) {
            pushedTo.push(currentJob);
        }
    }
    if (pushedTo.length > 0) {
        return pushedTo;
    }
    else {
        return realRows;
    }
}

async function getName(jobId) {
    const sql = "SELECT name FROM jobs WHERE id = ?";
    const [rows] = await connection.promise().query(sql, [jobId]);
    return rows[0].name;
}

async function checkIfInProgress(freelancerId) {
    const sql = "SELECT name FROM (\n" +
        "SELECT name FROM jobs WHERE freelancerId = ? AND deliveryDate IS NULL AND (pushedTo != ? OR pushedTo IS NULL) UNION\n" +
        "SELECT j.name AS name FROM collectiveJobs  JOIN jobs j on collectiveJobs.jobId = j.id WHERE collectiveJobs.freelancerId = ? AND collectiveJobs.deliveryDate IS NULL\n" +
        "\n" +
        ") AS jobs";
    const [rows] = await connection.promise().query(sql, [freelancerId, freelancerId, freelancerId]);
    if (rows.length < 1) {
        return false;
    }
    else {
        return rows[0].name;
    }
}

async function getInProgress(freelancerId, limit) {
    let sql = "SELECT WT.name AS workType, source.name AS sourceLanguage, fl.email, target.name AS targetLanguage," +
        " DATE_FORMAT(jobs.dueDate, '%Y-%m-%d %H:%i:%S') AS dueDate, jobs.collective, " +
        "jobs.id, jobs.name, jobs.price, jobs.jobLink,jobs.description FROM jobs LEFT JOIN freelancers fl ON fl.id = jobs.freelancerId " +
        "JOIN languagePairs lp ON lp.id = jobs.languagePairId JOIN languages source ON source.id = " +
        "lp.sourceId JOIN languages target ON target.id = lp.targetId JOIN batches B ON B.id = jobs.batchId JOIN projects p " +
        "ON p.id = B.projectId JOIN workTypes WT ON WT.id = p.workTypeId LEFT JOIN collectiveJobs cj ON cj.jobId = jobs.id" +
        " WHERE (jobs.freelancerId = ? OR cj.freelancerId = ?) AND jobs.deliveryDate IS NULL AND cj.deliveryDate IS NULL";

    if (limit !== undefined) {
        sql += " LIMIT " + limit;
    }

    const [rows] = await connection.promise().query(sql, [freelancerId, freelancerId]);

    for (let i = 0; i < rows.length; i++) {
        let progress;

        if (rows[i].workType !== "PLR" && rows[i].workType !== "EJL" && rows[i].workType !== "APB") {
            if (rows[i].workType === "DRI") {
                progress = await workTypeMap["dri"].getCount(rows[i].id);
            } else if (rows[i].workType === "UCQ") {
                progress = "Not applicable";
            } else {
                if (rows[i].collective) {
                    progress = await workTypeMap[rows[i].workType.toLowerCase()].getIndividualProgress(rows[i].id, freelancerId);
                    if (rows[i].workType === "CTE" || rows[i].workType === "TTE") {
                        progress = progress.eval;
                    } else if (rows[i].workType === "CDT" || rows[i].workType === "CCDT") {
                        progress = progress.primary;
                    } else if (rows[i].workType === "BTF") {
                        progress = progress.quickFix + progress.others;
                    }
                } else {
                    progress = await workTypeMap[rows[i].workType.toLowerCase()].getProgress(rows[i].id);
                    let percentage = Math.floor(progress.done / progress.total * 10000) / 100;
                    if (isNaN(percentage)) {
                        percentage = 0;
                    }
                    progress = progress.done + "/" + progress.total + "(" + percentage + "%)";
                }
            }
        }
        rows[i].progress = progress;

        if (rows[i].workType !== "EJL" && rows[i].workType !== "LPA" && rows[i].workType !== 'QLPA') {
            rows[i].url = workTypeMap[rows[i].workType.toLowerCase()].getUrl(NODE_ENV);
        }
        if (rows[i].workType === "LPA" || rows[i].workType === "QLPA") {
            rows[i].jobLink = workTypeMap['lpa'].getUrl(NODE_ENV) + "?jobCode=" + rows[i].name;
        }
    }

    return rows;
}

async function getDelivered(freelancerId, limit) {
    let sql = "SELECT wT.name AS workType, jobs.customerTaskId, DATE_FORMAT(lI.paymentDate, '%Y-%m-%d') AS paymentDate, jobs.description, source.name AS sourceLanguage, \n" +
        "               target.name AS targetLanguage, DATE_FORMAT(jobs.dueDate, '%Y-%m-%d %H:%i:%S') AS dueDate, " +
        "jobs.collective, jobs.id, jobs.name,  jobs.price, DATE_FORMAT(jobs.deliveryDate, '%Y-%m-%d %H:%i:%s') AS   \n" +
        "                 deliveryDate, cJ.price AS collectivePrice, DATE_FORMAT(cJ.deliveryDate, '%Y-%m-%d %H:%i:%s') AS collectiveDeliveryDate,  \n" +
        "        DATE_FORMAT(cJ.subcontractorPaymentDate, '%Y-%m-%d %H:%i:%s') AS collectiveSubcontractorPaymentDate,\n" +
        "       DATE_FORMAT(jobs.subcontractorPaymentDate, '%Y-%m-%d %H:%i:%s') AS subcontractorPaymentDate\n" +
        "                FROM jobs LEFT JOIN languagePairs lP on jobs.languagePairId = lP.id LEFT JOIN languages source ON source.id = lP.sourceId LEFT JOIN   \n" +
        "                languages target ON target.id = lP.targetId JOIN batches b on jobs.batchId = b.id JOIN projects p on b.projectId = p.id   \n" +
        "                JOIN workTypes wT on p.workTypeId = wT.id LEFT JOIN collectiveJobs cJ on jobs.id = cJ.jobId LEFT JOIN lspInvoices lI  \n" +
        "                    on jobs.lspInvoiceId = lI.id OR cJ.lspInvoiceId = lI.id LEFT JOIN invoices jobsInvoices ON jobsInvoices.id =\n" +
        "                   jobs.invoiceId LEFT JOIN invoices cJInvoices ON cJInvoices.id = cJ.invoiceId WHERE (jobs.freelancerId = ?\n" +
        "                AND jobs.deliveryDate IS NOT NULL AND (jobs.invoiceId IS NULL OR jobsInvoices.freelancerId != jobs.freelancerId))\n" +
        "                OR ((cJ.invoiceId IS NULL OR cJInvoices.freelancerId != cJ.freelancerId) AND cJ.deliveryDate IS NOT NULL\n" +
        "                 AND cJ.freelancerId = ?) ORDER BY jobs.id";

    //invoice id = null

    if (limit !== undefined) {
        sql+= " LIMIT " + limit;
    }

    const [rows] = await connection.promise().query(sql, [freelancerId, freelancerId]);
    return rows;
}

async function getDeliveredPrice(freelancerId) {
    const sql = "SELECT jobs.collective, jobs.id,  jobs.price, cJ.price AS collectivePrice " +
        "FROM jobs LEFT JOIN collectiveJobs cJ on jobs.id = cJ.jobId LEFT JOIN invoices jobsInvoices ON jobsInvoices.id =\n" +
        "  jobs.invoiceId LEFT JOIN invoices cJInvoices ON cJInvoices.id = cJ.invoiceId WHERE (jobs.freelancerId = ? " +
        "AND jobs.deliveryDate IS NOT NULL AND (jobs.invoiceId IS NULL OR jobsInvoices.freelancerId != jobs.freelancerId)) OR" +
        " ((cJ.invoiceId IS NULL OR cJInvoices.freelancerId != cJ.freelancerId) AND cJ.deliveryDate IS NOT NULL " +
        " AND cJ.freelancerId = ?)";

    // const sql = "SELECT price, collective, id FROM jobs WHERE freelancerId = ? AND deliveryDate IS NOT NULL AND invoiceId IS NULL";

    const [rows] = await connection.promise().query(sql, [freelancerId, freelancerId]);
    return rows;
}

async function changeName(jobId, name) {
    const sql = "UPDATE jobs SET name = ? WHERE id = ?";

    const [result] = await connection.promise().query(sql, [name, jobId]);
    return result;
}

async function getLanguagePairId(jobId) {
    const sql = "SELECT languagePairId FROM jobs WHERE id = ?";
    const [rows] = await connection.promise().query(sql, [jobId]);
    return rows[0].languagePairId;
}

async function getDeadLineIn24Hours() {
    const sql = "SELECT jobs.id, cj.id AS collectiveId, name, f.firstName, f.email, p.email AS pmEmail, DATE_FORMAT(dueDate, '%Y-%m-%d') AS dueDate\n" +
        "FROM jobs LEFT JOIN collectiveJobs cj ON cj.jobId = jobs.id LEFT JOIN freelancers f on cj.freelancerId = f.id OR\n" +
        "jobs.freelancerId = f.id JOIN pms p ON p.id = jobs.createdBy JOIN emailNotifications en ON en.freelancerId = f.id WHERE jobs.deliveryDate IS NULL AND cj.deliveryDate IS NULL " +
        "AND TIMESTAMPDIFF(HOUR, NOW(), dueDate) <= 24 AND jobs.isReminded = 0 AND IF(cj.isReminded IS NULL, NULL IS NULL, cj.isReminded = 0) AND en.deadLineIn24Hours = 1";
    const [rows] = await connection.promise().query(sql, []);
    return rows;
}

async function setReminded (jobIds) {
    const sql = "UPDATE jobs SET isReminded = 1 WHERE id IN (?)";
    const [result] = await connection.promise().query(sql, [jobIds]);

    return result;
}

async function acceptJob (freelancerId, jobId) {
    const sql = "SELECT collective FROM jobs WHERE id = ?";

    const [rows] = await connection.promise().query(sql, [jobId]);

    if (rows.length < 0) {
        throw new Error("Failed to get jobs");
    }
    else {
        let sql;
        if (rows[0].collective) {
            sql = "INSERT INTO collectiveJobs (freelancerId, jobId) VALUES (?,?)";
        }
        else {
            sql = "UPDATE jobs SET freelancerId = ?, assignDate = CURRENT_TIMESTAMP WHERE id = ? AND freelancerId IS NULL";
        }
        await connection.promise().query(sql , [freelancerId, jobId]);
    }
}

async function deliverJob(jobId, freelancerId) {
    const sql = "UPDATE jobs SET deliveryDate = CURRENT_TIMESTAMP WHERE id = ? AND freelancerId = ?";

    const [result] = await connection.promise().query(sql, [jobId, freelancerId]);
    return result;
}

async function deliverJobWithPrice(jobId, freelancerId, price) {
    const sql = "UPDATE jobs SET deliveryDate = CURRENT_TIMESTAMP, price = ? WHERE id = ? AND freelancerId = ?";
    const [result] = await connection.promise().query(sql, [price, jobId, freelancerId]);

    return result;
}

async function deliverJobWithoutFreelancer(jobId) {
    const sql = "UPDATE jobs SET deliveryDate = CURRENT_TIMESTAMP WHERE id = ?";
    const [result] = await connection.promise().query(sql, [jobId]);
    return result;
}

async function getPm(jobId) {
    const sql = "SELECT pm.firstName, pm.lastName, pm.email FROM jobs LEFT JOIN pms pm ON pm.id = jobs.createdBy WHERE jobs.id = ?";
    const [rows] = await connection.promise().query(sql, [jobId]);
    return rows[0];
}

async function getWorkType(jobId) {
    const sql = "SELECT WT.name AS workType, WT.id AS workTypeId, WT.collective, jobs.trial, P.id AS projectId FROM jobs JOIN batches B " +
        "ON B.id = jobs.batchId JOIN projects P ON P.id = B.projectId JOIN workTypes WT ON WT.id = P.workTypeId WHERE jobs.id = ?";

    const [rows] = await connection.promise().query(sql, [jobId]);

    if (rows.length < 1) {
        throw new Error("Failed to get workType with jobId " + jobId);
    }
    else {
        return rows[0];
    }

}

async function setInvoiceId(jobId, invoideId) {
    const sql = "UPDATE jobs SET invoiceId = ? WHERE id = ?";
    const [result] = await connection.promise().query(sql, [invoideId, jobId]);
    return result;
}

async function isTaken(jobId, freelancerId) {
    const sql = "SELECT jobs.id FROM jobs LEFT JOIN collectiveJobs cJ on jobs.id = cJ.jobId WHERE jobs.id = ? AND " +
        "(jobs.freelancerId = ? OR cJ.freelancerId = ?)";
    const [rows] = await connection.promise().query(sql, [jobId, freelancerId, freelancerId]);
    return rows.length >= 1;
}

async function getParallelJob(jobId, languagePairId, hash) {
    const sql = "SELECT jobs.id, jobs.name, CONCAT(fl.firstName, ' ', fl.lastName) AS freelancer FROM jobs JOIN freelancers fl ON fl.id = " +
        "jobs.freelancerId WHERE jobs.id != ? AND deliveryDate IS NOT NULL AND hash = ?" +
        " AND languagePairId = ? AND (SELECT COUNT(*) FROM jobs WHERE disagreement = 1" +
        " AND hash = ? AND languagePairId = ?) < 1";
    const [rows] = await connection.promise().query(sql, [jobId, hash, languagePairId, hash, languagePairId]);
    if (rows.length > 0) {
        return rows[0];
    }
    else {
        return undefined;
    }
}

async function createDisagreementJob(jobId, languagePairId, batchId, hash, createdBy, dueDate, fileName) {
    const sql = "INSERT INTO jobs (batchId, languagePairId, fileName, disagreement, hash, createdBy, dueDate, estimation)" +
        " VALUES (?,?,?,1,?,?,?,24)";

    const [result] = await connection.promise().query(sql, [batchId, languagePairId, fileName, hash, createdBy, dueDate]);
    return result;
}

async function changePrice(jobId, price) {
    const sql = "UPDATE jobs SET price = ? WHERE id = ?";

    const [result] = await connection.promise().query(sql, [price, jobId]);
    return result;
}

async function getPercentageOfPrice(jobId) {
    const sql = "SELECT percentageOfPrice FROM jobs WHERE id = ?";
    const [rows] = await connection.promise().query(sql, [jobId]);
    return rows[0].percentageOfPrice;
}

async function createBotJob (freelancerId, price, batchId, customerTaskId) {
    const sql = "INSERT INTO jobs (freelancerId, price, deliveryDate, batchId, archived, customerTaskId) VALUES (?,?,?,?,?,?)";

    const [result] = await connection.promise().query(sql, [freelancerId, price, new Date(), batchId, true, customerTaskId]);
    return result;
}

async function deleteOne(jobId) {
    const sql = "DELETE FROM jobs WHERE id = ?";
    const [result] = await connection.promise().query(sql, [jobId]);
    return result;
}

async function getDeliveryDate(jobId) {
    const sql = "SELECT DATE_FORMAT(jobs.deliveryDate, '%Y-%m-%d %H:%i:%s') AS deliveryDate FROM jobs WHERE id = ?";
    const [rows] = await connection.promise().query(sql, [jobId]);
    return rows[0].deliveryDate;
}

exports.isAvailable = async (jobId, freelancerId) => {
    const sql = "SELECT WT.name AS workType, P.id AS projectId, WT.id AS workTypeId, B.name AS batchName, source.name AS sourceLanguage, target.name AS targetLanguage," +
        " P.customerId,   " +
        "jobs.*, DATE_FORMAT(jobs.dueDate, '%Y-%m-%d %H:%i:%S') AS dueDate FROM jobs LEFT JOIN languagePairs lp ON lp.id = jobs.languagePairId LEFT JOIN " +
        " languages source ON source.id = lp.sourceId LEFT JOIN " +
        "languages target ON target.id = lp.targetId JOIN batches B ON B.id = jobs.batchId JOIN projects P ON P.id = B.projectId " +
        "JOIN workTypes WT ON WT.id = P.workTypeId WHERE jobs.batchId IN (" +
        "SELECT id FROM batches WHERE projectId IN (SELECT id FROM projects WHERE workTypeId IN (SELECT workTypeId FROM " +
        "freelancers_workTypes WHERE freelancerId = ?))) AND ((freelancerId IS NULL AND pushedTo IS NULL) OR pushedTo = ? OR freelancerId = ?) " +
        "AND jobs.id = ?";

    const [rows] = await connection.promise().query(sql, [freelancerId, freelancerId, freelancerId, jobId]);
    return rows.length >= 1;
};

exports.getById = async (jobId) => {
    const sql = "SELECT WT.name AS workType, P.id AS projectId, WT.id AS workTypeId, B.name AS batchName, source.name AS sourceLanguage, target.name AS targetLanguage," +
        " P.customerId,   " +
        "jobs.*, DATE_FORMAT(jobs.dueDate, '%Y-%m-%d %H:%i:%S') AS dueDate FROM jobs LEFT JOIN languagePairs lp ON lp.id = jobs.languagePairId LEFT JOIN " +
        " languages source ON source.id = lp.sourceId LEFT JOIN " +
        "languages target ON target.id = lp.targetId JOIN batches B ON B.id = jobs.batchId JOIN projects P ON P.id = B.projectId " +
        "JOIN workTypes WT ON WT.id = P.workTypeId WHERE jobs.id = ?";
    const [[job]] = await connection.promise().query(sql, [jobId]);
    return job || null;
};

exports.getDeliveryDate = getDeliveryDate;
exports.deleteOne = deleteOne;
exports.createBotJob = createBotJob;
exports.getPercentageOfPrice = getPercentageOfPrice;
exports.changePrice = changePrice;
exports.createDisagreementJob = createDisagreementJob;
exports.getParallelJob = getParallelJob;
exports.isTaken = isTaken;
exports.setInvoiceId = setInvoiceId;
exports.acceptJob = acceptJob;
exports.getAvailable = getAvailable;
exports.getInProgress = getInProgress;
exports.deliverJob = deliverJob;
exports.getDelivered = getDelivered;
exports.getWorkType = getWorkType;
exports.getDeliveredPrice = getDeliveredPrice;
exports.deliverJobWithPrice = deliverJobWithPrice;
exports.checkIfInProgress = checkIfInProgress;
exports.getName = getName;
exports.getDueDate = getDueDate;
exports.getLanguagePairId = getLanguagePairId;
exports.deliverJobWithoutFreelancer = deliverJobWithoutFreelancer;
exports.getDeadLineIn24Hours = getDeadLineIn24Hours;
exports.setReminded = setReminded;
exports.getPm = getPm;
exports.getPushedTo = getPushedTo;
exports.changeName = changeName;
