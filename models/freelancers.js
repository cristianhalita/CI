const {connection} = require('../util/database');
const freelancers_domainsOfExpertise = require('./freelancers_domainsOfExpertise');
const socketlabs = require('../util/socketlabs');
const {hashPassword} = require("../util/functions");

async function createOne({firstName, lastName, email, motherTongue, countryOfResidence, languagePair1, languagePair2, languagePair3,
                       languagePair4, question1, question2, onlineProfile, password, origin, specify, sex, yearOfBirth}) {
    if (!languagePair2){
        languagePair2 = null;
    }
    if (!languagePair3){
        languagePair3 = null;
    }
    if (!languagePair4){
        languagePair4 = null;
    }
    if (!sex) {
        sex = null;
    }
    if (!yearOfBirth) {
        yearOfBirth = null;
    }

    password = await hashPassword(password);

    const sql = "INSERT INTO freelancers (firstName, lastName, email, motherTongue, countryOfResidence, lPair1, lPair2," +
        " lPair3, lPair4, answer1, answer2, onlineProfile, password, originId, specify, sex, yearOfBirth) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

    const [result] = await connection.promise().query(sql, [firstName, lastName, email, motherTongue, countryOfResidence,
        languagePair1, languagePair2, languagePair3, languagePair4, question1, question2, onlineProfile,  password, origin, specify, sex, yearOfBirth]);

    return result;
}

async function getPaypal(freelancerId) {
    const sql = "SELECT paypal FROM freelancers WHERE id = ?";

    const [rows] = await connection.promise().query(sql, [freelancerId]);
    if (rows.length < 1) {
        throw new Error("Failed to get paypal for freelancer " + freelancerId);
    }
    else {
        return rows[0].paypal;
    }
}

async function getSwiftOrBic(freelancerId) {
    const sql = "SELECT swiftOrBic FROM freelancers WHERE id = ?";

    const [rows] = await connection.promise().query(sql, [freelancerId]);
    if (rows.length < 1) {
        throw new Error("Failed to get swift or bic for freelancer " + freelancerId );
    }
    else {
        return rows[0].swiftOrBic;
    }
}
async function getInvoiceInfo(freelancerId) {
    const sql = "SELECT freelancers.email, freelancers.paypal, freelancers.iban, freelancers.house, freelancers.swiftOrBic, " +
        "freelancers.state, freelancers.street, freelancers.firstName, freelancers.lastName, freelancers.zip, freelancers.city" +
        ", country.name AS country, freelancers.companyName, freelancers.nameOfAccountHolder, freelancers.vat, " +
        "freelancers.transferWiseEmail, freelancers.xoomFirstName, freelancers.xoomLastName, " +
        "freelancers.xoomState, freelancers.xoomZip, freelancers.xoomCity, freelancers.xoomStreet, " +
        "freelancers.xoomHouse, freelancers.xoomTelephone, c.name AS xoomCountryName, freelancers.huskyCpfCnpj, " +
        "freelancers.huskyFullName, freelancers.huskyEmail FROM freelancers JOIN " +
        "countries country ON country.id = freelancers.countryOfResidence LEFT JOIN countries c ON c.id = freelancers.xoomCountry " +
        "WHERE freelancers.id = ?";
    const [rows] = await connection.promise().query(sql, [freelancerId]);
    return rows;
}

async function checkPassword(email, password, verificationCode, temporaryPassword) {
    let sql;

    let params = [email];

    if (temporaryPassword){
        sql = "SELECT freelancers.*, lsp.companyName AS lspCompanyName FROM freelancers LEFT JOIN lsps lsp ON lsp.id = " +
            "freelancers.lspId WHERE freelancers.email = ? AND freelancers.temporaryPassword = ? AND freelancers.deleted = 0";
        params.push(verificationCode);
    }
    else {
        sql = "SELECT freelancers.*, lsp.companyName AS lspCompanyName FROM freelancers LEFT JOIN lsps lsp ON lsp.id = " +
            "freelancers.lspId WHERE freelancers.email = ? AND freelancers.password = ? AND freelancers.deleted = 0";
        params.push(password);
    }

    return new Promise(((resolve, reject) => {
        connection.promise().query(sql, params).then(([rows]) => {
            if (rows.length > 0){
                resolve(rows[0]);
            }
            else{
                reject();
            }
        }).catch(error => {
            reject(error);
        });
    }));
}

async function clearTemporaryPassword(freelancerId) {
    const sql = "UPDATE freelancers SET temporaryPassword = NULL WHERE id = ?";
    const [result] = await connection.promise().query(sql, [freelancerId]);
    return result;
}

async function setTemporaryPassword(freelancerId, temporaryPassword) {
    const sql = "UPDATE freelancers SET temporaryPassword = ? WHERE id = ?";
    const [result] = await connection.promise().query(sql, [temporaryPassword, freelancerId]);
    return result;
}

async function getTemporaryPassword(email) {
    const sql = "SELECT temporaryPassword FROM freelancers WHERE email = ? AND temporaryPassword IS NOT NULL";
    const [rows] = await connection.promise().query(sql, [email]);
    return rows;
}

async function getLeadLinguist(freelancerId) {
    const sql = "SELECT leadLinguist FROM freelancers WHERE id = ?";
    const [rows] = await connection.promise().query(sql, [freelancerId]);
    return rows[0].leadLinguist;
}

async function getBlocked(email) {
    const sql = "SELECT blocked, loginAttempts FROM freelancers WHERE email = ?";
    const [rows] = await connection.promise().query(sql, [email]);
    return rows;
}

async function clearLoginAttempts(freelancerId) {
    const sql = "UPDATE freelancers SET loginAttempts = 0 WHERE id = ?";
    const [result] = await connection.promise().query(sql, [freelancerId]);
    return result;
}

async function updateLoginAttempts(email) {
    const sql = "UPDATE freelancers SET loginAttempts = loginAttempts + 1 WHERE email = ? AND deleted = 0";
    const [result] = await connection.promise().query(sql, [email]);
    return result;
}

async function forgotPin(email){
    const sql = "SELECT pin, firstName FROM freelancers WHERE email = ? AND deleted = 0";
    const [rows] = await connection.promise().query(sql, [email]);

    if (rows.length > 0) {
        await socketlabs.forgotPin(email, rows[0].firstName, rows[0].pin);
    }
    else {
        throw new Error("No FL with email = " + email);
    }
}

function completeProfile ({state, city, street, zip, house, phone, skype, preferredPaymentMethod, paypal,
                          nameOfAccountHolder, nameOfBank, swiftOrBic, iban, companyPersonal, vat, companyName }, email) {
    let sql = "UPDATE freelancers SET state = ?, city = ?, street = ?, zip = ?, house = ?, phone = ?, skype = ?, " +
        "preferredPaymentMethod = ?, paypal = ?, nameOfAccountHolder = ?, nameOfBank = ?, swiftOrBic = ?, iban = ?, " +
        "completedProfile = 1, companyPersonal = ?, vat = ?, companyName = ? WHERE email = ?";

    let params = [state, city, street, zip, house, phone, skype, preferredPaymentMethod, paypal, nameOfAccountHolder, nameOfBank, swiftOrBic, iban,
        companyPersonal, vat, companyName, email];

    return connection.promise().query(sql, params);
}

async function getFullName(freelancerId) {
    const sql = "SELECT CONCAT(firstName, \" \", lastName) AS fullName FROM freelancers WHERE id = ?";

    const [rows] = await connection.promise().query(sql, [freelancerId]);
    if (rows.length < 1) {
        throw new Error("No freelancer with is " + freelancerId);
    }
    else {
        return rows[0].fullName;
    }
}

async function getFullNameWithEmail(email) {
    const sql = "SELECT CONCAT(firstName, \" \", lastName) AS fullName FROM freelancers WHERE email = ?";

    const [rows] = await connection.promise().query(sql, [email]);
    if (rows.length < 1) {
        throw new Error("No freelancer with is " + email);
    }
    else {
        return rows[0].fullName;
    }
}

async function getPersonalInfo(freelancerId) {
    const sql = "SELECT freelancers.countryOfResidence, freelancers.yearOfBirth, " +
        "freelancers.sex, freelancers.nationality, freelancers.skype, freelancers.motherTongue, freelancers.firstName, freelancers.city, freelancers.lastName, freelancers.state, " +
        "freelancers.street, freelancers.zip, freelancers.house, freelancers.email,\n" +
        "       freelancers.phone from freelancers where freelancers.id = ?";

    const [rows] = await connection.promise().query(sql, [freelancerId]);
    if (rows.length < 1) {
        throw new Error("Couldn't get personal info from freelancer with id " + freelancerId);
    }
    else {
        return rows[0];
    }
}

async function getProfessionalInfo(email) {
    const sql = "SELECT timeZoneId, workTimeId, freelanceTypeId, onlineProfile, computerTypeId, lPair1, lPair2, lPair3, lPair4, otherDescription" +
        " FROM freelancers WHERE email = ?";

        const [rows] = await connection.promise().query(sql, [email]);
        if (rows.length < 1) {
            throw new Error("Couldn't get professional info from freelancer with email " + email);
        }
        else {
            return rows[0];
        }
}

async function getPaymentInfo(freelancerId) {
    const sql = "SELECT preferredPaymentMethod, paypal, iban, nameOfAccountHolder, nameOfBank, swiftOrBic, companyPersonal, " +
        "vat, companyName, transferWiseEmail, xoomCountry, xoomState, xoomZip, xoomCity, xoomStreet, xoomHouse, xoomTelephone" +
        ", xoomFirstName, xoomLastName, c.name AS xoomCountryName, xoomCountry, huskyCpfCnpj, huskyFullName, huskyEmail" +
        " FROM freelancers LEFT JOIN countries c ON c.id = " +
        "xoomCountry WHERE freelancers.id = ?";

    try {
        const [rows] = await connection.promise().query(sql, [freelancerId]);
        if (rows.length < 1) {
            throw true;
        }
        else {
            return rows[0];
        }
    }
    catch (e) {
        console.error(e);
        throw new Error("Couldn't get payment info from freelancer with id " + freelancerId);
    }
}

async function updateProfessionalInfo(freelancerId, {timeZone, preferredWorkTime, freelanceType, languagePair1, languagePair2, languagePair3,
    languagePair4, otherDescription, computerType, domainsOfExpertise}) {


    const sql = "UPDATE freelancers SET timeZoneId = ?, workTimeId = ?, freelanceTypeId = ?, lPair1 = ?, lPair2 = ?, lPair3 = ?" +
        " , lPair4 = ?, otherDescription = ?, computerTypeId = ? WHERE id = ?";

    if (!languagePair1){
        languagePair1 = null;
    }
    if (!languagePair2){
        languagePair2 = null;
    }
    if (!languagePair3){
        languagePair3 = null;
    }
    if (!languagePair4){
        languagePair4 = null;
    }

    await freelancers_domainsOfExpertise.removeAll(freelancerId);
    if (!domainsOfExpertise) {
        domainsOfExpertise = [];
    }
    else if (!Array.isArray(domainsOfExpertise)) {
        domainsOfExpertise = [domainsOfExpertise];
    }


    domainsOfExpertise.map(domain => {
        return parseInt(domain);
    });

    for (let i = 0; i < domainsOfExpertise.length; i++) {
        await freelancers_domainsOfExpertise.insert(domainsOfExpertise[i], freelancerId);
    }

    const [result] = await connection.promise().query(sql, [timeZone, preferredWorkTime, freelanceType, languagePair1, languagePair2, languagePair3,
        languagePair4, otherDescription, computerType, freelancerId]);
    return result;
}

function updatePersonalInfo(freelancerId, {firstName, email, lastName, motherTongue, countryOfResidence, state, city, street, zip,
                        house, phone, skype, nationality = null, sex = null, yearOfBirth = null}) {
    if (!nationality) {
        nationality = null;
    }
    if (!sex) {
        sex = null;
    }
    if (!yearOfBirth) {
        yearOfBirth = null;
    }

    const sql = "UPDATE freelancers SET firstName = ?, lastName = ?, motherTongue = ?, countryOfResidence = ?, state = ?, city = ?," +
        "street = ?, zip = ?, house = ?, phone = ?, skype = ?, email = ?, nationality = ?, sex = ?, yearOfBirth = ? WHERE id = ?";

    return connection.promise().query(sql, [firstName, lastName, motherTongue, countryOfResidence, state, city,
    street, zip, house, phone, skype, email, nationality, sex, yearOfBirth, freelancerId]);
}

function updatePaymentInfo(email, {preferredPaymentMethod, nameOfAccountHolder, nameOfBank, paypal, swiftOrBic, companyPersonal,
    vat, companyName, iban, transferWiseEmail, xoomFirstName, xoomLastName,xoomCountry, xoomState, xoomZip, xoomCity, xoomStreet,
    xoomHouse,  xoomTelephone, huskyCpfCnpj, huskyFullName, huskyEmail}) {
    const sql = "UPDATE freelancers SET preferredPaymentMethod = ?, paypal = ?, nameOfAccountHolder = ?, nameOfBank = ?, iban = ?, swiftOrBic = ?, " +
        "transferWiseEmail = ?, xoomFirstName = ?, xoomLastName = ?, xoomCountry = ?, xoomState = ?, xoomZip = ?, xoomCity = ?, xoomStreet = ?," +
        " xoomHouse = ?, xoomTelephone = ?, huskyCpfCnpj = ?, huskyFullName = ?, huskyEmail = ?, companyPersonal = ?, vat = ?, companyName = ? WHERE email = ?";

    const params = [preferredPaymentMethod, paypal, nameOfAccountHolder, nameOfBank, iban, swiftOrBic, transferWiseEmail,
        xoomFirstName, xoomLastName,xoomCountry, xoomState, xoomZip, xoomCity, xoomStreet, xoomHouse,  xoomTelephone,
        huskyCpfCnpj, huskyFullName, huskyEmail,
        companyPersonal, vat, companyName, email];
    console.log(sql, params);
    return connection.promise().query(sql, params);
}

function deleteAccount(email, explanation) {
    const sql = "UPDATE freelancers SET deleted = true, explanation = ? WHERE email = ?";

    return connection.promise().query(sql, [explanation, email])
}

async function changeLoggedIn(freelancerId) {
    const sql = "UPDATE freelancers SET loggedIn = 1 WHERE id = ?";
    const [result] = await connection.promise().query(sql, [freelancerId]);

    return result;
}

async function getMotherTongue(freelancerId) {
    const sql = "SELECT motherTongue FROM freelancers WHERE id = ?";

    const [rows] = await connection.promise().query(sql, [freelancerId]);
    if (rows.length < 1) {
        throw new Error("Failed to get motherTongue for freelancer " + freelancerId );
    }
    else {
        return rows[0].motherTongue;
    }
}

async function getByEmail(email) {
    const sql = "SELECT * FROM freelancers WHERE email = ? AND deleted = 0";
    const [[row]] = await connection.promise().query(sql, [email]);
    return row || null;
}

async function getCountry(freelancerId) {
    const sql = "SELECT c.name AS country FROM freelancers JOIN countries c ON c.id = freelancers.countryOfResidence WHERE freelancers.id = ?";
    const [[{country}]] = await connection.promise().query(sql, [freelancerId]);
    return country;
}

exports.getById = async (id) => {
    const sql = "SELECT * FROM freelancers WHERE id = ? AND deleted = 0";
    const [[row]] = await connection.promise().query(sql, [id]);
    return row || null;
};

exports.updateById = async (id, freelancer) => {
    const sql = "UPDATE freelancers SET ? WHERE id = ?";
    const [result] = await connection.promise().query(sql, [freelancer, id]);
    return result;
};

exports.getByEmail = getByEmail;
exports.getCountry = getCountry;
exports.getMotherTongue = getMotherTongue;
exports.changeLoggedIn = changeLoggedIn;
exports.deleteAccount = deleteAccount;
exports.updatePaymentInfo = updatePaymentInfo;
exports.updateProfessionalInfo = updateProfessionalInfo;
exports.getProfessionalInfo = getProfessionalInfo;
exports.updatePersonalInfo = updatePersonalInfo;
exports.getPersonalInfo = getPersonalInfo;
exports.getPaymentInfo = getPaymentInfo;
exports.completeProfile = completeProfile;
exports.forgotPin = forgotPin;
exports.createOne = createOne;
exports.checkPassword = checkPassword;
exports.getInvoiceInfo = getInvoiceInfo;
exports.getPaypal = getPaypal;
exports.getSwiftOrBic = getSwiftOrBic;
exports.getFullName = getFullName;
exports.getTemporaryPassword = getTemporaryPassword;
exports.clearTemporaryPassword = clearTemporaryPassword;
exports.setTemporaryPassword = setTemporaryPassword;
exports.updateLoginAttempts = updateLoginAttempts;
exports.getBlocked = getBlocked;
exports.clearLoginAttempts = clearLoginAttempts;
exports.getFullNameWithEmail = getFullNameWithEmail;
exports.getLeadLinguist = getLeadLinguist;
