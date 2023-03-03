const path = require('path');
const Database = require('better-sqlite3');
const {connection} = require('../util/database');

const languages = require('../models/languages');

async function getProgress(jobId) {
    const jobPath = await getPath(jobId);

    const db = new Database(jobPath, {
        fileMustExist: true
    });

    const sqlGetProgress = db.prepare("SELECT COUNT(*) AS done, (SELECT COUNT(*) FROM JOB) AS total FROM JOB WHERE stamp IS NOT NULL");
    const progress = sqlGetProgress.get();
    db.close();
    return progress;
}

async function getIndividualProgress(jobId, freelancerId) {
    const jobPath = await getPath(jobId);

    const db = new Database(jobPath, {
        fileMustExist: true
    });


    let progress = {
        secondary: 0,
        primary: 0,
        wordCount: 0
    };

    try {
        const getDone = db.prepare("SELECT COUNT(*) AS 'primary', (SELECT COUNT(*) FROM JOB WHERE stamp IS NOT NULL AND " +
            "freelancerId = ? AND translation2 IS NOT NULL) AS secondary FROM JOB WHERE stamp IS NOT NULL AND freelancerId = ?");
        progress = getDone.get(freelancerId, freelancerId);
        progress.wordCount = 0;
        const rows = db.prepare("SELECT source FROM JOB WHERE freelancerId = ? AND stamp IS NOT NULL").all(freelancerId);

        for (let i = 0; i < rows.length; i++ ) {
            // console.log(rows[i].source.trim().length - rows[i].source.trim().replace(/ /g, '').length + 1);
            console.log(progress);

            progress.wordCount += rows[i].source.trim().length - rows[i].source.trim().replace(/ /g, '').length + 1
            // console.log(progress.wordCount);
        }
    }
    catch (e) {
        console.error(e);
    }

    db.close();

    console.log(progress);
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
            rows[0].source + rows[0].target, "JOBS", rows[0].job + ".ccdt");
    }
}

function getUrl(NODE_ENV) {
    if (NODE_ENV == "eu") {
        return "https://ccdt.datamundi.eu/login";
    }
    else if (NODE_ENV == "production") {
        return "https://ccdt.datamundi.space/login";
    }
    else {
        return "http://localhost:5190/login";
    }
}

async function getPreview(jobId) {
    const jobPath = await getPath(jobId);

    const db = new Database(jobPath, {
        fileMustExist: true
    });

    const sqlGetRows = db.prepare("SELECT id, source, context FROM JOB LIMIT 20");
    const sqlGetTotal = db.prepare("SELECT COUNT(*) AS total FROM JOB");

    let rowsResult = sqlGetRows.all();

    const sqlGetLanguages = db.prepare("SELECT sourceLanguageId, targetLanguageId FROM META");
    const languageResult = sqlGetLanguages.get();

    const sourceDir = await languages.getDirection(languageResult.sourceLanguageId);
    const sourceTag = await languages.getLangTag(languageResult.sourceLanguageId);

    for (let i = 0; i < rowsResult.length ; i++) {
        rowsResult[i].source = {
            dir: sourceDir,
            tag: sourceTag,
            value: rowsResult[i].source
        };
        rowsResult[i].context = {
            dir: sourceDir,
            tag: sourceTag,
            value: rowsResult[i].context
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
exports.getIndividualProgress = getIndividualProgress;
exports.getPreview = getPreview;