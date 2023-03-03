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
            rows[0].source + rows[0].target, "JOBS", rows[0].job + ".haa");
    }
}

function getUrl(NODE_ENV) {
    if (NODE_ENV == "eu") {
        return "https://haa.datamundi.eu/login";
    }
    else if (NODE_ENV == "production") {
        return "https://haa.datamundi.space/login";
    }
    else {
        return "http://localhost:5113/login";
    }
}

async function getPreview(jobId) {
    const jobPath = await getPath(jobId);

    const db = new Database(jobPath, {
        fileMustExist: true
    });

    const sqlGetRows = db.prepare("SELECT id, source, target FROM JOB LIMIT 20");
    const sqlGetTotal = db.prepare("SELECT COUNT(*) AS total FROM JOB");
    const sqlGetLanguages = db.prepare("SELECT sourceLanguageId, targetLanguageId FROM META");

    const languageResult = sqlGetLanguages.get();
    let rowsResult = sqlGetRows.all();

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
        rowsResult[i].target = {
            dir: targetDir,
            tag: targetTag,
            value: rowsResult[i].target
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

async function checkDisFor2 (jobId1, jobId2) {
    const jobPath1 = await getPath(jobId1);
    const db1 = new Database(jobPath1, {
        fileMustExist: true
    });

    const jobPath2 = await getPath(jobId2);
    const db2 = new Database(jobPath2, {
        fileMustExist: true
    });

    const sqlGetRows1 = db1.prepare("SELECT * FROM JOB");
    const sqlGetRows2 = db2.prepare("SELECT * FROM JOB");
    const rows1 = sqlGetRows1.all();
    const rows2 = sqlGetRows2.all();

    db1.close();
    db2.close();

    let rows = [];
    for (let i = 0; i < rows1.length; i++) {
        if (rows1[i].AQ !== rows2[i].AQ) {
            rows.push({
                id: rows1[i].id,
                source: rows1[i].source,
                target: rows1[i].target
            });
        }
    }
    return rows;
}

async function createJob(rows, sourceLanguageId, targetLanguageId, jobId) {
    const jobPath = await getPath(jobId);

    let db = new Database(jobPath);

    try {
        try {
            let initDb = "create table JOB\n" +
                "(\n" +
                "    id      integer\n" +
                "        constraint JOB_pk\n" +
                "            primary key,\n" +
                "    source  text not null,\n" +
                "    target  text not null,\n" +
                "    AQ      integer,\n" +
                "    TQ      integer,\n" +
                "    swapped boolean,\n" +
                "    effort  integer,\n" +
                "    stamp   datetime,\n" +
                "    fuid    integer,\n" +
                "    T1      datetime,\n" +
                "    T2      datetime\n" +
                "); CREATE TABLE META (id INTEGER PRIMARY KEY AUTOINCREMENT, sourceLanguageId INTEGER NOT NULL, " +
                "targetLanguageId INTEGER NOT NULL);";


            db.exec(initDb);
        }

        catch (e) {

        }
        const sqlInsertMeta = db.prepare("INSERT INTO META (sourceLanguageId, targetLanguageId) VALUES (?,?)");
        sqlInsertMeta.run(sourceLanguageId, targetLanguageId);
        const sqlInsert = db.prepare("INSERT INTO JOB (id, source, target) VALUES(?,?,?)");

        for (let i = 0; i < rows.length; i++) {
            sqlInsert.run(rows[i].id, rows[i].source, rows[i].target);
        }
        db.close();
    }
    catch (e) {
        console.log(e);
        db.close();
        await fsPromises.unlink(jobPath);
        throw new Error("Failed to create database");
    }
}

exports.checkDisFor2 = checkDisFor2;
exports.getProgress = getProgress;
exports.getUrl = getUrl;
exports.getPreview = getPreview;
exports.createJob = createJob;