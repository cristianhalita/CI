const user = require('../../../models/freelancers');
const token = require('../../../models/tokens');
const paymentMethod = require('../../../models/paymentMethods');
const freelancers_messages = require('../../../models/freelancers_messages');
const countries = require('../../../models/countries');

exports.get = async (req, res) => {
    let options = {
        title: "FL - Payment",
        errors: req.session.errors, warnings: req.session.warnings,
        successes: req.session.successes,
        firstName: req.session.user.firstName,
        lastName: req.session.user.lastName
    };

    req.session.errors = []; req.session.warnings = [];
    req.session.successes = [];

    const {id: freelancerId} = req.session.user;

    try {
        options.country = await user.getCountry(freelancerId);
        const paymentInfo = await user.getPaymentInfo(freelancerId);
        options.user = paymentInfo;

        let paymentMethods = await paymentMethod.getAll();

        for (let i = 0; i < paymentMethods.length; i++) {
            paymentMethods[i].selected = paymentMethods[i].id === paymentInfo.preferredPaymentMethod;
        }
        if (options.country !== "BRAZIL") {
            paymentMethods = paymentMethods.filter(value => value.name !== "Husky");
        }
        options.paymentMethods = paymentMethods;
    }
    catch (e) {
        console.log(e);
        options.errors.push("Something went wrong while getting your payment information.");
    }
    try {
        options.unread = await freelancers_messages.getUnread(freelancerId);
    }
    catch (e) {
        console.log(e);
    }

    try {
        let countryRows = await countries.getAll();

        for (let i = 0; i < countryRows.length; i++) {
            countryRows[i].selected = countryRows[i].id === options.user.xoomCountry;
        }
        options.countries = countryRows;
    }
    catch (e) {
        console.error(e);
        options.errors.push("Failed to get the countries from the db.");
    }

    res.render('payment', options);
};

exports.post = async (req, res) => {
    const {email} = req.session.user;

    try {
        const keys = Object.keys(req.body);
        for (let i = 0; i < keys.length; i++) {
            if (!req.body[keys[i]]) {
                req.body[keys[i]] = null;
            }
        }

        await user.updatePaymentInfo(email, req.body);
        req.session.successes.push("Successfully updated your payment info.");
    }
    catch (e) {
        console.log(e);
        req.session.errors.push("Something went wrong with updating your payment info");
    }
    finally {
        res.redirect('/profile/payment');
    }
};
