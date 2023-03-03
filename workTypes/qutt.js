const Database = require('better-sqlite3');
const {connection} = require('../util/database');
const path = require('path');
const jobs = require('../models/jobs');

async function getProgress(jobId) {
    const dbPath = await getPath(jobId);
    const freelancerId = await jobs.getPushedTo(jobId);
    const db = new Database(dbPath, {
        fileMustExist: true
    });

    const tableName = "qc_" + freelancerId + "_" + jobId;

    const sqlGetProgress = db.prepare("SELECT COUNT(*) AS done, (SELECT COUNT(*) FROM " + tableName + ") AS total FROM "
        + tableName + " WHERE stamp IS NOT NULL");
    const progress = sqlGetProgress.get();
    db.close();
    return progress;
}

async function getPath (jobId) {
    const sql = "SELECT j.name AS job, CONCAT(C.firstName, \"_\", C.lastName)  AS customer, P.name AS project, B.name AS batch, S.shortCode AS source, T.shortCode AS target FROM jobs " +
        "JOIN languagePairs lp on jobs.languagePairId = lp.id " +
        "JOIN languages S ON S.id = lp.sourceId JOIN languages T ON T.id = lp.targetId JOIN jobs j ON j.id = jobs.jobId " +
        "JOIN batches B ON B.id = j.batchId " +
        "JOIN projects P ON P.id = B.projectId JOIN customers C ON C.id = P.customerId WHERE jobs.id = ?";

    const [rows] = await connection.promise().query(sql, [jobId]);

    if (rows.length < 1) {
        throw new Error("Failed to get job path for job " + jobId);
    }
    else {
        return path.join(__dirname, "../../structure", rows[0].customer, rows[0].project, rows[0].batch,
            rows[0].source + rows[0].target, "JOBS", rows[0].job + ".utt");
    }
}

function getUrl(NODE_ENV) {
    if (NODE_ENV == "eu")  {
        return "https://utt.datamundi.eu/login";
    }
    else if (NODE_ENV == "production") {
        return "https://utt.datamundi.space/login";
    }
    else {
        return "http://localhost:3499/login";
    }
}

exports.getUrl = getUrl;
exports.getProgress = getProgress;