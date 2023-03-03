const path = require('path');
const Database = require('better-sqlite3');
const {connection} = require('../util/database');

const languages = require('../models/languages');

async function getProgress(jobId) {
    const jobPath = await getPath(jobId);

    const db = new Database(jobPath, {
        fileMustExist: true
    });

    const sqlGetProgress = db.prepare("SELECT COUNT(*) AS done, (SELECT COUNT(*) FROM terms) AS total FROM terms WHERE stamp IS NOT NULL");
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
        trans: 0,
        eval: 0,
        bonus: 0
    };

    try {
        const getDone = db.prepare("SELECT COUNT(*) AS eval, " +
            "(SELECT COUNT(*) FROM terms WHERE targetE IS NOT NULL AND stamp IS NOT NULL AND freelancerId = ?) AS trans, " +
            "(SELECT COUNT(*) FROM terms WHERE (SELECT COUNT(*) FROM idkTerms WHERE termId = terms.id) >= 2 AND stamp IS NOT NULL AND freelancerId = ?) AS bonus" +
            " FROM terms WHERE stamp IS NOT NULL AND freelancerId = ?");
        progress = getDone.get(freelancerId, freelancerId, freelancerId);
    }
    catch (e) {

    }
    finally {
        db.close();
    }

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
            rows[0].source + rows[0].target, "JOBS", rows[0].job + ".cte");
    }
}

function getUrl(NODE_ENV) {
    if (NODE_ENV == "eu") {
        return "https://cte2.datamundi.eu/login";
    }
    else if (NODE_ENV == "production") {
        return "https://cte2.datamundi.space/login";
    }
    else {
        return "http://localhost:5133/login";
    }
}

async function getPreview(jobId) {
    const jobPath = await getPath(jobId);

    const db = new Database(jobPath, {
        fileMustExist: true
    });

    const sqlGetRows = db.prepare("SELECT id, source, targetA, targetB, targetC FROM terms LIMIT 20");
    const sqlGetTotal = db.prepare("SELECT COUNT(*) AS total FROM terms");

    let rowsResult = sqlGetRows.all();

    const sqlGetLanguages = db.prepare("SELECT sourceLanguageId, targetLanguageId FROM META");
    const languageResult = sqlGetLanguages.get();

    const sourceDir = await languages.getDirection(languageResult.sourceLanguageId);
    const targetDir = await languages.getDirection(languageResult.targetLanguageId);
    const sourceTag = await languages.getLangTag(languageResult.sourceLanguageId);
    const targetTag = await languages.getLangTag(languageResult.targetLanguageId);

    for (let i = 0; i < rowsResult.length ; i++) {
        rowsResult[i].source = {
            dir: sourceDir,
            tag: sourceTag,
            value: rowsResult[i].source
        };
        rowsResult[i].targetA = {
            dir: targetDir,
            tag: targetTag,
            value: rowsResult[i].targetA
        };

        if (rowsResult[i].targetB) {
            rowsResult[i].targetB = {
                dir: targetDir,
                tag: targetTag,
                value: rowsResult[i].targetB
            };
        }
        if (rowsResult[i].targetC) {
            rowsResult[i].targetC = {
                dir: targetDir,
                tag: targetTag,
                value: rowsResult[i].targetC
            };
        }
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