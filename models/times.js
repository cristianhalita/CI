const {connection} = require('../util/database');

async function setInstructionTimes({instruction1, instruction2, instruction3, instruction4, instruction5, screenshot, video, preview}, jobId, freelancerId) {
    console.log(instruction1, instruction2, screenshot, video, preview);
    const sql = "INSERT IGNORE INTO times (jobId, instruction1Time, instruction2Time, instruction3Time, instruction4Time, instruction5Time, screenshotTime, videoTime, previewTime, " +
        "freelancerId) VALUES (?,?,?,?,?,?,?,?,?,?)";

    await connection.promise().query(sql, [jobId, instruction1, instruction2, instruction3, instruction4, instruction5, screenshot, video, preview, freelancerId]);
}

exports.create = async (jobId, freelancerId, workTypeInstructionId, time) => {
    const sql = "INSERT INTO times SET ?";
    const [result] = await connection.promise().query(sql, {jobId, freelancerId, workTypeInstructionId, time});
    return result;
};

exports.setInstructionTimes = setInstructionTimes;
