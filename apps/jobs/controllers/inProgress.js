const jobs = require('../../../models/jobs');
const freelancers_messages = require('../../../models/freelancers_messages');
const lsps = require('../../../models/lsps');

exports.get = async (req, res) => {
    let options = {
        title: "FL - In progress",
        errors: req.session.errors, warnings: req.session.warnings,
        successes: req.session.successes,
        firstName: req.session.user.firstName,
        lastName: req.session.user.lastName,
        freelancer: req.session.user
    };


    req.session.errors = [];
    req.session.warnings = [];
    req.session.successes = [];

    const {id: freelancerId, lspId} = req.session.user;


    try {
        options.unread = await freelancers_messages.getUnread(freelancerId);
    }
    catch (e) {
        console.error(e);
    }
    try {
        let margin = 0;
        if (lspId) {
            margin = await lsps.getMargin(lspId);
        }

        margin = 100 - margin;

        let jobRows  = await jobs.getInProgress(freelancerId);

        for (let i = 0; i < jobRows.length; i++) {
            if (jobRows[i].price) {
                jobRows[i].price = Math.floor(jobRows[i].price * margin) / 100;
            }
        }

        options.jobs = jobRows;
    }
    catch (e) {
        console.log(e);
        options.errors.push("Something went wrong with getting in progress jobs.");
    }

    res.render('inProgress', options);
};
