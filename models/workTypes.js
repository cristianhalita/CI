const {connection} = require('../util/database');


function getInstructions(workTypeId) {
    const sql = "SELECT screenshot, video, preview FROM workTypes WHERE id = ?";

    return new Promise((resolve, reject) => {
        connection.promise().query(sql, [workTypeId]).then(([rows]) => {
            console.log(rows);
            resolve(rows[0]);
        }).catch(error => {
            console.log(error);
            reject();
        })
    });
}

async function getPrices(workTypeId) {
    const sql = "SELECT unitValue, groupA, groupB, groupC FROM workTypes WHERE id = ?";
    const [rows] = await connection.promise().query(sql, [workTypeId]);
    return rows[0];
}

async function getPreview(workTypeId) {
    const sql = "SELECT preview FROM workTypes WHERE id = ?";
    const [rows] = await connection.promise().query(sql, [workTypeId]);
    return rows[0].preview === 1;
}

async function getWorkTypeName(workTypeId) {
    const sql  = "SELECT name FROM workTypes WHERE id = ?";
    const [rows] = await connection.promise().query(sql, [workTypeId]);
    return rows[0].name;
}

exports.getWorkTypeName = getWorkTypeName;
exports.getPreview = getPreview;
exports.getPrices = getPrices;
exports.getInstructions = getInstructions;