const freelancers = require('../models/freelancers');

exports.post = async (req, res) => {
    try {
        const freelancer = await freelancers.getById(req.body.freelancerId);
        if (freelancer) {
            req.session.user = freelancer;
        }
    }
    catch (e) {
        console.error(e);
        res.redirect('/login');
    }
    finally {
        res.redirect('/profile');
    }
};