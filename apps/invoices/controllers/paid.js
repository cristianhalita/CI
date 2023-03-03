const jobs = require('../../../models/jobs');
const invoices = require('../../../models/invoices');
const freelancers_messages = require('../../../models/freelancers_messages');
const jobSelectorInvoices = require('../../../models/jobSelectorInvoices');

exports.get = async (req, res) => {
    let options = {
        title: "FL - Paid invoices",
        errors: req.session.errors, warnings: req.session.warnings,
        successes: req.session.successes,
        firstName: req.session.user.firstName,
        lastName: req.session.user.lastName
    };

    req.session.errors = []; req.session.warnings = [];
    req.session.successes = [];

    const freelancerId = req.session.user.id;

    try {
        options.invoices = await invoices.getPaid(freelancerId);
    }
    catch(e) {
        console.error(e);
        options.errors.push("Failed to get your paid invoices.");
    }
    try {
        options.unread = await freelancers_messages.getUnread(freelancerId);
    }
    catch (e) {
        console.error(e);
    }

    try {
        if (req.session.loggedIn || req.session.user.loggedIn) {
            options.loggedIn = true;
            let oldInvoices = await jobSelectorInvoices.getAll(freelancerId);
            for (let i = 0; i < oldInvoices.length; i++) {
                oldInvoices[i].noteNumber = decodeURIComponent(oldInvoices[i].noteNumber);
            }

            options.oldInvoices = oldInvoices;
        }
    }
    catch (e) {
        console.error(e);
        options.errors.push("Failed to get your old invoices.");
    }
    res.render('paid', options);
};
