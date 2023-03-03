const Database = require('better-sqlite3');
const {connection} = require('../util/database');
const path = require('path');

const languages = require('../models/languages');

async function getProgress(jobId) {
    const jobPath = await getPath(jobId);

    const db = new Database(jobPath, {
        fileMustExist: true
    });

    const sqlGetProgress = db.prepare("SELECT COUNT(*) AS done, (SELECT COUNT(*) FROM JOB) AS total FROM JOB WHERE stamp IS NOT NULL");

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
            rows[0].source + rows[0].target, "JOBS", rows[0].job + ".tse");
    }
}

function getUrl(NODE_ENV) {
    if (NODE_ENV == "eu") {
        return "https://tse.datamundi.eu/login";
    }
    else if (NODE_ENV == "production") {
        return "https://tse2.datamundi.space/login";
    }
    else {
        return "http://localhost:8345/login";
    }
}

async function getPreview(jobId) {
    const jobPath = await getPath(jobId);

    const db = new Database(jobPath, {
        fileMustExist: true
    });

    const sqlGetRows = db.prepare("SELECT id, source, translated_text1, translated_text2, translated_text3, translated_text4, translated_text5" +
        " FROM JOB LIMIT 20");
    const sqlGetTotal = db.prepare("SELECT COUNT(*) AS total FROM JOB");
    const sqlGetLanguages = db.prepare("SELECT sourceLanguageId, targetLanguageId FROM META");

    const languageResult = sqlGetLanguages.get();
    let rowsResult = sqlGetRows.all();

    const sourceDir = await languages.getDirection(languageResult.sourceLanguageId);
    const targetDir = await languages.getDirection(languageResult.targetLanguageId);
    const sourceTag = await languages.getLangTag(languageResult.sourceLanguageId);
    const targetTag = await languages.getLangTag(languageResult.targetLanguageId);

    const newRowsResult = rowsResult.map((value, index) => {
        let newValue = {};
        newValue.id = {
            value: value.id
        };
        newValue.source = {
            dir: sourceDir,
            tag: sourceTag,
            value: value.source
        };
        newValue.translated_text1 = {
            dir: targetDir,
            tag: targetTag,
            value: value.translated_text1
        };


        if (value.translated_text2) {
            newValue.translated_text2 = {
                dir: targetDir,
                tag: targetTag,

                value: value.translated_text2
            }
        }
        if (value.translated_text3) {
            newValue.translated_text3 = {
                dir: targetDir,
                tag: targetTag,

                value: value.translated_text3
            }
        }
        if (value.translated_text4) {
            newValue.translated_text4 = {
                dir: targetDir,
                tag: targetTag,

                value: value.translated_text4
            }
        }
        if (value.translated_text5) {
            newValue.translated_text5 = {
                dir: targetDir,
                tag: targetTag,

                value: value.translated_text5
            }
        }

        return newValue;
    });

    const total = sqlGetTotal.get().total;
    db.close();

    return {
        rows: newRowsResult,
        total: total
    }
}

exports.getProgress = getProgress;
exports.getUrl = getUrl;
exports.getPreview = getPreview;
