const {connection} = require('../util/database');
const freelancers = require('./freelancers');
const jobs = require('./jobs');

async function getAll(freelancerId, limit) {
    let sql = "SELECT invoices.id, invoices.noteNumber, invoiceType.name AS invoiceType, invoices.vat, invoices.comment, " +
        "invoices.paid, invoices.value, invoices.confirmationOfInvoiceReceipt, invoices.companyOrPersonal,  " +
        "DATE_FORMAT(invoices.stamp, \"%Y-%m-%d\") AS stamp,  DATE_FORMAT(invoices.paymentDate, '%Y-%m-%d %H:%i:%S') AS paymentDate, " +
        "stamp AS orderStamp FROM invoices JOIN invoiceTypes invoiceType ON invoiceType.id = " +
        "invoices.invoiceTypeId WHERE freelancerId = ? ORDER BY orderStamp DESC";

    if (limit !== undefined) {
        sql+= " LIMIT " + limit;
    }
    const [rows] = await connection.promise().query(sql, [freelancerId]);
    return rows;
}

async function getPaid(freelancerId) {
    const sql = "SELECT invoices.id, invoices.noteNumber, invoiceType.name AS invoiceType, invoices.vat, invoices.comment, " +
        "invoices.paid, invoices.value, invoices.confirmationOfInvoiceReceipt, invoices.companyOrPersonal,  " +
        "DATE_FORMAT(invoices.stamp, \"%Y-%m-%d\") AS stamp, DATE_FORMAT(invoices.paymentDate, '%Y-%m-%d %H:%i:%S') AS paymentDate FROM invoices JOIN invoiceTypes invoiceType ON invoiceType.id = " +
        "invoices.invoiceTypeId WHERE freelancerId = ? AND paid = TRUE";

    const [rows] = await connection.promise().query(sql, [freelancerId]);
    return rows;
}

async function getNotPaid(freelancerId) {
    const sql = "SELECT invoices.id, invoices.noteNumber, invoiceType.name AS invoiceType, invoices.vat, invoices.comment, " +
        "invoices.paid, invoices.value, invoices.confirmationOfInvoiceReceipt, invoices.companyOrPersonal,  " +
        "DATE_FORMAT(invoices.stamp, \"%Y-%m-%d\") AS stamp FROM invoices JOIN invoiceTypes invoiceType ON invoiceType.id = " +
        "invoices.invoiceTypeId WHERE freelancerId = ? AND paid = FALSE";

    const [rows] = await connection.promise().query(sql, [freelancerId]);
    return rows;
}

async function getOne(freelancerId, invoiceId) {
    const sql = "SELECT html FROM invoices WHERE freelancerId = ? AND id = ?";
    const [rows] = await connection.promise().query(sql, [freelancerId, invoiceId]);
    if (rows.length < 1) {
        throw new Error("No invoice with freelancerId = " + freelancerId + " and invoiceId = " + invoiceId);
    }
    else {
        return rows[0];
    }
}

async function createOne(invoiceType, noteNumber, vat, paymentMethod, comment, freelancerId, companyOrPersonal, value) {
    const sql = "INSERT INTO invoices (invoiceTypeId, noteNumber, vat, paymentMethodId, comment, freelancerId,companyOrPersonal," +
        "value) VALUES (?, " +
        "?,?,?,?,?,?,?)";

    const currentDate = new Date();

    const [result] = await connection.promise().query(sql, [invoiceType, noteNumber, vat, paymentMethod, comment, freelancerId, companyOrPersonal, value]);
    const invoiceId = result.insertId;
    const confirmationOfIncoiveReceipt = currentDate.getFullYear().toString().slice(2,4) + "." + currentDate.getDay() + Math.round(Math.random() * 1000).toString() + "." + invoiceId;

    const sql2 = "UPDATE invoices SET confirmationOfInvoiceReceipt = ? WHERE id = ?";
    await connection.promise().query(sql2, [confirmationOfIncoiveReceipt, invoiceId]);

    return {
        invoiceId: result.insertId,
        confirmationOfInvoiceReceipt: confirmationOfIncoiveReceipt
    };
}

async function updateHTML(invoiceId, html) {
    const sql = "UPDATE invoices SET html = ? WHERE id = ?";

    const [result] = await connection.promise().query(sql, [html, invoiceId]);
    return result;
}

async function generateHTML (invoiceType, noteNumber, vat, paymentMethod, comment, freelancerId, confirmationOfInvoiceReceipt, companyOrPersonal, jobRows) {
    const rows = await freelancers.getInvoiceInfo(freelancerId);
    if (rows.length < 1)  {
        throw new Error("Failed to get invoice info.");
    }
    else {
        const freelancer = rows[0];
        jobRows = jobRows.sort((a, b) => {
            if (a.deliveryDate < b.deliveryDate) {
                return -1;
            }
            else if (a.deliveryDate > b.deliveryDate) {
                return 1;
            }
            else {
                return 0;
            }
        });

        const currentDate = new Date();
        const year = currentDate.getFullYear();
        let month = currentDate.getMonth() + 1;
        if (month.toString().length < 2) {
            month = "0"  + month;
        }
        let day = currentDate.getDate();
        if (day.toString().length < 2) {
            day = "0" + day;
        }

        let toBePaidDate = new Date(currentDate.setDate(currentDate.getDate() + 15));
        const toBePaidYear = toBePaidDate.getFullYear();
        let toBePaidMonth = toBePaidDate.getMonth() + 1;
        if (toBePaidMonth.toString().length < 2) {
            toBePaidMonth = "0" + toBePaidMonth;
        }
        let toBePaidDay = toBePaidDate.getDate();
        if (toBePaidDay.toString().length < 2) {
            toBePaidDay = "0" + toBePaidDay;
        }
        if (invoiceType === "Note") {
            let html = "<!doctype html><html><head> <meta charset='utf-8'> <style> body{ font-family:'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; text-align:center; color:#777; } body a{ color:#06F; } .invoice-box{ max-width:800px; margin:auto; padding:30px; border:1px solid #eee; box-shadow:0 0 10px rgba(0, 0, 0, .15); font-size:16px; line-height:24px; font-family:'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color:#555; } .invoice-box table{ width:100%; line-height:inherit; text-align:left; } .invoice-box table td{ padding:5px; vertical-align:top; } .invoice-box table tr td:nth-child(4){ text-align:right; } .invoice-box table tr.top table td{ padding-bottom:20px;} .invoice-box table tr.top table td.title{ font-size:45px; line-height:45px; color:#333; } .invoice-box table tr.information table td{ padding-bottom:40px; } .invoice-box table tr.heading td{ background:#eee; border-bottom:1px solid #ddd; font-weight:bold; } .invoice-box table tr.details td{ padding-bottom:20px; } .invoice-box table tr.item td{ border-bottom:1px solid #eee; } .invoice-box table tr.item.last td{ border-bottom:none; } .invoice-box table tr.total td:nth-child(2){ border-top:2px solid #eee; font-weight:bold; } @media only screen and (max-width: 600px) { .invoice-box table tr.top table td{  width:100%;  display:block;  text-align:center; } .invoice-box table tr.information table td{  width:100%;  display:block;  text-align:center; } } </style></head><body>\n" +
                "<div class='invoice-box'>\n" +
                "        <table cellpadding='0' cellspacing='0'>\n" +
                "            <tr class='top'>\n" +
                "                <td colspan='4'>\n" +
                "                    <table>\n" +
                "                        <tr>\n" +
                "                            <td class='title'>\n" +
                "                                <h4>Note</h4>\n" +
                "                            </td>\n" +
                "                <td></td>\n" +
                "                <td></td>\n" +
                "                            <td>\n" +
                "Document Date: " + year + "-" + month + "-" + day + "<br>\n" +
                "                            </td>\n" +
                "                        </tr>\n" +
                "                    </table>\n" +
                "                </td>\n" +
                "            </tr>\n" +
                "            \n" +
                "            <tr class='information'>\n" +
                "                <td colspan='4'>\n" +
                "                    <table>\n" +
                "                        <tr>\n" +
                "                            <td>\n" +
                "                                <u><b>FROM: " + freelancer.email + "</b></u><br>\n" +
                "\t\t\t\t\t\t\t\t" + freelancer.firstName + " " + freelancer.lastName + "<br>\n" +
                "\t\t\t\t\t\t\t\t" + freelancer.street + " " + freelancer.house + "<br>\n" +
                "\t\t\t\t\t\t\t\t" + freelancer.zip + " " + freelancer.city +"<br>\n" +
                "\t\t\t\t\t\t\t\t" + freelancer.state + " " + freelancer.country + "<br>\n" +
                "<br><b>Note " + noteNumber + "</b><br>\n" +
                "                            </td>\n" +
                "                            <td>\n" +
                "                                <u><b>TO: gertva@datamundi.be</b></u><br>\n" +
                "                                DATAMUNDI BVBA<br>\n" +
                "                                VAT: BE 0898.930.474<br>\n" +
                "                                Gert Van Assche <br>\n" +
                "                                Kwadeplasstraat 15, 3350 Linter, Belgium<br>\n" +
                "<br>Confirmation of Invoice Receipt: "  + confirmationOfInvoiceReceipt + "<br>\n" +
                "                            </td>\n" +
                "                        </tr>\n" +
                "                    </table>\n" +
                "                </td>\n" +
                "            </tr>\n" +
                "            \n" +
                "            <tr class='heading'>\n" +
                "                <td colspan=3>" + companyOrPersonal + " Payment</td>\n";

                if (paymentMethod === "Paypal") {
                    html+= "<td>" + paymentMethod + ": " + freelancer.paypal + "</td>";
                }
                else if (paymentMethod === "Bankwire (SEPA & SWIFT)") {
                    html+= "<td>" + paymentMethod + ": " + freelancer.iban  + " (" + freelancer.swiftOrBic  + ") " + freelancer.nameOfAccountHolder + "</td>";
                }
                else if (paymentMethod === "WISE (previously known as TransferWise)") {
                    html += "<td>" + paymentMethod + ": " + freelancer.transferWiseEmail + "</td>";
                }
                else if (paymentMethod === "Xoom") {
                    html += "<td>" + paymentMethod + ": " + freelancer.xoomFirstName  +" " + freelancer.xoomLastName + ", " + freelancer.xoomCountryName + " " + freelancer.xoomState + ", " +
                        freelancer.xoomZip + " " + freelancer.xoomCity + "," + freelancer.xoomStreet + " " + freelancer.xoomHouse + ", " + freelancer.xoomTelephone + ", " + freelancer.email + "</td>";
                }
                else if (paymentMethod === "Husky") {
                    html += "<td>" + paymentMethod + ": " + freelancer.huskyCpfCnpj  +", " + freelancer.huskyFullName + ", " + freelancer.huskyEmail + "</td>";
                }

                html+=  "            </tr>\n" +
                "            \n" +
                "            <tr class='details'>\n" +
                "                <td colspan=3>To be paid by:</td>\n" +
                "                <td>" +  toBePaidYear + "-" + toBePaidMonth + "-" + toBePaidDay + "</td>\n" +
                "            </tr>\n" +
                "            </table><table>\n" +
                "            <tr class='heading'>\n" +
                "                <td>Job reference</td>\n" +
                "                <td>Work Type</td>\n" +
                "                <td>Delivery Date</td>\n" +
                "                <td>Job value (EUR)</td>\n" +
                "            </tr>";

                let totalValue = 0;
                for (let i = 0; i < jobRows.length; i++) {
                    const currentJob = jobRows[i];
                    totalValue+=currentJob.price;

                    html+= "   <tr class='item'>" +
                        "                          <td>" + currentJob.name + "</td>" +
                        "                              <td>" + currentJob.workType +"</td>" +
                        "                             <td>" + currentJob.deliveryDate + "</td>" +
                        "                             <td>" + currentJob.price.toFixed(2) + "</td>" +
                        "                        </tr>";
                }


                html+=
                "            <tr class='heading'>\n" +
                "                <td colspan=3>To be paid (EUR)</td>\n" +
                "                <td>" + totalValue.toFixed(2) + "</td>\n" +
                "            </tr>\n" +
                "        </table>\n" +
                "        <p>Instructions: " +  comment + "</p>\n" +
                "    </div>\n" +
                "    <p><small>Generated by the Datamundi Job Portal for: " + freelancer.firstName + " " + freelancer.lastName + ".</small></p>\n" +
                "</body>\n" +
                "</html>\n";
            return html;
        }
        else if (invoiceType === "Invoice") {
            let html = "<!doctype html><html><head> <meta charset='utf-8'> <style> body{ font-family:'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; text-align:center; color:#777; } body a{ color:#06F; } .invoice-box{ max-width:800px; margin:auto; padding:30px; border:1px solid #eee; box-shadow:0 0 10px rgba(0, 0, 0, .15); font-size:16px; line-height:24px; font-family:'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color:#555; } .invoice-box table{ width:100%; line-height:inherit; text-align:left; } .invoice-box table td{ padding:5px; vertical-align:top; } .invoice-box table tr td:nth-child(4){ text-align:right; } .invoice-box table tr.top table td{ padding-bottom:20px;} .invoice-box table tr.top table td.title{ font-size:45px; line-height:45px; color:#333; } .invoice-box table tr.information table td{ padding-bottom:40px; } .invoice-box table tr.heading td{ background:#eee; border-bottom:1px solid #ddd; font-weight:bold; } .invoice-box table tr.details td{ padding-bottom:20px; } .invoice-box table tr.item td{ border-bottom:1px solid #eee; } .invoice-box table tr.item.last td{ border-bottom:none; } .invoice-box table tr.total td:nth-child(2){ border-top:2px solid #eee; font-weight:bold; } @media only screen and (max-width: 600px) { .invoice-box table tr.top table td{  width:100%;  display:block;  text-align:center; } .invoice-box table tr.information table td{  width:100%;  display:block;  text-align:center; } } </style></head><body>\n" +
                "<div class='invoice-box'>\n" +
                "        <table cellpadding='0' cellspacing='0'>\n" +
                "            <tr class='top'>\n" +
                "                <td colspan='4'>\n" +
                "                    <table>\n" +
                "                        <tr>\n" +
                "                            <td class='title'>\n" +
                "                                <h4>Invoice</h4>\n" +
                "                            </td>\n" +
                "                <td></td>\n" +
                "                <td></td>\n" +
                "                            <td>\n" +
                "Document Date: " + year + "-" + month + "-" + day + "<br>\n" +
                "                            </td>\n" +
                "                        </tr>\n" +
                "                    </table>\n" +
                "                </td>\n" +
                "            </tr>\n" +
                "            \n" +
                "            <tr class='information'>\n" +
                "                <td colspan='4'>\n" +
                "                    <table>\n" +
                "                        <tr>\n" +
                "                            <td>\n" +
                "                                <u><b>FROM: " + freelancer.email +  "</b></u><br>\n" +
                freelancer.companyName + "<br>\n" +
                "VAT: " +  freelancer.vat +"<br>\n" +
                freelancer.firstName + " " + freelancer.lastName + "<br>\n" +
                freelancer.street + " " + freelancer.house + ", " + freelancer.zip + " " + freelancer.city + ", " + freelancer.state + " " + freelancer.country + "<br>\n" +
                "<br><b>Invoice " + noteNumber + "</b><br>\n" +
                "                            </td>\n" +
                "                            <td>\n" +
                "                                <u><b>TO: gertva@datamundi.be</b></u><br>\n" +
                "                                DATAMUNDI BVBA<br>\n" +
                "                                VAT: BE 0898.930.474<br>\n" +
                "                                Gert Van Assche <br>\n" +
                "                                Kwadeplasstraat 15, 3350 Linter, Belgium<br>\n" +
                "<br>Confirmation of Invoice Receipt: "  + confirmationOfInvoiceReceipt + "<br>\n" +
                "                            </td>\n" +
                "                        </tr>\n" +
                "                    </table>\n" +
                "                </td>\n" +
                "            </tr>\n" +
                "            \n" +
                "            <tr class='heading'>\n" +
                "                <td colspan=3>" + companyOrPersonal + " Payment</td>\n";

                if (paymentMethod === "Paypal") {
                    html+= "<td>" + paymentMethod + ": " + freelancer.paypal + "</td>";
                }
                else if (paymentMethod === "Bankwire (SEPA & SWIFT)") {
                    html+= "<td>" + paymentMethod + ": " + freelancer.iban  + " (" + freelancer.swiftOrBic + ") " + freelancer.nameOfAccountHolder + "</td>";
                }
                else if (paymentMethod === "WISE (previously known as TransferWise)") {
                    html += "<td>" + paymentMethod + ": " + freelancer.transferWiseEmail + "</td>";
                }
                else if (paymentMethod === "Xoom") {
                    html += "<td>" + paymentMethod + ": " + freelancer.xoomFirstName  +" " + freelancer.xoomLastName + ", " + freelancer.xoomCountryName + " " + freelancer.xoomState + ", " +
                        freelancer.xoomZip + " " + freelancer.xoomCity + "," + freelancer.xoomStreet + " " + freelancer.xoomHouse + ", " + freelancer.xoomTelephone + ", " + freelancer.email + "</td>";
                }
                else if (paymentMethod === "Husky") {
                    html += "<td>" + paymentMethod + ": " + freelancer.huskyCpfCnpj  +", " + freelancer.huskyFullName + ", " + freelancer.huskyEmail + "</td>";
                }
                html+=                "            </tr>\n" +
                "            \n" +
                "            <tr class='details'>\n" +
                "                <td colspan=3>To be paid by:</td>\n" +
                "                <td>" + toBePaidYear + "-" + toBePaidMonth + "-" + toBePaidDay + "</td>\n" +
                "            </tr>\n" +
                "            </table><table>\n" +
                "            <tr class='heading'>\n" +
                "                <td>Job reference</td>\n" +
                "                <td>Work Type</td>\n" +
                "                <td>Delivery Date</td>\n" +
                "                <td>Job value (EUR)</td>\n" +
                "            </tr>\n";
                let totalValue = 0;
                for (let i = 0; i < jobRows.length; i++) {
                    const currentJob = jobRows[i];
                    totalValue+=currentJob.price;

                    html+= "   <tr class='item'>" +
                        "                          <td>" + currentJob.name + "</td>" +
                        "                              <td>" + currentJob.workType +"</td>" +
                        "                             <td>" + currentJob.deliveryDate + "</td>" +
                        "                             <td>" + currentJob.price.toFixed(2) + "</td>" +
                        "                        </tr>";
                }

                let vatValue = totalValue / 100 * vat;

                html+=
                    "   <tr class='item'>\n" +
                    "                <td></td>\n" +
                    "                <td></td>\n" +
                    "                <td></td>\n" +
                    "                <td>Total: " + totalValue.toFixed(2) + "</td>\n" +
                    "            </tr>" +
                "            <tr class='details'>\n" +
                "                <td>VAT Rate: " + vat + "%</td>\n" +
                "                <td></td>\n" +
                "                <td></td>\n" +
                "                <td>" + vatValue.toFixed(2) + "</td>\n" +
                "            </tr>\n" +
                "            <tr class='heading'>\n" +
                "                <td colspan=3>To be paid (EUR)</td>\n" +
                "                <td>" + (totalValue + vatValue).toFixed(2) +  "</td>\n" +
                "            </tr>\n" +
                "        </table>\n" +
                    "        <p>Instructions: " +  comment + "</p>\n" +
                    "    </div>\n" +
                "    <p><small>Generated by the Datamundi Job Portal for: " + freelancer.firstName + " " + freelancer.lastName + ". </small></p>\n" +
                "</body>\n" +
                "</html>\n";
            return html;

        }
        else {
            throw new Error("No invoice type.");
        }
    }

}

async function getLastInvoice(freelancerId) {
    const sql = "SELECT stamp FROM invoices  WHERE freelancerId = ? ORDER BY stamp DESC";

    const [rows] = await connection.promise().query(sql, [freelancerId]);
    return rows;
}

async function getOverview(freelancerId) {
    const sql = "SELECT year, TRUNCATE(SUM(vat), 2) AS vat, TRUNCATE(SUM(value), 2) AS value FROM (\n" +
        "     (SELECT DATE_FORMAT(stamp, '%Y') year,  SUM(value) value, SUM(vat) vat FROM invoices WHERE freelancerId = ? GROUP  BY year)\n" +
        "    UNION\n" +
        "    (SELECT DATE_FORMAT(stamp, '%Y') year,  SUM(toBePaid) value, SUM(vatValue) vat FROM jobSelectorInvoices WHERE freelancerId = ? GROUP  BY year) )  AS invoices GROUP BY year ORDER BY year";

    const [rows] = await connection.promise().query(sql, [freelancerId, freelancerId]);
    return rows;
}

exports.getOverview = getOverview;
exports.getLastInvoice = getLastInvoice;
exports.createOne = createOne;
exports.getAll = getAll;
exports.generateHTML = generateHTML;
exports.updateHTML = updateHTML;
exports.getPaid = getPaid;
exports.getNotPaid = getNotPaid;
exports.getOne = getOne;
