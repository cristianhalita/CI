const jobs = require('../../../models/jobs');
const workTypeInstructions = require('../../../models/workTypeInstructions');
const fs = require('fs').promises;
const fsConstants = require('fs').constants;
const freelancers_messages = require('../../../models/freelancers_messages');

const path = require('path');

exports.get = async (req, res) => {
    const instructionId = req.params.instruction;
    const jobId = req.params.id;

    let options = {
        firstName: req.session.user.firstName,
        lastName: req.session.user.lastName,
        title: null,
        errors: req.session.errors, warnings: req.session.warnings,
        successes: req.session.successes,
        instruction: null
    };

    req.session.errors = []; req.session.warnings = [];
    req.session.successes = [];

    const {id: freelancerId} = req.session.user;

    try {
        const instruction = await workTypeInstructions.getById(instructionId);
        options.title = instruction.fileName;
        options.instruction = instructionId.fileName;

        const {workType} = await jobs.getWorkType(jobId);
        let source = "/instructions/" + workType + "/" + instruction.fileName;

        await fs.access(path.join(__dirname, "../public", source), fsConstants.F_OK);
        options.source = "/jobs" + source;
    }
    catch (e) {
        console.log(e);
        options.errors.push("Failed to get this instruction.");
    }
    try {
        options.unread = await freelancers_messages.getUnread(freelancerId);
    }
    catch (e) {
        console.log(e);
    }
    res.render('instruction', options);
};
