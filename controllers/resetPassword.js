const resetPasswordTokens = require('../models/resetPasswordTokens');
const freelancers = require('../models/freelancers');
const {validateToken, hashPassword} = require("../util/functions");
const validator = require("validator");

exports.get = async (req, res) => {
    const options = {
        title: "FL - Reset Password",
        errors: req.session.errors,
        warnings: req.session.warnings,
        successes: req.session.successes,
        token: req.query.token
    };

    req.session.errors = [];
    req.session.successes = [];
    req.session.warnings = [];

    let {token} = req.query;

    try {
        await validateToken(token);
    }
    catch (e) {
        console.error(e);
        req.session.errors.push(e.message);
        return res.redirect('/forgot');
    }

    res.render('resetPassword', options);
};

exports.post = async (req, res) => {
    const {confirmPassword} = req.body;
    let {token, password} = req.body;

    try {
        let resetPasswordToken;

        try {
            resetPasswordToken = await validateToken(token);
        }
        catch (e) {
            console.error(e);
            req.session.errors.push(e.message);
            return res.redirect('/forgot');
        }

        let errors = [];

        if (!validator.isStrongPassword(password)) {
            errors.push("This password is not secure enough. Make sure it follows the requirements (8 characters, 1 lowercase, 1 uppercase, 1 number, 1 special character)");
        }
        if (password.trim() !== confirmPassword.trim()) {
            errors.push("Please check that the confirmed password is the same as the password");
        }

        if (errors.length > 0){
            req.session.errors = errors;
            return res.redirect('/resetPassword?token=' + token);
        }

        password = await hashPassword(password);

        await freelancers.updateById(resetPasswordToken.freelancerId, {
            password
        });
        await resetPasswordTokens.deleteById(resetPasswordToken.id);
        req.session.successes.push("Successfully reset your password.");
        res.redirect('/login');
    }
    catch (e) {
        console.error(e);
        req.session.errors.push("Failed to reset your password.");
        res.redirect('/resetPassword?token=' + token);
    }
};