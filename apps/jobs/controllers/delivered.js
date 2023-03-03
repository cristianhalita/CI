const jobs = require('../../../models/jobs');
const collectiveJobs = require('../../../models/collectiveJobs');
const invoices = require('../../../models/invoices');
const freelancers_messages = require('../../../models/freelancers_messages');
const lsps = require('../../../models/lsps');

exports.get = async (req, res) => {
    let options = {
        title: "FL - Delivered",
        errors: req.session.errors,
        warnings: req.session.warnings,
        successes: req.session.successes,
        firstName: req.session.user.firstName,
        lastName: req.session.user.lastName,
        canGenerateInvoice: false,
        freelancer: req.session.user
    };

    req.session.errors = [];
    req.session.warnings = [];
    req.session.successes = [];

    const {id: freelancerId, lspId, clockifyId} = req.session.user;

    try {
        let margin = 0;
        if (lspId) {
            margin = await lsps.getMargin(lspId);
        }

        margin = 100 - margin;

        let jobRows = await jobs.getDelivered(freelancerId);
        console.log(jobRows);
        let totalPrice = 0;
        for (let i = 0; i < jobRows.length; i++) {
            if (jobRows[i].collective) {
                jobRows[i].price = jobRows[i].collectivePrice;
                jobRows[i].deliveryDate = jobRows[i].collectiveDeliveryDate;
                jobRows[i].subcontractorPaymentDate = jobRows[i].collectiveSubcontractorPaymentDate;
            }

            jobRows[i].price = Math.floor(jobRows[i].price  * margin) / 100;

            let deliveryDate = new Date(jobRows[i].deliveryDate);
            deliveryDate.setDate(deliveryDate.getDate() + 7);

            if (deliveryDate <= new Date() || clockifyId) {
                jobRows[i].invoicable = true;
                totalPrice+=jobRows[i].price;
            }
            else {
                jobRows[i].invoicable = false;
            }
        }

        if (jobRows.filter(value => value.invoicable).length > 0 && !lspId) {
            const lastInvoice = await invoices.getLastInvoice(freelancerId);
            if (lastInvoice.length < 1) {
                if (totalPrice >= 30) {
                    options.canGenerateInvoice = true;
                }
                else {
                    options.warnings.push("Your total job value needs to be higher than 30 euro in order to generate an invoice.");
                }
            }
            else {
                const lastInvoiceDate = new Date(lastInvoice[0].stamp);

                console.log((new Date() - lastInvoiceDate) / (1000*60*60*24), totalPrice);
                if (((new Date() - lastInvoiceDate) / (1000*60*60*24)) < 31 && totalPrice < 500) {
                    options.warnings.push("You can only generate an invoice when your last invoice was paid a month ago OR when you have done jobs for more than 500 Euro.");
                }
                else {
                    options.canGenerateInvoice = true;
                }
            }
        }

        if (totalPrice < 500 && !lspId) {
            options.showPopUp = true;
        }
        options.jobs = jobRows;
    }
    catch (e) {
        console.log(e);
        options.errors.push("Failed to get delivered jobs.");
    }
    try {
        options.unread = await freelancers_messages.getUnread(freelancerId);
    }
    catch (e) {
        console.log(e);
    }
    res.render('delivered', options);

};

