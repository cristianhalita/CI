const freelancers = require('../../../models/freelancers');
const messages = require('../../../models/messages');
const jobs = require('../../../models/jobs');
const invoices = require('../../../models/invoices');
const freelancers_messages = require('../../../models/freelancers_messages');
const NDA = require('../../../models/NDA');
const freelancers_NDA = require('../../../models/freelancers_NDA');
const lsps = require('../../../models/lsps');
const readingSpeedModel = require('../../../models/readingSpeed');

exports.get = async (req, res) => {
    const options = {
        title: "FL - Profile",
        errors: req.session.errors,
        successes: req.session.successes,
        warnings: req.session.warnings,
        freelancer: req.session.user
    };

    req.session.errors = [];
    req.session.warnings = [];
    req.session.successes = [];

    const {email: freelancerEmail, id: freelancerId, lspId} = req.session.user;

    try {
        const paymentInfo = await freelancers.getPaymentInfo(freelancerId);
        if (!paymentInfo.companyPersonal && !lspId) {
            options.warnings.push("Your payment information is not complete yet, be aware you can't make invoices or notes. " +
                "You can complete it under My profile -- Payment.");
        }
    }
    catch (e) {
        console.error(e);
    }

    let messageRows, warningRows;

    try {
        messageRows = await messages.getMessages();
    }
    catch (e) {
        console.error(e);
        options.errors.push("Something went wrong with getting messages from the db.");
    }

    try {
        warningRows = await messages.getWarnings();
    }
    catch (e) {
        console.error(e);
        options.errors.push("Something went wrong with getting warnings from the db.");
    }
    try {
        const freelancerMessages = await freelancers_messages.getAll(freelancerId);


        let readMessages = [];
        let unReadMessages = [];

        for (let i = 0; i < messageRows.length; i++) {
            messageRows[i].message = messageRows[i].message.replace(/[\n\r]/g, ' ');
            messageRows[i].encodedMessage = messageRows[i].message.replace(/'/g, "\\'").replace(/"/, '\\"');

            if (freelancerMessages.length < 1) {
                unReadMessages.push(messageRows[i]);
            }
            else {
                for (let j = 0; j < freelancerMessages.length; j++) {
                    if (messageRows[i].id === freelancerMessages[j].messageId) {
                        readMessages.push(messageRows[i]);
                        break;
                    }
                    if (j === freelancerMessages.length - 1) {
                        unReadMessages.push(messageRows[i]);
                    }
                }
            }
        }

        let readWarnings = [];
        let unReadWarnings = [];

        for (let i = 0; i < warningRows.length; i++) {
            warningRows[i].message = warningRows[i].message.replace(/[\n\r]/g, ' ');
            warningRows[i].encodedMessage = warningRows[i].message.replace(/'/g, "\\'").replace(/"/, '\\"');

            if (freelancerMessages.length < 1) {
                unReadWarnings.push(warningRows[i]);
            }
            else {
                for (let j = 0; j < freelancerMessages.length; j++) {
                    if (warningRows[i].id === freelancerMessages[j].messageId) {
                        readWarnings.push(warningRows[i]);
                        break;
                    }
                    if (j === freelancerMessages.length - 1) {
                        unReadWarnings.push(warningRows[i]);
                    }
                }
            }
        }

        options.readMessages = readMessages;
        options.unReadMessages = unReadMessages;
        options.readWarnings = readWarnings;
        options.unReadWarnings = unReadWarnings;

        options.unread = await freelancers_messages.getUnread(freelancerId);
    }
    catch (e) {
        console.log(e);
        options.errors.push("Failed to see wetter you checked a message/warning.");
    }
    try {
        let jobsInProgress = await jobs.getInProgress(freelancerId, 5);

        let margin = 0;
        if (lspId) {
            margin = await lsps.getMargin(lspId);
        }

        margin = 100 - margin;

        for (let i = 0; i < jobsInProgress.length; i++) {
            if (jobsInProgress[i].price) {
                jobsInProgress[i].price = Math.floor(jobsInProgress[i].price * margin) / 100;
            }
        }

        options.jobsInProgress = jobsInProgress;
    }
    catch (e) {
        console.log(e);
        options.errors.push("Something went wrong with getting your jobs in progress from the db.");
    }

    try {
        let deliveredJobs = await jobs.getDelivered(freelancerId, 5);

        let margin = 0;
        if (lspId) {
            margin = await lsps.getMargin(lspId);
        }

        margin = 100 - margin;

        for (let i = 0; i < deliveredJobs.length; i++) {
            if (deliveredJobs[i].collective) {
                deliveredJobs[i].price = deliveredJobs[i].collectivePrice;
                deliveredJobs[i].deliveryDate = deliveredJobs[i].collectiveDeliveryDate;
            }

            if (deliveredJobs[i].price) {
                deliveredJobs[i].price = Math.floor(deliveredJobs[i].price  * margin) / 100;
            }
        }

        options.jobsDelivered = deliveredJobs;
    }
    catch (e) {
        console.log(e);
        options.errors.push("Something went wrong with getting your delivered jobs from the db.");
    }

    try {
        options.invoices = await invoices.getAll(freelancerId, 5);
    }
    catch (e) {
        console.log(e);
        options.errors.push("Something went wrong with getting your invoices from the db.");
    }

    res.render('profile', options);
};

exports.help =async (req, res) => {
    const options = {
        title: "FL - Profile HELP",
        firstName: req.session.user.firstName,
        lastName: req.session.user.lastName,
        freelancer: req.session.user
    };

    const {id: freelancerId} = req.session.user;

    try {
        options.unread = await freelancers_messages.getUnread(freelancerId);
    }
    catch (e) {
        console.log(e);
    }

    res.render('help', options);
};

exports.agreeToNDA = async (req, res) => {
    const {NDA} = req.body;
    const {id: freelancerId} = req.session.user;


    try {
        if (Array.isArray(NDA)) {
            for (let i = 0; i < NDA.length; i++) {
                await freelancers_NDA.createOne(NDA[i], freelancerId);
            }
        }
        else {
            await freelancers_NDA.createOne(NDA, freelancerId);
        }
    }
    catch (e) {
        console.log(e);
        req.session.errors.push("Failed to agree to the NDA.");
    }
    finally {
        res.redirect('/profile');
    }
};

exports.readingSpeed = async (req, res) => {
    const {id: freelancerId} = req.session.user;
    const {timeSpend, linkClicked} = req.body;

    try {
        await readingSpeedModel.createOne(freelancerId, timeSpend, linkClicked === "true");
        req.session.successes.push("Thank you for your time to read this important document. You have spent " + Math.round(timeSpend / 1000) + " seconds on reading it." +
            "<br/><br/>" +
            "The average reading speed for a native speaker of this document is 3.2 minutes and for a non-native speaker 3.8 minutes.");
    }
    catch (e) {
        console.error(e);
    }
    finally {
        res.redirect('/profile');
    }
}