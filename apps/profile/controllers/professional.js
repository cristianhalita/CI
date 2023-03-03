const computerType = require('../../../models/computerTypes');
const freelanceType = require('../../../models/freelanceTypes');
const workTime = require('../../../models/workTimes');
const timeZone = require('../../../models/timeZones');
const user = require('../../../models/freelancers');
const languagePair = require('../../../models/languagePairs');
const freelancers_messages = require('../../../models/freelancers_messages');
const domainsOfExpertise = require('../../../models/domainsOfExpertise');
const freelancers_domainsOfExpertise = require('../../../models/freelancers_domainsOfExpertise');
const skills = require('../../../models/skills');
const freelancers_skills = require('../../../models/freelancers_skills');

exports.get = async (req, res) => {
    let options = {
        title: "FL - Professional",
        errors: req.session.errors, warnings: req.session.warnings,
        successes: req.session.successes,
        firstName: req.session.user.firstName,
        lastName: req.session.user.lastName
    };

    req.session.errors = []; req.session.warnings = [];
    req.session.successes = [];

    const {id: freelancerId} = req.session.user;

    try {
        const professionalInfo = await user.getProfessionalInfo(req.session.user.email);
        const computerTypeId = professionalInfo.computerTypeId;
        const freelanceTypeId = professionalInfo.freelanceTypeId;
        const workTimeId = professionalInfo.workTimeId;
        const timeZoneId = professionalInfo.timeZoneId;
        const lPair1 = professionalInfo.lPair1;
        const lPair2 = professionalInfo.lPair2;
        const lPair3 = professionalInfo.lPair3;
        const lPair4 = professionalInfo.lPair4;

        options.user = professionalInfo;


        const computerTypes = await computerType.getAll();

        for (let i = 0; i < computerTypes.length; i++) {
            computerTypes[i].selected = computerTypes[i].id === computerTypeId;
        }
        options.computerTypes = computerTypes;

        const freelancerTypes = await freelanceType.getAll();

        for (let i = 0; i < freelancerTypes.length; i++) {
            freelancerTypes[i].selected = freelancerTypes[i].id === freelanceTypeId;
        }

        // console.log(freelancerTypes);
        options.freelanceTypes = freelancerTypes;

        const workTimes = await workTime.getAll();

        for (let i = 0; i < workTimes.length; i++) {
            workTimes[i].selected = workTimes[i].id === workTimeId;
        }
        options.workTimes = workTimes;

        const timeZones = await timeZone.getAll();

        for (let i = 0; i < timeZones.length; i++) {
            timeZones[i].selected = timeZones[i].id === timeZoneId;
        }
        options.timeZones = timeZones;

        const languagePairs = await languagePair.getAll();

        for (let i = 0; i < languagePairs.length; i++) {
            languagePairs[i].lPair1 = languagePairs[i].id === lPair1;
            languagePairs[i].lPair2 = languagePairs[i].id === lPair2;
            languagePairs[i].lPair3 = languagePairs[i].id === lPair3;
            languagePairs[i].lPair4 = languagePairs[i].id === lPair4;
        }

        const domainsOfExpertiseRows = await domainsOfExpertise.getAll();
        const myDomains = await freelancers_domainsOfExpertise.getAll(freelancerId);

        for (let i = 0; i < domainsOfExpertiseRows.length; i++) {
            domainsOfExpertiseRows[i].selected = myDomains.includes(domainsOfExpertiseRows[i].id);
        }

        options.domainsOfExpertise = domainsOfExpertiseRows;

        const skillRows = await skills.getAll();
        const mySkills = await freelancers_skills.getAll(freelancerId);

        for (let i = 0; i < skillRows.length; i++) {
            for (let j = 0; j < mySkills.length; j++) {
                if (mySkills[j].skillId === skillRows[i].id) {
                    skillRows[i].score = mySkills[j].score;
                }
            }
        }

        options.skills = skillRows;
        options.languagePairs = languagePairs;
    }
    catch (e) {
        console.log(e);
        options.errors.push("Something went wrong while getting your professional information.");

    }
    try {
        options.unread = await freelancers_messages.getUnread(freelancerId);
    }
    catch (e) {
        console.log(e);
    }
    res.render("professional", options);
};

exports.post = async (req, res) => {
    const {id: freelancerId} = req.session.user;

    try {
        const {skills: skillsFromBody} = req.body;

        if (skillsFromBody) {
            const skillRows = await skills.getAll();

            for (let i = 0; i < skillsFromBody.length; i++) {
                const skillExists = await freelancers_skills.getOne(skillRows[i].id, freelancerId);

                if (skillsFromBody[i]) {
                    if (skillExists) {
                        await freelancers_skills.updateOne(skillExists.id, parseInt(skillsFromBody[i]));
                    }
                    else {
                        await freelancers_skills.insert(skillRows[i].id, freelancerId, parseInt(skillsFromBody[i]));
                    }
                }
                else if (skillExists){
                    await freelancers_skills.deleteOne(skillExists.id);
                }
            }
        }

        await user.updateProfessionalInfo(freelancerId, req.body);
        req.session.successes.push("Successfully updated your professional info.");
    }
    catch (e) {
        console.log(e);
        req.session.errors.push("Something went wrong with updating your professional info.");
    }
    finally {
        res.redirect('/profile/professional');
    }
};
