const jobs = require('../../../models/jobs');

const fs = require('fs').promises;
const fsConstants = require('fs').constants;
const freelancers_messages = require('../../../models/freelancers_messages');

const path = require('path');

exports.get = async (req, res) => {
    console.log("screenshot");

    const jobId = req.params.id;

    let options = {
        title: "FL - Screenshot",
        errors: req.session.errors, warnings: req.session.warnings,
        successes: req.session.successes
    };

    req.session.errors = []; req.session.warnings = [];
    req.session.successes = [];

    const {id: freelancerId} = req.session.user;
    try {
        const {workType} = await jobs.getWorkType(jobId);

        const source = "/instructions/" + workType + "/screenshot.html";
        await fs.access(path.join(__dirname, "../public", source), fsConstants.F_OK);
        options.source = "/jobs" + source;
    }
    catch (e) {
        console.log(e);
        options.errors.push("Failed to get this screenshot.");
    }
    try {
        options.unread = await freelancers_messages.getUnread(freelancerId);
    }
    catch (e) {
        console.log(e);
    }

    res.render('screenshot', options);
};
