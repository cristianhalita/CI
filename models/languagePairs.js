const {connection} = require('../util/database');

function getLanguagePairs() {
    const sql = "select source.name as source, target.name as target, languagePairs.id\n" +
        "from languagePairs join languages source on languagePairs.sourceId = source.id join languages target on languagePairs.targetId = target.id;";
    return new Promise((resolve, reject) => {
        connection.promise().query(sql).then(([rows, fields]) => {
            resolve(rows);
        }).catch(error => {
            reject(error);
        });
    });
}

function getLanguagePairsForFreelancer(freelancerId) {
    const sql = "SELECT lPair1, lPair2, lPair3, lPair4 FROM freelancers WHERE id = ?";

    return new Promise((resolve, reject) => {
        connection.promise().query(sql, [freelancerId]).then(([rows]) => {
            if (rows.length < 1) {
                reject();
            }
            else {
                resolve(rows[0]);
            }
        }).catch(error => {
            console.log(error);
            reject();
        });
    });
}

async function getGroup(languagePairId) {
    const sql = "SELECT gr.name FROM languagePairs JOIN languagePairGroups gr ON gr.id = languagePairs.languagePairGroupId " +
        "WHERE languagePairs.id = ?";
    const [rows] = await connection.promise().query(sql, [languagePairId]);
    return rows[0].name;
}

async function getSource(languagePairId, customerId) {
    const sql = "SELECT l.shortCode AS shortCode, l.wordToken, l.id AS languageId, clc.languageCode AS customerLanguageCode" +
        " FROM languagePairs LEFT JOIN customerLanguageCodes clc ON clc.languageId = languagePairs.sourceId AND clc.customerId = ? " +
        "JOIN languages l ON l.id = languagePairs.sourceId " +
        "WHERE languagePairs.id = ?";

    const [rows] = await connection.promise().query(sql, [customerId, languagePairId]);
    return rows[0];
}
async function getTarget(languagePairId, customerId) {
    const sql = "SELECT l.shortCode AS shortCode, l.wordToken, l.id AS languageId, clc.languageCode AS customerLanguageCode " +
        "FROM languagePairs LEFT JOIN customerLanguageCodes clc ON clc.languageId = languagePairs.targetId AND clc.customerId = ? " +
        " JOIN languages l ON l.id = languagePairs.targetId " +
        "WHERE languagePairs.id = ?";

    const [rows] = await connection.promise().query(sql, [customerId, languagePairId]);

    return rows[0];
}

exports.getSource = getSource;
exports.getTarget = getTarget;
exports.getGroup = getGroup;
exports.getAll = getLanguagePairs;
exports.getLanguagePairsForFreelancer = getLanguagePairsForFreelancer;