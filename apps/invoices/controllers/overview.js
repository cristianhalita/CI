const invoices = require('../../../models/invoices');
const freelancers_messages = require('../../../models/freelancers_messages');
const jobSelectorInvoices = require('../../../models/jobSelectorInvoices');

exports.get = async (req, res) => {
    let options = {
        title: "FL - Overview Invoices",
        errors: req.session.errors, warnings: req.session.warnings,
        successes: req.session.successes,
        firstName: req.session.user.firstName,
        lastName: req.session.user.lastName
    };

    req.session.errors = [];
    req.session.warnings = [];
    req.session.successes = [];

    const {id: freelancerId} = req.session.user;

    try {
        options.years = await invoices.getOverview(freelancerId);
    }
    catch (e) {
        console.error(e);
    }

    try {
        options.unread = await freelancers_messages.getUnread(freelancerId);
    }
    catch (e) {
        console.log(e);
    }

    res.render('overview', options);
};
