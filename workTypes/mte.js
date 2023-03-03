const path = require('path');
const Database = require('better-sqlite3');
const {connection} = require('../util/database');

async function getProgress(jobId) {
    const jobPath = await getPath(jobId);

    const db = new Database(jobPath, {
        fileMustExist: true
    });

    const sqlGetProgress = db.prepare("SELECT COUNT(*) AS done, (SELECT COUNT(*) FROM URLS) AS total FROM URLS WHERE stamp IS NOT NULL");
    const progress = sqlGetProgress.get();
    db.close();
    return progress;
}

async function getCount(jobId) {
    const jobPath = await getPath(jobId);

    const db = new Database(jobPath, {
        fileMustExist: true
    });

    const sqlGetProgress = db.prepare("SELECT COUNT(*) AS count FROM extractedStrings WHERE removed = 0");
    const result = sqlGetProgress.get();

    db.close();
    return result.count;
}

async function removeMalformed(jobId) {
    const jobPath = await getPath(jobId);

    const db = new Database(jobPath, {
        fileMustExist: true
    });

    db.prepare("UPDATE extractedStrings SET removed = 1 WHERE jobId IN (SELECT jobId FROM extractedStrings WHERE string LIKE '%�%' )").run();

    db.close();
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
            rows[0].source + rows[0].target, "JOBS", rows[0].job + ".mte");
    }
}

function getUrl(NODE_ENV) {
    if (NODE_ENV == "eu") {
        return "https://mte.datamundi.eu/login";
    }
    else if (NODE_ENV == "production") {
        return "https://mte.datamundi.space/login";
    }
    else {
        return "http://localhost:5139/login";
    }
}

exports.getUrl = getUrl;
exports.getProgress = getProgress;
exports.getCount = getCount;
exports.removeMalformed = removeMalformed;