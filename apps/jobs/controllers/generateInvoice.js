const jobs = require('../../../models/jobs');
const freelancers = require('../../../models/freelancers');
const paymentMethods = require('../../../models/paymentMethods');
const invoiceTypes = require('../../../models/invoiceTypes');
const invoices = require('../../../models/invoices');
const collectiveJobs = require('../../../models/collectiveJobs');
const freelancers_messages = require('../../../models/freelancers_messages');
const socketlabs = require('../../../util/socketlabs');
const batches = require('../../../models/batches');

exports.get = async (req, res) => {
    let options = {
        title: "FL - Generate an invoice",
        errors: req.session.errors, warnings: req.session.warnings,
        successes: req.session.successes,
        firstName: req.session.user.firstName,
        lastName: req.session.user.lastName
    };

    req.session.errors = []; req.session.warnings = [];
    req.session.successes = [];

    const {id: freelancerId, email, clockifyId} = req.session.user;

    try {
        let rows = await jobs.getDelivered(freelancerId);

        for (let i = 0; i < rows.length; i++) {
            if (rows[i].collective) {
                rows[i].price = rows[i].collectivePrice;
                rows[i].deliveryDate = rows[i].collectiveDeliveryDate;
            }
        }

        const compareDate = new Date();
        req.session.compareDate = compareDate;

        console.log("GET:", compareDate);

        rows = rows.filter((value) => {
            let deliveryDate = new Date(value.deliveryDate);
            deliveryDate.setDate(deliveryDate.getDate() + 7);

            return deliveryDate <= compareDate || clockifyId;
        });

        let totalValue = 0;
        for (let i = 0; i < rows.length; i++) {
            totalValue+=rows[i].price;
        }

        if (rows.length < 1) {
            return res.redirect('/jobs/delivered');
        }
        options.jobs = rows;
        options.totalValue = Math.floor(totalValue * 100)/100;
    }
    catch (e) {
        console.log(e);
        options.errors.push("Failed to get your delivered jobs.");
    }

    try {
        console.log("Get payment info");
        options.paymentInfo = await freelancers.getPaymentInfo(freelancerId);
        if (!options.paymentInfo.companyPersonal) {
            options.warnings.push("Your payment information is not complete yet, be aware you can't make invoices or notes. " +
                "You can complete it under My profile -- Payment.");
        }
    }
    catch (e) {
        console.log(e);
        options.errors.push("Failed to get your payment info.");
    }

    try {
        console.log("get payment methods");
        options.paymentMethods = await paymentMethods.getAll();
        if (await freelancers.getCountry(freelancerId) !== "BRAZIL") {
            options.paymentMethods = options.paymentMethods.filter(value => value.name !== "Husky");
        }
    }
    catch (e) {
        console.error(e);
        options.errors.push("Failed to get payment methods.");
    }

    try {
        console.log("Get invoice types");
        options.invoiceTypes = await invoiceTypes.getAll();
    }
    catch (e) {
        console.error(e);
        options.errors.push("Failed to get invoice types.");
    }
    try {
        options.unread = await freelancers_messages.getUnread(freelancerId);
    }
    catch (e) {
        console.error(e);
    }
    res.render('generateInvoice', options);
};

exports.post = async (req, res) => {
    const {invoiceType, noteNumber, vat, paymentMethod, comment, companyOrPersonal} = req.body;

    if (!invoiceType || !noteNumber || !vat || !paymentMethod || !companyOrPersonal) {
        req.session.errors.push("Please provide all the required information.");
        res.redirect('/jobs/generateInvoice');
    }
    else {
        const {id: freelancerId, firstName, lastName, clockifyId} = req.session.user;
        const fullName = firstName + " " + lastName;

        let bonusJobId = null;
        let botJobs = [];

        try {
            const invoiceTypeRows = await invoiceTypes.getOne(invoiceType);
            if (invoiceTypeRows.length < 1) {
                throw new Error("No invoice type with id " + invoiceType);
            }

            const invoiceTypeName = invoiceTypeRows[0].name;
            const paymentMethodName = await paymentMethods.getName(paymentMethod);

            let deliveredJobs = await jobs.getDelivered(freelancerId);

            for (let i = 0; i < deliveredJobs.length; i++) {
                if (deliveredJobs[i].collective) {
                    deliveredJobs[i].price = deliveredJobs[i].collectivePrice;
                    deliveredJobs[i].deliveryDate = deliveredJobs[i].collectiveDeliveryDate;
                }
            }

            const compareDate = new Date(req.session.compareDate);

            console.log("POST:", compareDate);

            deliveredJobs = deliveredJobs.filter((value) => {
                let deliveryDate = new Date(value.deliveryDate);
                deliveryDate.setDate(deliveryDate.getDate() + 7);
                return deliveryDate <= compareDate || clockifyId;
            });

            let value = 0;
            for (let i = 0; i < deliveredJobs.length; i++) {
                const currentPrice = deliveredJobs[i].price;
                value+=currentPrice;
            }

            const leadLinguist = await freelancers.getLeadLinguist(freelancerId);

            if (leadLinguist) {
                const batch = await batches.getByName("Lead Bonuses");

                for (let i = 0; i < deliveredJobs.length; i++) {
                    const {insertId: botJobId} = await jobs.createBotJob(freelancerId, Math.floor(deliveredJobs[i].price / 100 * 15 * 100) / 100, batch.id, deliveredJobs[i].customerTaskId);
                    const jobName = batch.id + "-BOT-" + botJobId;
                    await jobs.changeName(botJobId, jobName);

                    botJobs.push({
                        id: botJobId,
                        collective: false,
                        price: Math.floor(deliveredJobs[i].price / 100 * 15 * 100) / 100,
                        name: jobName,
                        workType: "BOT",
                        deliveryDate: await jobs.getDeliveryDate(botJobId)
                    });

                    value += Math.floor(deliveredJobs[i].price / 100 * 15 * 100) / 100;
                }
                deliveredJobs = [...deliveredJobs, ...botJobs];
            }

            let vatValue = value / 100 * vat;
            vatValue = Math.floor(vatValue * 100) / 100;

            value+=vatValue;

            value = Math.floor(value * 100) / 100;

            const result = await invoices.createOne(invoiceType, noteNumber, vatValue, paymentMethod, comment, freelancerId, companyOrPersonal, value);
            const {invoiceId, confirmationOfInvoiceReceipt} = result;

            const html = await invoices.generateHTML(invoiceTypeName, noteNumber, vat, paymentMethodName, comment, freelancerId, confirmationOfInvoiceReceipt, companyOrPersonal, deliveredJobs);
            await invoices.updateHTML(invoiceId, html);

            for (let i = 0; i < deliveredJobs.length; i++) {
                const currentJob = deliveredJobs[i];
                if (currentJob.collective) {
                    await collectiveJobs.setInvoiceId(currentJob.id, freelancerId, invoiceId);
                }
                else {
                    await jobs.setInvoiceId(currentJob.id, invoiceId);
                }
            }

            socketlabs.afterInvoiceGeneration(fullName, value);

            req.session.successes.push("Successfully generated your invoice.");
            if (leadLinguist) {
                req.session.successes.push("Thank you for your work for Datamundi. A 15% bonus of the invoice value will be added because you are marked as a Lead Linguist in our database.");
            }
            res.redirect('/invoices/notPaid');
        }
        catch (e) {
            console.log(e);
            for (let i = 0; i < botJobs.length; i++) {
                await jobs.deleteOne(botJobs[i].id);
            }

            req.session.errors.push("Failed to generate your invoice.");
            res.redirect('/jobs/generateInvoice');
        }
    }
};
