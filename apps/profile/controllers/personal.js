const freelancer = require('../../../models/freelancers');
const language = require('../../../models/languages');
const country = require('../../../models/countries');
const freelancers_messages = require('../../../models/freelancers_messages');
const socketlabs = require("../../../util/socketlabs");

exports.get = async (req, res) => {
    let options = {
        title: "FL - Personal",
        errors: req.session.errors, warnings: req.session.warnings,
        successes: req.session.successes,
        firstName: req.session.user.firstName,
        lastName: req.session.user.lastName
    };

    req.session.errors = []; req.session.warnings = [];
    req.session.successes = [];

    const {id: freelancerId} = req.session.user;

    try {
        const personalInfo = await freelancer.getPersonalInfo(req.session.user.id);
        const motherTongue = personalInfo.motherTongue;
        const countryOfResidence = personalInfo.countryOfResidence;
        const nationality = personalInfo.nationality;

        options.user = personalInfo;

        let languages = await language.getAll();
        for (let i = 0; i < languages.length; i++) {
            languages[i].selected = languages[i].id === motherTongue;
        }

        options.languages = languages;

        const countries = await country.getAll();
        for (let i = 0; i < countries.length; i++) {
            countries[i].selected = countries[i].id === countryOfResidence;
            countries[i].nationalitySelected = countries[i].id === nationality;
        }

        options.countries = countries;
    }
    catch (ex) {
        console.log(ex);
        options.errors.push("Something went wrong with getting you personal info.");
    }
    try {
        options.unread = await freelancers_messages.getUnread(freelancerId);
    }
    catch (e) {
        console.log(e);
    }
    res.render('personal', options);

};

exports.post = async (req, res) => {
    const {id: freelancerId} = req.session.user;

    try {
        const personalInfo = await freelancer.getPersonalInfo(freelancerId);

        let info = [];

        for (let key in personalInfo) {
            if (personalInfo[key] != req.body[key]) {
                let oldValue = personalInfo[key];
                let newValue = req.body[key];

                if (key === "countryOfResidence") {
                    oldValue = await country.getName(oldValue);
                    newValue = await country.getName(newValue);
                }
                if (key === "motherTongue") {
                    oldValue = await language.getName(oldValue);
                    newValue = await language.getName(newValue);
                }

                info.push({
                    label: key,
                    old: oldValue,
                    new: newValue
                });
            }
        }

        await freelancer.updatePersonalInfo(freelancerId, req.body);

        let infoText = info.map(value => value.label + ": " + value.old + " --> " + value.new).join("\n");
        await socketlabs.whenFlChangesPersonalInfo(personalInfo.firstName + " " + personalInfo.lastName, infoText);
        req.session.successes.push("Successfully updated your personal info.");
    }
    catch (e) {
        console.log(e);
        req.session.errors.push("Something went wrong with updating your personal info.");
    }
    finally {
        res.redirect('/profile/personal');
    }
};