const jobs = require('../../../models/jobs');
const invoices = require('../../../models/invoices');
const freelancers_messages = require('../../../models/freelancers_messages');
const jobSelectorInvoices = require('../../../models/jobSelectorInvoices');
const freelancers = require('../../../models/freelancers');

exports.get = async (req, res) => {
    let options = {
        title: "FL - Invoices",
        errors: req.session.errors, warnings: req.session.warnings,
        successes: req.session.successes,
        firstName: req.session.user.firstName,
        lastName: req.session.user.lastName
    };

    req.session.errors = []; req.session.warnings = [];
    req.session.successes = [];

    const freelancerId = req.session.user.id;

    try {
        options.invoices = await invoices.getAll(freelancerId);
    }
    catch(e) {
        console.error(e);
        options.errors.push("Failed to get your invoices.");
    }
    try {
        options.unread = await freelancers_messages.getUnread(freelancerId);
    }
    catch (e) {
        console.error(e);
    }
    res.render('invoices', options);
};

exports.getOne = async (req, res) => {
    const {id: invoiceId} = req.params;
    const {fromOldSelector} = req.query;

    const freelancerId = req.session.user.id;

    console.log(invoiceId);

    try {
        let html;
        if (fromOldSelector) {
            html = "<style>body {\n" +
                " font-family:'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;\n" +
                " text-align:center;\n" +
                " color:#777;\n" +
                "}\n" +
                "body a {\n" +
                " color:#06F;\n" +
                "}\n" +
                ".invoice-box {\n" +
                " max-width:800px;\n" +
                " margin:auto;\n" +
                " padding:30px;\n" +
                " border:1px solid #eee;\n" +
                " box-shadow:0 0 10px rgba(0, 0, 0, .15);\n" +
                " font-size:16px;\n" +
                " line-height:24px;\n" +
                " font-family:'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;\n" +
                " color:#555;\n" +
                "}\n" +
                ".invoice-box table {\n" +
                " width:100%;\n" +
                " line-height:inherit;\n" +
                " text-align:left;\n" +
                "}\n" +
                ".invoice-box table td {\n" +
                " padding:5px;\n" +
                " vertical-align:top;\n" +
                "}\n" +
                ".invoice-box table tr td:nth-child(4) {\n" +
                " text-align:right;\n" +
                "}\n" +
                ".invoice-box table tr.top table td {\n" +
                " padding-bottom:20px;\n" +
                "}\n" +
                ".invoice-box table tr.top table td.title {\n" +
                " font-size:45px;\n" +
                " line-height:45px;\n" +
                " color:#333;\n" +
                "}\n" +
                ".invoice-box table tr.information table td {\n" +
                " padding-bottom:40px;\n" +
                "}\n" +
                ".invoice-box table tr.heading td {\n" +
                " background:#eee;\n" +
                " border-bottom:1px solid #ddd;\n" +
                " font-weight:bold;\n" +
                "}\n" +
                ".invoice-box table tr.details td {\n" +
                " padding-bottom:20px;\n" +
                "}\n" +
                ".invoice-box table tr.item td {\n" +
                " border-bottom:1px solid #eee;\n" +
                "}\n" +
                ".invoice-box table tr.item.last td {\n" +
                " border-bottom:none;\n" +
                "}\n" +
                ".invoice-box table tr.total td:nth-child(2) {\n" +
                " border-top:2px solid #eee;\n" +
                " font-weight:bold;\n" +
                "}\n" +
                "@media only screen and (max-width: 600px) {\n" +
                " .invoice-box table tr.top table td {\n" +
                "  width:100%;\n" +
                "  display:block;\n" +
                "  text-align:center;\n" +
                " }\n" +
                " .invoice-box table tr.information table td {\n" +
                "  width:100%;\n" +
                "  display:block;\n" +
                "  text-align:center;\n" +
                " }\n" +
                "}</style>\n";
            html += decodeURIComponent((await jobSelectorInvoices.getOne(freelancerId, invoiceId)).html);
        }
        else {
            ({html} = await invoices.getOne(freelancerId, invoiceId));
        }
        res.send(html);
    }
    catch (e) {
        console.error(e);
    }
};

exports.help = async (req, res) => {
    const options = {
        title: "FL - Invoices HELP",
        firstName: req.session.user.firstName,
        lastName: req.session.user.lastName
    };

    const {id: freelancerId} = req.session.user;

    try {
        options.unread = await freelancers_messages.getUnread(freelancerId);
    }
    catch (e) {
        console.error(e);
    }

    res.render('help', options);
};

exports.login = async (req, res) => {
    const {email, pin} = req.body;
    const {id: freelancerId} = req.session.user;

    try {
        const rows = await jobSelectorInvoices.authenticate(email, pin);
        if (rows.length < 1) {
            req.session.errors.push("Failed to authenticate or you have no old invoices.");
        }
        else {
            await jobSelectorInvoices.addFreelancerId(email, pin, freelancerId);
            await freelancers.changeLoggedIn(freelancerId);
            req.session.loggedIn = true;
        }
    }
    catch (e) {
        console.error(e);
        req.session.errors.push("Something went wrong with authenticating.");
    }
    res.redirect('/invoices/paid');
};
