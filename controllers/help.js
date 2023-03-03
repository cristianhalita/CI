const freelancers_messages = require('../models/freelancers_messages');


exports.get = async (req, res) => {
    const options = {
        firstName: req.session.user.firstName,
        lastName: req.session.user.lastName,
        title: "Help",
        errors: req.session.errors,
        warnings: req.session.warnings
    };

    req.session.errors = []; req.session.warnings = [];

    try {
        options.unread = await freelancers_messages.getUnread(freelancerId);
    }
    catch (e) {
        console.log(e);
    }

    res.render('help', options);
};
