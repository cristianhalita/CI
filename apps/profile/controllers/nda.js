const freelancers_messages = require('../../../models/freelancers_messages');
const NDA = require('../../../models/NDA');

exports.get = async (req, res) => {
    const options = {
        title: "FL - N.D.A.",
        errors: req.session.errors, warnings: req.session.warnings,
        firstName: req.session.user.firstName,
        lastName: req.session.user.lastName,
        freelancer: req.session.user
    };

    req.session.errors = [];
    req.session.warnings = [];
    req.session.successes =  [];

    const {id: freelancerId, lspId, lspCompanyName} = req.session.user;

    try {
        options.unread = await freelancers_messages.getUnread(freelancerId);
    }
    catch (e) {
        console.log(e);
    }
    try {
        let ndaRows = await NDA.getAll();

        if (lspId) {
            ndaRows = ndaRows.filter(value => {
                if (value.subcontractor) {
                    return value;
                }
            }).map(value => {
                value.NDA = value.NDA.replace(/{{COMPANY NAME OF LSP}}/g, lspCompanyName);
                return value;
            });
        }
        else {
            ndaRows = ndaRows.filter(value => {
                if (!value.subcontractor) {
                    return value;
                }
            });
        }

        options.NDA = ndaRows;
    }
    catch (e) {
        console.log(e);
        options.errors.push("Failed to get the NDA's from the db.");
    }

    res.render('NDA', options);
};
