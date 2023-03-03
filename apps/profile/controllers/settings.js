const emailNotifications = require('../../../models/emailNotifications');
const freelancers_messages = require('../../../models/freelancers_messages');

exports.get = async (req, res) => {
    let options = {
        title: "FL - Settings",
        errors: req.session.errors,
        successes: req.session.successes,
        freelancer: req.session.user
    };

    req.session.errors = [];
    req.session.successes = [];

    const {id: freelancerId} = req.session.user;

    try {
        options.settings = await emailNotifications.getOne(freelancerId);
        console.log(options.settings);
    }
    catch (e) {
        console.error(e);
        options.errors.push("Failed to get your settings.");
    }

    try {
        options.unread = await freelancers_messages.getUnread(freelancerId);
    }
    catch (e) {
        console.error(e);
    }

    res.render('settings', options);
};

exports.post = async (req, res) => {
    let {assigned, deadLineIn24Hours, invoicePayed, bonusCreated} = req.body;

    assigned = assigned === "on";
    deadLineIn24Hours = deadLineIn24Hours === "on";
    invoicePayed = invoicePayed === "on";
    bonusCreated = bonusCreated === "on";

    const {id: freelancerId}  = req.session.user;


    try {
        const row = await emailNotifications.getOne(freelancerId);

        if (row) {
            await emailNotifications.update(freelancerId, assigned, deadLineIn24Hours, invoicePayed, bonusCreated);
        }
        else {
            await emailNotifications.createOne(freelancerId, assigned, deadLineIn24Hours, invoicePayed, bonusCreated);
        }

        req.session.successes.push("Successfully updated your settings.");
    }
    catch (e) {
        console.error(e);
        req.session.errors.push("Failed to update your settings.");
    }

    res.redirect('/profile/settings');
};