const user = require('../models/freelancers');
const country = require('../models/countries');
const language = require('../models/languages');
const languagePairs = require('../models/languagePairs');
const origins = require('../models/origins');
const NDA = require('../models/NDA');
const freelancers_NDA = require('../models/freelancers_NDA');
const emailNotifications = require('../models/emailNotifications');
const scammers = require('../models/scammers');
const scammerAttempts = require('../models/scammerAttempts');
const testResults = require('../models/testResults');
const socketlabs = require('../util/socketlabs');
const {generateTemporaryPassword} = require("../util/functions");
const validator = require('validator');

exports.get = async (req, res) => {
    let options = {
        title: "FL - Register",
        errors: req.session.errors,
        warnings: req.session.warnings,
        successes: req.session.successes,
        inputs: req.session.inputs,
        value: 3
    };


    req.session.inputs = null;
    req.session.successes = [];
    req.session.errors = [];
    req.session.warnings = [];

    try {
        let countries = await country.getAll();
        countries = countries.map((value) => {
            if (options.inputs) {
                value.selected = options.inputs.countryOfResidence == value.id;
            }
            else {
                value.selected = false;
            }

            return value;
        });
        options.countries = countries;
    }
    catch (e) {
        console.log(e);
        options.errors.push("Failed to get the countries from the db.");
    }
    try {
        let languages = await language.getAll();
        languages = languages.map((value) => {
            if (options.inputs) {
                value.selected = options.inputs.motherTongue == value.id;
            }
            else {
                value.selected = false;
            }
            return value;
        });
        options.languages = languages;
    }
    catch (e) {
        console.log(e);
        options.errors.push("Failed to get the languages from the db.");
    }
    try {
        options.languagePairs = await languagePairs.getAll();
    }
    catch (e) {
        console.log(e);
        options.errors.push("Failed to get the language pairs from the db.");
    }
    try {
        options.origins = await origins.getAll();
    }
    catch (e) {
        console.log(e);
        options.errors.push("Failed to get the origins from the db.");
    }
    try {
        let ndaRows = await NDA.getAll();
        ndaRows = ndaRows.filter(value => {
            if (!value.subcontractor) {
                return value;
            }
        });
        options.NDA = ndaRows;

    }
    catch (e) {
        console.log(e);
        options.errors.push("Failed to get all NDA's from the db.");
    }
    res.render('register', options);
};

exports.post = async (req, res) => {
    const {languagePair1, languagePair2, languagePair3, languagePair4, firstName, lastName, email, question1, question2, onlineProfile, password, confirmPassword} = req.body;
    let {NDA} = req.body;

    if (!Array.isArray(NDA)) {
        if (NDA) {
            NDA = [NDA];
        }
        else {
            NDA = [];
        }
    }

    let errors = [];

    delete req.body.confirmPassword;
    req.session.inputs = req.body;

    if (!email || email.trim().length < 1) {
        errors.push("Please provide an email address.");
        req.session.errors = errors;
        return res.redirect('/register');
    }
    if (email.split('@')[1].split('.')[0].toLowerCase() === "yahoo") {
        errors.push("Please don't use a yahoo email address.");
    }
    if (firstName.trim() == "") {
        errors.push("Please provide a first name.");
    }
    if (lastName.trim() == "") {
        errors.push("Please provide a last name.");
    }
    if (question1.trim() == "" || question2.trim() == "") {
        errors.push("Please answer all the questions.");
    }
    if (onlineProfile.trim() == "") {
        errors.push("Please provide an online profile.");
    }
    if (!validator.isStrongPassword(password)) {
        errors.push("This password is not secure enough. Make sure it follows the requirements (8 characters, 1 lowercase, 1 uppercase, 1 number, 1 special character)");
    }
    if (password.trim() !== confirmPassword.trim()) {
        errors.push("Please check that the confirmed password is the same as the password.");
    }

    let languagePairsArray = [languagePair1, languagePair2, languagePair3, languagePair4];

    languagePairsArray.forEach((value) => {
        if ((languagePairsArray.indexOf(value) != languagePairsArray.lastIndexOf(value)) && (value != "")){
            errors.push("Every language pair must be different.");
        }
    });

    if (errors.length > 0){
        req.session.errors = errors;
        return res.redirect('/register');
    }

    try {
        const scammerId = await scammers.checkEmail(email);

        if (scammerId) {
            req.session.successes.push("Thank you for signing up. We will contact you shortly.");
            await scammerAttempts.createOne(scammerId, req.ip);
        }
        else {
            const {insertId: freelancerId} = await user.createOne(req.body);

            for (let i = 0; i < NDA.length; i++) {
                await freelancers_NDA.createOne(NDA[i], freelancerId);
            }
            await emailNotifications.createOne(freelancerId, true, true, true, true);
            await testResults.updateFreelancerId(freelancerId, email);
            const temporaryPassword = generateTemporaryPassword();
            await user.setTemporaryPassword(freelancerId, temporaryPassword);
            socketlabs.afterRegistration(email, firstName + " " + lastName, temporaryPassword);
            req.session.successes.push("We have sent you an email with a verification code to verify your email address.");
        }

        res.redirect('/login');
    }
    catch (e) {
        console.error(e);
        req.session.errors.push("This user is already registered.");
        res.redirect('/register');
    }
};
