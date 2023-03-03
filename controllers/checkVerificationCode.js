const freelancers = require('../models/freelancers');

exports.post = async (req, res) => {
    const {email} = req.body;

    try {
        const temporaryPasswordRows = await freelancers.getTemporaryPassword(email);
        if (temporaryPasswordRows.length > 0) {
            res.send("true");
        }
        else {
            res.send("false");
        }
    }
    catch (e) {
        console.error(e);
        res.send("false");
    }
};