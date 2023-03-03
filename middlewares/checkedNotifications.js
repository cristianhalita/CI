const freelancers_messages = require('../models/freelancers_messages');

module.exports = async (req, res, next) => {
    const freelancerId = req.session.user.id;



    try {
        const unread = await freelancers_messages.getUnread(freelancerId);
        if (unread > 0) {
            req.session.warnings.push("You have to confirm you have read the messages and warnings before you can work on the portal.");
            res.redirect('/profile');
        }
        else {
            next();
        }
    }
    catch (e) {
        console.error(e);
        next();
    }


};
