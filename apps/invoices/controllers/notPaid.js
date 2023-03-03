const jobs = require('../../../models/jobs');
const invoices = require('../../../models/invoices');
const freelancers_messages = require('../../../models/freelancers_messages');

exports.get = async (req, res) => {
    let options = {
        title: "FL - Not paid invoices",
        errors: req.session.errors, warnings: req.session.warnings,
        successes: req.session.successes,
        firstName: req.session.user.firstName,
        lastName: req.session.user.lastName
    };

    req.session.errors = []; req.session.warnings = [];
    req.session.successes = [];

    const freelancerId = req.session.user.id;

    try {
        options.invoices = await invoices.getNotPaid(freelancerId);
    }
    catch(e) {
        console.log(e);
        options.errors.push("Failed to get your not paid invoices.");
    }
    try {
        options.unread = await freelancers_messages.getUnread(freelancerId);
    }
    catch (e) {
        console.log(e);
    }
    res.render('notPaid', options);
};
