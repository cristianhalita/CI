const user = require('../models/freelancers');
const paymentMethods = require('../models/paymentMethods');

exports.get = async (req, res) => {
    let options = {
        title: "FL - Complete profile",
        errors: req.session.errors,
        warnings: req.session.warnings,
        successes: req.session.successes,
        user: req.session.user
    };

    req.session.errors = [];
    req.session.warnings = [];
    req.session.successes = [];

    try {
        options.paymentMethods = await paymentMethods.getAll();
    }
    catch (e) {
        console.error(e);
    }

    res.render('completeProfile', options);
};

exports.post = (req, res) => {
    user.completeProfile(req.body, req.session.user.email).then(result => {
        req.session.successes.push("You completed your profile.");
        res.redirect('/profile');
    }).catch(error => {
        console.log(error);
        req.session.errors.push("Something went wrong while completing your profile.");
        res.redirect('/completeProfile');
    })
};
