const path = require('path');
const Database = require('better-sqlite3');
const {connection} = require('../util/database');

function getProgress() {
    return null;
}

async function getIndividualProgress(jobId, freelancerId) {
    const jobPath = await getPath(jobId);

    const db = new Database(jobPath, {
        fileMustExist: true
    });


    let done = 0;

    try {
        const sqlGetProgress = db.prepare("SELECT COUNT(*) AS done FROM JOB WHERE freelancerId = ?");
        done = sqlGetProgress.get(freelancerId).done;
    }
    catch (e) {
        console.error(e);
    }
    finally {
        db.close();
    }

    return done;
}

async function getCount(jobId, freelancerId) {
    const jobPath = await getPath(jobId);

    const db = new Database(jobPath, {
        fileMustExist: true
    });

    const sqlGetCount = db.prepare("SELECT\n" +
        "(SELECT count(*) counter FROM [JOB] WHERE [freelancerId] = ? AND term in (SELECT term FROM (SELECT count(*) counter, [term] FROM [JOB] GROUP BY [term]) WHERE counter > 1)) AS sharedTerms,\n" +
        "(SELECT count(*) counter FROM [JOB] WHERE [freelancerId] = ?) AS uniqueTerms\n" +
        ";");
    const count = sqlGetCount.get(freelancerId, freelancerId);
    db.close();
    return count;
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
            rows[0].source + rows[0].target, "JOBS", rows[0].job + ".cpa");
    }
}

function getUrl(NODE_ENV) {
    if (NODE_ENV == "eu") {
        return "https://cpa2.datamundi.eu/login";
    }
    else if (NODE_ENV == "production") {
        return "https://cpa2.datamundi.space/login";
    }
    else {
        return "http://localhost:5993/login";
    }
}

exports.getUrl = getUrl;
exports.getProgress = getProgress;
exports.getCount = getCount;
exports.getIndividualProgress = getIndividualProgress;