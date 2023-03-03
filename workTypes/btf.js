const path = require('path');
const Database = require('better-sqlite3');
const {connection} = require('../util/database');

const languages = require('../models/languages');

async function getProgress(jobId) {
    const jobPath = await getPath(jobId);

    let db = new Database(jobPath, {
        fileMustExist: true
    });

    const sqlGetProgress = db.prepare("SELECT COUNT(*) AS done, (SELECT COUNT(*) FROM JOB) AS total FROM JOB WHERE stamp IS NOT NULL");
    const result = sqlGetProgress.get();
    db.close();
    return result;
}

async function getIndividualProgress (jobId, freelancerId) {
    const jobPath = await getPath(jobId);

    const db = new Database(jobPath, {
        fileMustExist: true
    });

    const getProgress = db.prepare("SELECT COUNT(*)  AS others, (SELECT COUNT(*) AS count FROM JOB WHERE stamp IS NOT NULL AND quickFix = 1 AND freelancerId = ?) AS quickFix FROM JOB WHERE stamp IS NOT NULL " +
        "AND freelancerId = ? AND quickFix = 0");
    const progress = getProgress.get(freelancerId, freelancerId);
    db.close();
    return progress;
}

async function getPath (jobId) {
    const sql = "SELECT jobs.name AS job, CONCAT(C.firstName, \"_\", C.lastName)  AS customer, P.name AS project, B.name AS batch, S.shortCode AS source, T.shortCode AS target FROM jobs " +
        "JOIN languagePairs lp on jobs.languagePairId = lp.id " +
        "JOIN languages S ON S.id = lp.sourceId JOIN languages T ON T.id = lp.targetId JOIN batches B ON B.id = jobs.batchId " +
        "JOIN projects P ON P.id = B.projectId JOIN customers C ON C.id = P.customerId WHERE jobs.id = ?";

    const [rows] = await connection.promise().query(sql, [jobId]);

    if (rows.length < 1) {
        throw new Error("Failed to get job path for job " + jobId);
    }
    else {
        return path.join(__dirname, "../../structure", rows[0].customer, rows[0].project, rows[0].batch,
            rows[0].source + rows[0].target, "JOBS", rows[0].job + ".btf");
    }
}

function getUrl(NODE_ENV) {
    if (NODE_ENV == "eu") {
        return "https://btf.datamundi.eu/login";
    }
    else if (NODE_ENV == "production") {
        return "https://btf.datamundi.space/login";
    }
    else {
        return "http://localhost:6134/login";
    }
}


exports.getUrl = getUrl;
exports.getProgress = getProgress;
exports.getIndividualProgress = getIndividualProgress;