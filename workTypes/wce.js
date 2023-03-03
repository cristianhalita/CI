const path = require('path');
const Database = require('better-sqlite3');
const {connection} = require('../util/database');

async function getProgress(jobId) {
    const jobPath = await getPath(jobId);

    const db = new Database(jobPath, {
        fileMustExist: true
    });

    const sqlGetProgress = db.prepare("SELECT COUNT(*) AS done, (SELECT COUNT(*) FROM URLS) AS total FROM URLS WHERE done = 1");
    const progress = sqlGetProgress.get();
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
            rows[0].source + rows[0].target, "JOBS", rows[0].job + ".wce");
    }
}

function getUrl(NODE_ENV) {
    if (NODE_ENV == "eu") {
        return "https://wce.datamundi.eu/login";
    }
    else if (NODE_ENV == "production") {
        return "https://wce.datamundi.space/login";
    }
    else {
        return "http://localhost:5132/login";
    }
}

async function getCount(jobId) {
    const jobPath = await getPath(jobId);

    const db = new Database(jobPath, {
        fileMustExist: true
    });

    const sqlGetCount = db.prepare("SELECT COUNT(*) AS count FROM JOB");
    const count = sqlGetCount.get().count;
    db.close();
    return count;
}

exports.getProgress = getProgress;
exports.getUrl = getUrl;
exports.getCount = getCount;