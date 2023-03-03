const jobs = require('../../../models/jobs');
const workTypes = require('../../../models/workTypes');
const freelancers_messages = require('../../../models/freelancers_messages');

const workTypeMap = require('../../../workTypes/workTypeMap');

exports.get = async (req, res) => {
    const jobId = req.params.id;

    let options = {
        errors: req.session.errors, warnings: req.session.warnings,
        successes: req.session.successes,
        title: "FL - Preview"
    };


    req.session.errors = []; req.session.warnings = [];
    req.session.successes = [];

    try {
        const {workType, workTypeId} = await jobs.getWorkType(jobId);
        const previewAvailable = await workTypes.getPreview(workTypeId);

        if (previewAvailable) {
            const {rows, total} = await workTypeMap[workType.toLowerCase()].getPreview(jobId);
            options.headers = Object.keys(rows[0]);
            options.rows = rows;
            options.total = total;
        }
        else {
            options.errors.push("No preview available for this job.");
        }

        options.jobName = await jobs.getName(jobId);
    }
    catch (e) {
        console.error(e);
        options.errors.push("Failed to get a preview for this job.");
    }
    const {id: freelancerId} = req.session.user;

    try {
        options.unread = await freelancers_messages.getUnread(freelancerId);
    }
    catch (e) {
        console.error(e);
    }
    res.render('preview', options);
};
