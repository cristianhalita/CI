const path = require('path');
const Database = require('better-sqlite3');
const {connection} = require('../util/database');

const languages = require('../models/languages');

async function getProgress(jobId) {
    const jobPath = await getPath(jobId);


    let db = new Database(jobPath, {
        fileMustExist: true
    });

    const sqlGetProgress = db.prepare("SELECT COUNT(*) AS done, (SELECT COUNT(*) FROM segments) AS total FROM segments WHERE done = 1");
    const result = sqlGetProgress.get();
    db.close();
    return result;
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
            rows[0].source + rows[0].target, "JOBS", rows[0].job + ".mst");
    }
}

function getUrl(NODE_ENV) {
    if (NODE_ENV == "eu") {
        return "https://mst.datamundi.eu/login";
    }
    else if (NODE_ENV == "production") {
        return "https://mst.datamundi.space/login";
    }
    else {
        return "http://localhost:5129/login";
    }
}

async function getPreview(jobId) {
    const jobPath = await getPath(jobId);

    const db = new Database(jobPath, {
        fileMustExist: true
    });

    const sqlGetRows = db.prepare("SELECT id, segment FROM segments LIMIT 20");
    const sqlGetTotal = db.prepare("SELECT COUNT(*) AS total FROM segments");

    let rowsResult = sqlGetRows.all();

    const sqlGetLanguages = db.prepare("SELECT sourceLanguageId, targetLanguageId FROM META");
    const languageResult = sqlGetLanguages.get();

    const sourceDir = await languages.getDirection(languageResult.sourceLanguageId);
    const sourceTag = await languages.getLangTag(languageResult.sourceLanguageId);

    for (let i = 0; i < rowsResult.length ; i++) {
        rowsResult[i].segment = {
            dir: sourceDir,
            tag: sourceTag,
            value: rowsResult[i].segment
        };

        rowsResult[i].id = {
            value: rowsResult[i].id
        };
    }

    const total = sqlGetTotal.get().total;
    db.close();

    return {
        rows: rowsResult,
        total: total
    }
}

exports.getUrl = getUrl;
exports.getProgress = getProgress;
exports.getPreview = getPreview;