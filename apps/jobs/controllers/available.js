const jobs = require('../../../models/jobs');
const freelancers_messages = require('../../../models/freelancers_messages');
const lsps = require('../../../models/lsps');
const freelancers = require('../../../models/freelancers');

const workTypeMap = require('../../../workTypes/workTypeMap');

exports.get = async (req, res) => {
    let options = {
        title: "FL - Available",
        errors: req.session.errors,
        warnings: req.session.warnings,
        successes: req.session.successes,
        firstName: req.session.user.firstName,
        lastName: req.session.user.lastName,
        freelancer: req.session.user
    };

    req.session.errors = []; req.session.warnings = [];
    req.session.successes = [];

    const {id: freelancerId, lspId} = req.session.user;

    try {
        let margin = 0;
        if (lspId) {
            margin = await lsps.getMargin(lspId);
        }

        margin = 100 - margin;

        const motherTongue = await freelancers.getMotherTongue(freelancerId);

        let availableJobs = await jobs.getAvailable(freelancerId);
        let indexesToRemove = [];
        for (let i = 0; i < availableJobs.length; i++) {
            const progress = await workTypeMap[availableJobs[i].workType.toLowerCase()].getProgress(availableJobs[i].id);

            if (availableJobs[i].collective && ((availableJobs[i].workType.toLowerCase() !== "bte" && availableJobs[i].workType.toLowerCase() !== "haw") || !availableJobs[i].trial) && progress) {
                if (progress.done === progress.total) {
                    indexesToRemove.push(i);
                }
            }

            if (progress) {
                availableJobs[i].volume = progress.total;
            }

            if (availableJobs[i].price) {
                availableJobs[i].price = Math.floor(availableJobs[i].price * margin) / 100;
            }

            if (!availableJobs[i].pushedTo) {
                if (availableJobs[i].onlyForTargetNatives && availableJobs[i].onlyForSourceNatives) {
                    if (motherTongue != availableJobs[i].targetId && motherTongue != availableJobs[i].sourceId) {
                        indexesToRemove.push(i);
                    }
                }
                else if (availableJobs[i].onlyForTargetNatives) {
                    if (motherTongue != availableJobs[i].targetId) {
                        indexesToRemove.push(i);
                    }
                }
                else if (availableJobs[i].onlyForSourceNatives) {
                    if (motherTongue != availableJobs[i].sourceId) {
                        indexesToRemove.push(i);
                    }
                }
            }
        }
        for (let i = 0; i < indexesToRemove.length; i++) {
            delete availableJobs[indexesToRemove[i]];
        }

        options.jobs = availableJobs;
    }
    catch (e) {
        console.error(e);
        options.errors.push("Something went wrong with getting available jobs.");
    }

    try {
        options.unread = await freelancers_messages.getUnread(freelancerId);
    }
    catch (e) {
        console.error(e);
    }
    res.render('available', options);
};
