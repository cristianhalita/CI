const user = require('../models/freelancers');
const freelancers_ips = require('../models/freelancers_ips');
const resolutions = require('../models/resolutions');
const socketlabs = require('../util/socketlabs');
const pm_ips = require('../models/pm_ips');
const {generateTemporaryPassword, verifyPassword} = require("../util/functions");

exports.get = (req, res) => {
    const options = {
        title: "FL - Login",
        errors: req.session.errors,
        warnings: req.session.warnings,
        successes: req.session.successes,
        inputs: req.session.inputs
    };

    req.session.inputs = null;
    req.session.errors = [];
    req.session.warnings = [];
    req.session.successes = [];

    res.render('login', options);
};

exports.post = async (req, res) => {
    const  {email, password, width, height, verificationCode} = req.body;

    delete req.body.password;
    req.session.inputs = req.body;

    let errors = [];

    if (!email) {
        errors.push("Email is required");
    }
    if (!password) {
        errors.push("Password is required");
    }

    if (errors.length > 0){
        req.session.errors = errors;
        return res.redirect('/login');
    }

    try {
        const freelancer = await user.getByEmail(email);

        if (!freelancer) { // email is not registered
            req.session.errors.push("This email is not registered yet, please register.");
            res.redirect('/register');
        }
        else {
            if (freelancer.blocked) {
                await user.updateLoginAttempts(email);

                if (freelancer.loginAttempts === 4) { // email the PMS when a freelancer tried to log in 4 times
                    socketlabs.whenFreelancerGetsBlocked(email, freelancer.firstName + " " + freelancer.lastName);
                }

                req.session.errors.push("For security reasons we have temporarily blocked your account. Please contact your Project Manager at Datamundi to report you have been locked out.");
                return res.redirect('/login');
            }

            if (!await verifyPassword(password, freelancer.password)) { // wrong password
                console.log(freelancer, password, req.ip, new Date().toString());
                await user.updateLoginAttempts(email);
                req.session.errors.push("Check that your credentials are correct and try again.");
                return res.redirect('/login');
            }
            if (freelancer.temporaryPassword) { // the freelancer has a verification code because he changed location or was unblocked
                if (verificationCode !== freelancer.temporaryPassword) { // wrong verification code
                    console.log(freelancer, verificationCode, req.ip, new Date().toString());
                    await user.updateLoginAttempts(email);
                    req.session.errors.push("Check that your credentials are correct and try again.");
                    return res.redirect('/login');
                }
                else {
                    await user.clearTemporaryPassword(freelancer.id);
                }
            }
            else {
                const lastIp = await freelancers_ips.getLastIp(freelancer.id); // get last ip from the last login
                const authorizedIpAddresses = await pm_ips.getAuthorizedIps(); // get last ips from PM logins

                if (lastIp !== req.ip && !authorizedIpAddresses.includes(req.ip)) { // login detected from new ip
                    const password = generateTemporaryPassword();
                    await user.setTemporaryPassword(freelancer.id, password);
                    socketlabs.temporaryPassword(email, await user.getFullName(freelancer.id), password);
                    req.session.errors.push("For security reasons we sent you a verification code for you to log in. Please check your e-mail and paste the verification code in the corresponding field.");
                    return res.redirect('/login');
                }
            }

            req.session.user = freelancer;
            await user.clearLoginAttempts(freelancer.id); // clear login attempts after successful login
            try {
                await freelancers_ips.createOne(freelancer.id, req.ip); // insert latest ip
            }
            catch (e) {
                console.error(e);
            }
            try {
                await resolutions.createOne(freelancer.id, width, height); // insert current resolution
            }
            catch (e) {
                console.error(e);
            }
            if (!freelancer.completedProfile && !freelancer.lspId) { // send them to a complete my profile page if they didn't do that yet and are not linked to lsps
                res.redirect('/completeProfile');
                console.log("Redirectring to completeProfile")
            }
            else {
                res.redirect('/profile');
            }
        }
    }
    catch (e) {
        console.error(e);
        req.session.errors.push("Something went wrong on the server.");
        res.redirect('/login');
    }
};
