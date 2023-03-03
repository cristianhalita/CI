const readingSpeed = require('../models/readingSpeed');

module.exports = async (req, res, next) => {
    const {id: freelancerId, lspId, lspCompanyName} = req.session.user;

    try {
        const readingSpeedRows = await readingSpeed.getAll(freelancerId);

        if (readingSpeedRows.length > 0) {
            next();
        }
        else {

            let options = {
                title: "FL - Instructions",
                errors: req.session.errors,
                firstName: req.session.user.firstName,
                lastName: req.session.user.lastName,
                freelancer: req.session.user
            };

            req.session.errors = [];

            res.render('readingSpeedTest', options);
        }
    }
    catch (e) {
        console.log(e);
        req.session.errors.push("Failed to do a backend check to see if you have read the instructions. Please report this to the developer.");
        next();
    }
};