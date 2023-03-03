const {connection} = require('../util/database');
const messages = require('./messages');

async function getUnread(freelancerId) {
    let allMessages = await messages.getAll();
    const freelancerMessages = await getAll(freelancerId);

    let indexesToRemove = [];
    for (let i = 0; i < allMessages.length; i++) {
        for (let j = 0; j < freelancerMessages.length; j++) {
            if (freelancerMessages[j].messageId === allMessages[i].id) {
                indexesToRemove.push(allMessages);
            }
        }
    }

    for (let i = 0; i < indexesToRemove.length; i++) {
        allMessages.splice(allMessages.indexOf(indexesToRemove[i]), 1);
    }

    return allMessages.length;
}

async function getAll(freelancerId) {
    const sql = "SELECT messageId FROM freelancers_messages WHERE freelancerId = ?";

    const [rows] = await connection.promise().query(sql, [freelancerId]);
    return rows;
}

async function createOne(messageId, freelancerId) {
    const sql = "INSERT INTO freelancers_messages (messageId, freelancerId) VALUES (?,?)";
    const [result]  = await connection.promise().query(sql, [messageId, freelancerId]);

    return result;
}

async function deleteOne(messageId, freeelancerId) {
    const sql = "DELETE FROM freelancers_messages WHERE messageId = ? AND freelancerId = ?";
    const [result]  = await connection.promise().query(sql, [messageId, freeelancerId]);

    return result;
}

exports.deleteOne = deleteOne;
exports.createOne = createOne;
exports.getUnread = getUnread;
exports.getAll = getAll;
