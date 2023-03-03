const jobs = require('../../../models/jobs');
const workTypes = require('../../../models/workTypes');
const times = require('../../../models/times');
const collectiveJobs = require('../../../models/collectiveJobs');
const languagePairs = require('../../../models/languagePairs');
const freelancers_messages = require('../../../models/freelancers_messages');
const lsps = require('../../../models/lsps');
const socketlabs = require('../../../util/socketlabs');
const freelancers = require('../../../models/freelancers');
const jobHistory = require('../../../models/jobHistory');
const projects = require('../../../models/projects');
const projectInstructions = require('../../../models/projectInstructions');

const workTypeMap = require('../../../workTypes/workTypeMap');

exports.get = async (req, res) => {
    let options = {
        firstName: req.session.user.firstName,
        lastName: req.session.user.lastName,
        errors: req.session.errors,
        warnings: req.session.warnings,
        successes: req.session.successes,
        instructions: [],
        screenshot: false,
        video: false,
        preview: false
    };

    req.session.errors = [];
    req.session.warnings = [];
    req.session.successes = [];

    const jobId = req.params.id;
    const {id: freelancerId, lspId} = req.session.user;

    try {
        let margin = 0;
        if (lspId) {
            margin = await lsps.getMargin(lspId);
        }

        margin = 100 - margin;

        const isAvailable =  await jobs.isAvailable(jobId, freelancerId);
        const isTaken = await jobs.isTaken(jobId, freelancerId);

        options.isTaken = isTaken;
        options.isAvailable = isAvailable;

        if (!isAvailable && !isTaken) {
            req.session.errors.push("This job is not taken or available to you.");
            return res.redirect('/');
        }

        options.job = await jobs.getById(jobId);

        const {projectId} = options.job;

        if (options.job.price) {
            options.job.price = Math.floor(options.job.price * margin) / 100;
        }
        const workTypeId = options.job.workTypeId;
        options.instructions = await projectInstructions.getByProjectId(projectId);

        if (!isTaken && options.job.workType === "ARE") {
            const {gender, nationality, yearOfBirth} = await freelancers.getPersonalInfo(freelancerId);
            if (!gender || !nationality || !yearOfBirth) {
                req.session.errors.push("Please fill in gender, nationality & year of birth in my profile -> personal before you can take this job.");
                return res.redirect('/jobs/available');
            }
        }

        const instructions = await workTypes.getInstructions(workTypeId);

        if (instructions.screenshot) {
            options.screenshot = true;
        }
        if (instructions.video) {
            options.video = true;
        }
        if (instructions.preview) {
            options.preview = true;
        }
    }
    catch (e) {
        console.error(e);
        options.errors.push("Failed to get this job.");
    }
    try {
        options.unread = await freelancers_messages.getUnread(freelancerId);
    }
    catch (e) {
        console.error(e);
    }
    res.render('job', options);
};

exports.take = async (req, res) => {
    const jobId = req.params.id;
    const freelancerId = req.session.user.id;
    let {instructions} = req.body;
    try {
        if (!Array.isArray(instructions) && instructions) {
            instructions = [instructions];
        }
        const jobInProgress = await jobs.checkIfInProgress(freelancerId);
        const pushedTo = await jobs.getPushedTo(jobId);
        const isAvailable = await jobs.isAvailable(jobId, freelancerId);
        if (!isAvailable) {
            req.session.errors.push("This job is not available so you cannot take it.");
            return res.redirect('/');
        }

        const job = await jobs.getById(jobId);

        if (!jobInProgress || pushedTo === freelancerId) {
            let progress = {
                done: 0,
                total: 1
            };

            if (job.collective) {
                progress = await workTypeMap[job.workType.toLowerCase()].getProgress(jobId);
            }


            if (progress && progress.done === progress.total && ((job.workType.toUpperCase() !== 'BTE' && job.workType.toUpperCase() !== 'HAW') || !job.trial)) {
                req.session.errors.push('This job is already done, please take another one.');
                return res.redirect('/jobs/available');
            }

            await jobs.acceptJob(freelancerId, jobId);
            if (job.collective) {
                await jobHistory.createOne(jobId, "Collective job (" + freelancerId + ") created");
            }
            else {
                await jobHistory.createOne(jobId, "Job taken by " + freelancerId);
            }

            const prInstructions = await projectInstructions.getByProjectId(job.projectId);
            if (instructions) {
                for (let i = 0; i < instructions.length; i++) {
                    await times.create(job.id, freelancerId, prInstructions[i].workTypeInstructionId, instructions[i]);
                }
            }

            req.session.successes.push("Successfully taken the job. You can now work on it from My jobs > In Progress.");
        }
        else {
            req.session.errors.push("You have job " + jobInProgress  + " in progress. Please deliver that one before you take another job.");
        }

        res.redirect('/jobs/inProgress');
    }
    catch (e) {
        console.error(e);
        req.session.errors.push("Something went wrong with taking the job.");
        res.redirect('/jobs/' + jobId);
    }
};

exports.deliver = async (req, res) => {
    const jobId = req.params.id;
    const {id: freelancerId, firstName, lastName} = req.session.user;

    const {origin} = req.body;

    try {
        const isTaken = await jobs.isTaken(jobId, freelancerId);
        if (!isTaken) {
            req.session.errors.push("This job is not yours so you cannot deliver it.");
            return res.redirect('/');
        }

        const {workType, workTypeId, collective, trial, projectId} = await jobs.getWorkType(jobId);
        const languagePairId = await jobs.getLanguagePairId(jobId);
        const group = await languagePairs.getGroup(languagePairId);

        const prices = await workTypes.getPrices(workTypeId);
        const project = await projects.getOne(projectId);
        prices.unitValue = project.unitValue;

        const pm = await jobs.getPm(jobId);
        const job = await jobs.getById(jobId);

        if (collective) {
            const progress = await workTypeMap[workType.toLowerCase()].getProgress(jobId);
            const individualProgress = await workTypeMap[workType.toLowerCase()].getIndividualProgress(jobId, freelancerId);
            const percentageOfPrice = await jobs.getPercentageOfPrice(jobId);

            if (progress && progress.done === progress.total) {
                let calculatedPrice = 0;
                if (workType === "CTE" || workType === "TTE") {
                    const {trans, eval, bonus} = individualProgress;
                    let transPrice = trans * (prices.unitValue / 100 * 20);
                    let evalPrice = eval * (prices.unitValue / 100 * 30);
                    let bonusPrice = bonus * (prices.unitValue / 100 * 10);

                    if (group === "A") {
                        const groupA = prices.groupA;
                        transPrice *= groupA;
                        evalPrice*= groupA;
                        bonusPrice*= groupA;
                    }
                    else if (group === "B") {
                        const groupB = prices.groupB;
                        transPrice *= groupB;
                        evalPrice*= groupB;
                        bonusPrice*= groupB;
                    }
                    else if (group === "C") {
                        const groupC = prices.groupC;
                        transPrice *= groupC;
                        evalPrice *= groupC;
                        bonusPrice*= groupC;
                    }

                    calculatedPrice = Math.floor((transPrice + evalPrice + bonusPrice) * percentageOfPrice) / 100;
                }
                else if (workType === "CDT"){
                    const {primary, secondary} = individualProgress;
                    let primaryPrice = primary * (prices.unitValue / 100 * 70);
                    let secondaryPrice = secondary * (prices.unitValue / 100 * 30);

                    if (group === "A") {
                        const groupA = prices.groupA;
                        primaryPrice *= groupA;
                        secondaryPrice*= groupA;
                    }
                    else if (group === "B") {
                        const groupB = prices.groupB;
                        primaryPrice *= groupB;
                        secondaryPrice*= groupB;
                    }
                    else if (group === "C") {
                        const groupC = prices.groupC;
                        primaryPrice *= groupC;
                        secondaryPrice *= groupC;
                    }

                    calculatedPrice = Math.floor((primaryPrice + secondaryPrice) * 100) / 100;
                }
                else if (workType === "CCDT") {
                    const {wordCount} = individualProgress;

                    calculatedPrice = wordCount * prices.unitValue;
                    if (group === "A") {
                        const groupA = prices.groupA;
                        calculatedPrice *= groupA;
                    }
                    else if (group === "B") {
                        const groupB = prices.groupB;
                        calculatedPrice *= groupB;
                    }
                    else if (group === "C") {
                        const groupC = prices.groupC;
                        calculatedPrice *= groupC;
                    }
                }
                else {
                    calculatedPrice = individualProgress * prices.unitValue;
                    if (group === "A") {
                        const groupA = prices.groupA;
                        calculatedPrice *= groupA;
                    }
                    else if (group === "B") {
                        const groupB = prices.groupB;
                        calculatedPrice *= groupB;
                    }
                    else if (group === "C") {
                        const groupC = prices.groupC;
                        calculatedPrice *= groupC;
                    }
                }

                await collectiveJobs.deliverJob(jobId, freelancerId, calculatedPrice);

                await jobHistory.createOne(jobId, "Collective job (" + freelancerId + ") delivered");
                //deliver job if all collectiveJobs are delivered
                const colJobs = await collectiveJobs.getAll(jobId);
                for (let i = 0; i < colJobs.length; i++) {
                    if (!colJobs[i].deliveryDate) {
                        req.session.successes.push("Successfully delivered the job.");
                        if (origin) {
                            return res.redirect(origin);
                        }
                        else {
                            return res.redirect('/jobs/available');
                        }
                    }
                }

                if (!trial) {
                    await jobs.deliverJobWithoutFreelancer(jobId);
                    await jobHistory.createOne(jobId, "Job delivered");
                    const freelancerFullNames = (await collectiveJobs.getFreelancers(jobId)).map((value) => {
                        return value.fullName;
                    }).toString();

                    await socketlabs.whenJobIsDelivered(pm.email, pm.firstName, job.name, freelancerFullNames, job.batchName, job.sourceLanguage
                        + " --> " + job.targetLanguage, job.price, job.dueDate);
                }
            }
            else if (workType === "CPA") {
                const dueDate = await jobs.getDueDate(jobId);
                if (new Date(dueDate) <= new Date()) {
                    const {uniqueTerms, sharedTerms} = await workTypeMap["cpa"].getCount(jobId, freelancerId);
                    let calculatedPrice = 0;

                    calculatedPrice += uniqueTerms * prices.unitValue;
                    calculatedPrice += sharedTerms * prices.unitValue * 3;

                    if (group === "A") {
                        const groupA = prices.groupA;
                        calculatedPrice *= groupA;
                    }
                    else if (group === "B") {
                        const groupB = prices.groupB;
                        calculatedPrice *= groupB;
                    }
                    else if (group === "C") {
                        const groupC = prices.groupC;
                        calculatedPrice *= groupC;
                    }

                    await collectiveJobs.deliverJob(jobId, freelancerId, calculatedPrice);
                    await jobHistory.createOne(jobId, "Collective job (" + freelancerId + ") delivered");

                    //deliver job if all collectiveJobs are deliverd
                    const colJobs = await collectiveJobs.getAll(jobId);
                    for (let i = 0; i < colJobs.length; i++) {
                        if (!colJobs[i].deliveryDate) {
                            req.session.successes.push("Successfully delivered the job.");
                            if (origin) {
                                return res.redirect(origin);
                            }
                            else {
                                return res.redirect('/jobs/available');
                            }
                        }
                    }
                    await jobs.deliverJobWithoutFreelancer(jobId);
                    await jobHistory.createOne(jobId, "Job delivered");

                    const freelancerFullNames = (await collectiveJobs.getFreelancers(jobId)).map((value) => {
                        return value.fullName;
                    }).toString();

                    await socketlabs.whenJobIsDelivered(pm.email, pm.firstName, job.name, freelancerFullNames, job.batchName, job.sourceLanguage
                        + " --> " + job.targetLanguage, job.price, job.dueDate);
                }
                else {
                    req.session.errors.push("The due date has not yet been reached.");
                    if (origin) {
                        return res.redirect(origin);
                    }
                    else {
                        return res.redirect('/jobs/inProgress');
                    }
                }
            }
            else {
                req.session.errors.push("Job is not done yet.");
                if (origin) {
                    return res.redirect(origin);
                }
                else {
                    return res.redirect('/jobs/inProgress');
                }
            }
        }
        else {
            let progress;

            if (workType !== "EJL" && workType !== "APB") {
                progress = await workTypeMap[workType.toLowerCase()].getProgress(jobId);
            }
            if (!progress) {
                progress = {
                    done: 0,
                    total: 0
                }
            }
            if (progress.done === progress.total) {
                let calculatedPrice, count;

                if (workType === "BTF") {
                    const individualProgress = await workTypeMap['btf'].getIndividualProgress(jobId, freelancerId);
                    const {quickFix, others} = individualProgress;
                    let quickFixPrice = quickFix * (prices.unitValue / 100 * 60);
                    let othersPrice = others * (prices.unitValue / 100 * 40);

                    calculatedPrice = quickFixPrice + othersPrice;
                }
                else if (workType === "MTE") {
                    await workTypeMap["mte"].removeMalformed(jobId);
                }

                if (workTypeMap[workType.toLowerCase()].hasOwnProperty("getCount")) {
                    count = await workTypeMap[workType.toLowerCase()].getCount(jobId);
                    calculatedPrice = count * prices.unitValue;
                }

                if (calculatedPrice) {
                    if (group === "A") {
                        const groupA = prices.groupA;
                        calculatedPrice *= groupA;
                    } else if (group === "B") {
                        const groupB = prices.groupB;
                        calculatedPrice *= groupB;
                    } else if (group === "C") {
                        const groupC = prices.groupC;
                        calculatedPrice *= groupC;
                    }
                }

                if (calculatedPrice) {
                    await jobs.deliverJobWithPrice(jobId, freelancerId, calculatedPrice);
                }
                else {
                    await jobs.deliverJob(jobId, freelancerId);
                }

                await socketlabs.whenJobIsDelivered(pm.email, pm.firstName, job.name, await freelancers.getFullName(freelancerId), job.batchName, job.sourceLanguage
                    + " --> " + job.targetLanguage, job.price, job.dueDate);
                if (job.jobId) {
                    await jobHistory.createOne(job.jobId, "QC job (" + freelancerId + ") delivered");
                }
                await jobHistory.createOne(jobId, "Job delivered");
            }
            else {
                req.session.errors.push("This job is not done yet.");
                if (origin) {
                    return res.redirect(origin);
                } else {
                    return res.redirect('/jobs/inProgress');
                }
            }
        }

        req.session.successes.push("Successfully delivered the job.");
        if (origin) {
            res.redirect(origin);
        }
        else {
            res.redirect('/jobs/available');
        }
    }
    catch (e) {
        console.log(e);
        req.session.errors.push("Something went wrong with delivering the job.");
        if (origin) {
            res.redirect(origin);
        }
        else {
            res.redirect('/jobs/inProgress');
        }
    }
};

exports.help = async (req, res) => {
    const options = {
        title: "FL - Jobs HELP",
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
