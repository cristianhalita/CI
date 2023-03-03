const { SocketLabsClient } = require('@socketlabs/email');

const serverId = 31233;
const injectionApiKey = "Jp5d4DMa82StAs37Tzn9";

const client = new SocketLabsClient(serverId, injectionApiKey);

const pms = require('../models/pms');

function getDate() {
    const date = new Date();

    let day = date.getDate().toString();
    if (day.length === 1) {
        day = "0" + day;
    }
    let month = date.getMonth() + 1;
    month = month.toString();
    if (month.length === 1) {
        month = "0" + month;
    }
    let year = date.getFullYear().toString();

    let hours = date.getHours().toString();
    if (hours.length === 1 ) {
        hours = "0" + hours;
    }

    let minutes = date.getMinutes().toString();
    if (minutes.length === 1) {
        minutes = "0" + minutes;
    }

    let seconds = date.getSeconds().toString();
    if (seconds.length === 1) {
        seconds = "0" + seconds;
    }

    return day + "-" + month + "-" + year + " " + hours + ":" + minutes + ":" + seconds;
}

async function whenFreelancerGetsBlocked(email, fullName) {
    let message = {
        to: [

        ],
        from: "no-reply@datamundi.space",
        subject: fullName + " got blocked / " + getDate(),
        apiTemplate: 17,
        messageType: "bulk"
    };

    try {
        const pmEmails = (await pms.getAll()).map(value => {
            return value.email;
        });

        for (let i = 0; i < pmEmails.length; i++) {
            message.to.push({
                emailAddress: pmEmails[i],
                mergeData: [
                    {key: "fullName", value: fullName},
                    {key: "email", value: email}
                ]
            })
        }

        await client.send(message);
    }
    catch (e) {
        console.error(e);
    }
}

async function temporaryPassword(email, fullName, temporaryPassword) {
    let message = {
        to: [
            {
                emailAddress: email,
                mergeData: [
                    {key: "fullName", value: fullName},
                    {key: "temporaryPassword", value: temporaryPassword},
                    {key: "loginLink", value: "https://freelancer.datamundi.space/login"}
                ]
            }
        ],
        from: "no-reply@datamundi.space",
        subject: "Verification code / " + getDate(),
        apiTemplate: 16,
        messageType: "bulk"
    };

    try {
        await client.send(message);
    }
    catch (e) {
        console.error(e);
    }
}

async function afterRegistration(email, fullName, temporaryPassword) {
    let message = {
        to: [
            {
                emailAddress: email,
                mergeData: [
                    {key: "fullName", value: fullName},
                    {key: "temporaryPassword", value: temporaryPassword},
                    {key: "loginLink", value: "https://freelancer.datamundi.space/login"}
                ]
            }
        ],
        from: "no-reply@datamundi.space",
        subject: "Welcome to the Datamundi job portal / " + getDate(),
        apiTemplate: 41,
        messageType: "bulk"
    };

    try {
        await client.send(message);
    }
    catch (e) {
        console.error(e);
    }
}

async function forgotPin(email, firstName, pin) {
    let message = {
        to: [
            {
                emailAddress: email,
                mergeData: [
                    {key: "firstName", value: firstName},
                    {key: "pin", value: pin}
                ]
            }
        ],
        from: "no-reply@datamundi.space",
        subject: "Datamundi PIN code / " + getDate(),
        apiTemplate: 7,
        messageType: "bulk"
    };

    try {
        await client.send(message);
    }
    catch (e) {
        console.error(e);
    }
}

async function resetPassword(email, firstName, token, ip, userAgent) {
    let link = "http://localhost:3000";

    if (process.env.NODE_ENV == "eu") {
        link = "https://freelancer.datamundi.eu";
    }
    else if (process.env.NODE_ENV == "production") {
        link = "https://freelancer.datamundi.space";
    }

    link += "/resetPassword?token=" + token;

    let message = {
        to: [
            {
                emailAddress: email,
                mergeData: [
                    {key: "firstName", value: firstName},
                    {key: "ip", value: ip},
                    {key: "userAgent", value: userAgent},
                    {key: "link", value: link}
                ]
            }
        ],
        from: "no-reply@datamundi.space",
        subject: "Datamundi Reset Password / " + getDate(),
        apiTemplate: 40,
        messageType: "bulk"
    };

    try {
        await client.send(message);
    }
    catch (e) {
        console.error(e);
    }
}

async function deadLineReminder(array) {
    let to = [];

    for (let i = 0; i < array.length; i++) {
        let newReceiver = {
            emailAddress: array[i].email,
            mergeData: [
                {key: "firstName", value: array[i].firstName},
                {key: "dueDate", value: array[i].dueDate},
                {key: "jobName", value: array[i].name},
                {key: "pmEmail", value: array[i].pmEmail}
            ]
        };
        to.push(newReceiver);
    }

    let message = {
        to: to,
        from: "no-reply@datamundi.space",
        subject: "Datamundi job - deadline reminder / " + getDate(), // TODO change subject
        apiTemplate: 6,
        messageType: "bulk"
    };

    try {
        console.log(await client.send(message));
    }
    catch (e) {
        console.error(e);
    }
}

async function afterInvoiceGeneration(fullName, value) {
    let message = {
        to: [
            {
                emailAddress: "gert@datamundi.space",
                mergeData: [
                    {key: "fullName", value: fullName},
                    {key: "value", value: value}
                ]
            }
        ],
        from: "no-reply@datamundi.space",
        subject: "FL generated an invoice / " + getDate(),
        apiTemplate: 10,
        messageType: "bulk"
    };

    try {
        await client.send(message);
    }
    catch (e) {
        console.error(e);
    }
}

async function whenJobIsDelivered(pmEmail, pmFirstName, jobName, freelancers, batchName, languagePair, jobPrice, jobDueDate) {
    let message = {
        to: [
            {
                emailAddress: pmEmail,
                mergeData: [
                    {key: "firstName", value: pmFirstName},
                    {key: "jobName", value: jobName},
                    {key: "freelancers", value: freelancers},
                    {key: "batchName", value: batchName},
                    {key: "languagePair", value: languagePair},
                    {key: "price", value: jobPrice},
                    {key: "dueDate", value: jobDueDate}
                ]
            }
        ],
        from: "no-reply@datamundi.space",
        subject: jobName + " has been delivered / " + getDate(),
        apiTemplate: 14,
        messageType: "bulk"
    };

    try {
        await client.send(message);
    }
    catch (e) {
        console.error(e);
    }
}

async function whenHaaDisGetsCreated(pmEmail, pmFirstName, jobName, job1, job2, freelancer1, freelancer2, rowLength) {
    let message = {
        to: [
            {
                emailAddress: pmEmail,
                mergeData: [
                    {key: "firstName", value: pmFirstName},
                    {key: "jobName", value: jobName},
                    {key: "job1", value: job1},
                    {key: "job2", value: job2},
                    {key: "freelancer1", value: freelancer1},
                    {key: "freelancer2", value: freelancer2},
                    {key: "rowLength", value: rowLength}
                ]
            }
        ],
        from: "no-reply@datamundi.space",
        subject: "HAA disagreement job created / " + getDate(),
        apiTemplate: 22,
        messageType: "bulk"
    };

    try {
        await client.send(message);
    }
    catch (e) {
        console.error(e);
    }
}

async function whenFlChangesPersonalInfo(freelancerFullName, info) {
    let message = {
        to: [
            {
                emailAddress: "alexandra@datamundi.space",
                mergeData: [
                    {key: "pmFirstName", value: "Alexandra"},
                    {key: "freelancerFullName", value: freelancerFullName},
                    {key: "info", value: info}
                ]
            }
        ],
        from: "no-reply@datamundi.space",
        subject: "Freelancer changed personal info / " + getDate(),
        apiTemplate: 39,
        messageType: "bulk"
    };

    try {
        await client.send(message);
    }
    catch (e) {
        console.error(e);
    }
}

exports.whenFlChangesPersonalInfo = whenFlChangesPersonalInfo;
exports.whenJobIsDelivered = whenJobIsDelivered;
exports.afterInvoiceGeneration = afterInvoiceGeneration;
exports.afterRegistration = afterRegistration;
exports.forgotPin = forgotPin;
exports.deadLineReminder = deadLineReminder;
exports.temporaryPassword = temporaryPassword;
exports.whenFreelancerGetsBlocked = whenFreelancerGetsBlocked;
exports.whenHaaDisGetsCreated = whenHaaDisGetsCreated;
exports.resetPassword = resetPassword;

exports.client = client;
