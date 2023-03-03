const freelancers_messages = require('../../../models/freelancers_messages');

exports.get = async (req, res) => {
    const options = {
        title: "FL - Delete",
        errors: req.session.errors, warnings: req.session.warnings,
        successes: req.session.successes,
        firstName: req.session.user.firstName,
        lastName: req.session.user.lastName
    };

    req.session.errors = []; req.session.warnings = [];
    req.session.successes = [];

    const {id: freelancerId} = req.session.user;

    try {
        options.unread = await freelancers_messages.getUnread(freelancerId);
    }
    catch (e) {
        console.log(e);
    }

    res.render('delete', options);
};

const user = require('../../../models/freelancers');

exports.post = (req, res) => {
    const {explanation} = req.body;
    const {email} = req.session.user;

    user.deleteAccount(email, explanation).then(result => {
        req.session.successes.push("Successfully deleted your account.");
        req.session.user = null;
        res.redirect('/');
    }).catch(error => {
        req.session.errors.push("Something went wrong with deleting your account.");
        res.redirect('/profile/delete');
    });
};
