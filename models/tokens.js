const {connection} = require('../util/database');
const bcrypt = require('bcrypt');
const country = require('./countries');
const paymentMethod = require('./paymentMethods');
const freelancers = require('./freelancers');
const {client} = require('../util/socketlabs');

const NODE_ENV = process.env.NODE_ENV;

let baseUrl;

if (NODE_ENV == "eu") {
    baseUrl = "https://freelancer.datamundi.eu";
}
else if (NODE_ENV == "production") {
    baseUrl = "https://freelancer.datamundi.space";
}
else {
    baseUrl = "http://localhost:3000";
}

async function generateTokenPersonal(email, userId, tokens) {
    let sql = "INSERT INTO tokens (token, userId, email, countryOfResidence, state, street, zip, house, city, sex, yearOfBirth) VALUES (?,?,?,?,?,?,?,?,?,?,?)";

    const token = Math.random().toString(36).substring(2,15) + Math.random().toString(36).substring(2,15);
    let params = [token, userId];

    if (tokens.email) {
        params.push(tokens.email.new);
    }
    else {
        params.push(null);
    }
    if (tokens.countryOfResidence) {
        params.push(tokens.countryOfResidence.new);
    } 
    else {
        params.push(null);
    }
    if (tokens.state) {
        params.push(tokens.state.new);
    } 
    else {
        params.push(null);
    }
    if (tokens.street) {
        params.push(tokens.street.new);
    }
    else {
        params.push(null);
    }
    if (tokens.zip) {
        params.push(tokens.zip.new);
    }
    else {
        params.push(null);
    }
    if (tokens.house) {
        params.push(tokens.house.new);
    }
    else {
        params.push(null);
    }
    if (tokens.city) {
        params.push(tokens.city.new);
    }
    else {
        params.push(null);
    }
    if (tokens.sex) {
        params.push(tokens.sex.new || null);
    }
    else {
        params.push(null);
    }
    if (tokens.yearOfBirth) {
        params.push(tokens.yearOfBirth.new || null);
    }
    else {
        params.push(null);
    }

    const fullName = await freelancers.getFullName(userId);

    await connection.promise().query(sql, params);
    await sendToken(email, token, tokens,"/profile/personal", fullName);
}

async function generateTokenPayment(email, userId, tokens) {
    let sql = "INSERT INTO tokens (token, userId, preferredPaymentMethod, paypal, nameOfAccountHolder, nameOfBank, swiftOrBic, iban, companyPersonal, vat, companyName, " +
        "transferWiseEmail, xoomCountry, xoomState, xoomZip, xoomCity, xoomStreet, xoomHouse, xoomTelephone, xoomFirstName, xoomLastName) " +
        "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

    const token = Math.random().toString(36).substring(2,15) + Math.random().toString(36).substring(2,15);
    console.log("token: " + token);
    let params = [token, userId];

    if (tokens.preferredPaymentMethod) {
        params.push(tokens.preferredPaymentMethod.new);
    }
    else {
        params.push(null);
    }
    if (tokens.paypal) {
        params.push(tokens.paypal.new);
    }
    else {
        params.push(null);
    }
    if (tokens.nameOfAccountHolder) {
        params.push(tokens.nameOfAccountHolder.new);
    }
    else {
        params.push(null);
    }
    if (tokens.nameOfBank) {
        params.push(tokens.nameOfBank.new);
    }
    else {
        params.push(null);
    }
    if (tokens.swiftOrBic) {
        params.push(tokens.swiftOrBic.new);
    }
    else {
        params.push(null);
    }
    if (tokens.iban) {
        params.push(tokens.iban.new);
    }
    else {
        params.push(null);
    }
    if (tokens.companyPersonal) {
        params.push(tokens.companyPersonal.new);
    }
    else {
        params.push(null);
    }
    if (tokens.vat) {
        params.push(tokens.vat.new);
    }
    else {
        params.push(null);
    }
    if (tokens.companyName) {
        params.push(tokens.companyName.new);
    }
    else {
        params.push(null);
    }
    if (tokens.transferWiseEmail) {
        params.push(tokens.transferWiseEmail.new);
    }
    else {
        params.push(null);
    }
    if (tokens.xoomCountry) {
        params.push(tokens.xoomCountry.new);
    }
    else {
        params.push(null);
    }
    if (tokens.xoomState) {
        params.push(tokens.xoomState.new);
    }
    else {
        params.push(null);
    }
    if (tokens.xoomZip) {
        params.push(tokens.xoomZip.new);
    }
    else {
        params.push(null);
    }
    if (tokens.xoomCity) {
        params.push(tokens.xoomCity.new);
    }
    else {
        params.push(null);
    }
    if (tokens.xoomStreet) {
        params.push(tokens.xoomStreet.new);
    }
    else {
        params.push(null);
    }
    if (tokens.xoomHouse) {
        params.push(tokens.xoomHouse.new);
    }
    else {
        params.push(null);
    }
    if (tokens.xoomTelephone) {
        params.push(tokens.xoomTelephone.new);
    }
    else {
        params.push(null);
    }
    if (tokens.xoomFirstName) {
        params.push(tokens.xoomFirstName.new);
    }
    else {
        params.push(null);
    }
    if (tokens.xoomLastName) {
        params.push(tokens.xoomLastName.new);
    }
    else {
        params.push(null);
    }

    const fullName = await freelancers.getFullName(userId);

    await connection.promise().query(sql, params);
    await sendToken(email, token, tokens,"/profile/payment", fullName);
}

async function verify(userId, token) {
    const sql = "SELECT * FROM tokens WHERE userId = ? AND token = ?";

    const [rows] = await connection.promise().query(sql, [userId, token]);
    if (rows.length < 1) {
        console.log("No rows");
        throw new Error("No token found");
    }
    else {
        const row = rows[0];
        const sql2 = "UPDATE freelancers SET email = CASE WHEN ? IS NULL  THEN email ELSE ? END," +
            "                          countryOfResidence = CASE WHEN ? IS NULL  THEN countryOfResidence ELSE ? END, " +
            "                          state = CASE WHEN ? IS NULL THEN state ELSE ? END," +
            "                          street = CASE WHEN ? IS NULL  THEN street ELSE ? END," +
            "                          zip = CASE WHEN ? IS NULL  THEN zip ELSE ? END," +
            "                          house = CASE WHEN ? IS NULL THEN house ELSE ? END, " +
            "                          city = CASE WHEN ? IS NULL THEN city ELSE ? END, " +
            "                          preferredPaymentMethod = CASE WHEN ? IS NULL THEN preferredPaymentMethod ELSE ? END," +
            "                          paypal = CASE WHEN ? IS NULL THEN paypal ELSE ? END," +
            "                          nameOfAccountHolder = CASE WHEN ? IS NULL THEN nameOfAccountHolder ELSE ? END," +
            "                          nameOfBank = CASE WHEN ? IS NULL THEN nameOfBank ELSE ? END," +
            "                          swiftOrBic =  CASE WHEN ? IS NULL THEN swiftOrBic ELSE ? END, " +
            "                          iban = CASE WHEN ? IS NULL THEN iban ELSE ? END," +
            "                          companyPersonal = CASE WHEN ? IS NULL THEN companyPersonal ELSE ? END," +
            "                          vat = CASE WHEN ? IS NULL THEN vat ELSE ? END," +
            "                          transferWiseEmail = CASE WHEN ? IS NULL THEN transferWiseEmail ELSE ? END," +
            "                          xoomCountry = CASE WHEN ? IS NULL THEN xoomCountry ELSE ? END," +
            "                          xoomState = CASE WHEN ? IS NULL THEN xoomState ELSE ? END," +
            "                          xoomCity = CASE WHEN ? IS NULL THEN xoomCity ELSE ? END," +
            "                          xoomStreet = CASE WHEN ? IS NULL THEN xoomStreet ELSE ? END," +
            "                          xoomHouse = CASE WHEN ? IS NULL THEN xoomHouse ELSE ? END," +
            "                          xoomTelephone = CASE WHEN ? IS NULL THEN xoomTelephone ELSE ? END," +
            "                          xoomZip = CASE WHEN ? IS NULL THEN xoomZip ELSE ? END," +
            "                          xoomFirstName = CASE WHEN ? IS NULL THEN xoomFirstName ELSE ? END," +
            "                          xoomLastName = CASE WHEN ? IS NULL THEN xoomLastName ELSE ? END," +
            "                          sex = CASE WHEN ? IS NULL THEN sex ELSE ? END," +
            "                          yearOfBirth = CASE WHEN ? IS NULL THEN yearOfBirth ELSE ? END," +
            "                          companyName = CASE WHEN ? IS NULL THEN companyName ELSE ? END WHERE id = ?";


            let params = [row.email, row.email, row.countryOfResidence, row.countryOfResidence, row.state, row.state,
            row.street, row.street, row.zip, row.zip, row.house, row.house, row.city, row.city,
            row.preferredPaymentMethod, row.preferredPaymentMethod, row.paypal, row.paypal,
            row.nameOfAccountHolder, row.nameOfAccountHolder, row.nameOfBank, row.nameOfBank,
            row.swiftOrBic, row.swiftOrBic, row.iban, row.iban, row.companyPersonal, row.companyPersonal,
            row.vat, row.vat, row.transferWiseEmail, row.transferWiseEmail, row.xoomCountry, row.xoomCountry,
            row.xoomState, row.xoomState, row.xoomCity, row.xoomCity, row.xoomStreet, row.xoomStreet, row.xoomHouse, row.xoomHouse,
            row.xoomTelephone, row.xoomTelephone, row.xoomZip, row.xoomZip, row.xoomFirstName, row.xoomFirstName,
            row.xoomLastName, row.xoomLastName, row.sex, row.sex, row.yearOfBirth, row.yearOfBirth, row.companyName, row.companyName, row.userId];

        try {
            await connection.promise().query(sql2, params);
        } catch (ex) {
            console.error(ex);
            throw new Error("Failed to update");
        }
    }
}

async function discard(userId, token) {
    const sql = "DELETE FROM tokens WHERE userId = ? AND token = ?";

    const  [result] = await connection.promise().query(sql, [userId, token]);
    if (result.affectedRows < 1) {
        throw new Error("Failed");
    }
}

async function sendToken(email, token, tokens, url, fullName) {
    let text = "Dear " + fullName + ",\n\nPlease verify that you want to change these details in your freelancer account " +
        "on freelancer.datamundi.space portal: \n";

    let isCountryOfResidence = false;
    let isPreferredPaymentMethod = false;
    let isXoomCountry = false;

    for (let prop in tokens) {
        console.log(prop);
        if (prop !== "init") {
            if (prop === "countryOfResidence") {
                isCountryOfResidence = true;
            }
            else if (prop === "preferredPaymentMethod"){
                isPreferredPaymentMethod = true;
            }
            else if (prop === "xoomCountry") {
                isXoomCountry = true;
            }
            else {
                if (!tokens[prop].old) {
                    tokens[prop].old = "nothing"
                }
                    text += "\n" + tokens[prop].name + " from " + tokens[prop].old + " to " + tokens[prop].new + ", "
                }
            }
        }


    if (isCountryOfResidence) {
        try {
            const oldName = await country.getName(tokens.countryOfResidence.old);
            const newName = await country.getName(tokens.countryOfResidence.new);
            text += "\nCountry of residence from " + oldName + " to " + newName;
        } catch (e) {
            console.log(e);
            text += "\nSomething went wrong with getting the information for country of residence..";
        }
    }

    if (isPreferredPaymentMethod) {
        try {
            const oldName = await paymentMethod.getName(tokens.preferredPaymentMethod.old);
            const newName = await paymentMethod.getName(tokens.preferredPaymentMethod.new);
            text += "\nPreferred payment method from " + oldName + " to " + newName;
        }
        catch (e) {
            console.log(e);
            text += "\nSomething went wrong with getting the information for preferred payment method..";
        }
    }

    if (isXoomCountry) {
        try {
            let oldName;
            if (!tokens.xoomCountry.old) {
                oldName = "nothing";
            }
            else {
                oldName = await country.getName(tokens.xoomCountry.old);
            }
            const newName = await country.getName(tokens.xoomCountry.new);
            text += "\nXoom country of residence from " + oldName + " to " + newName;
        } catch (e) {
            console.log(e);
            text += "\nSomething went wrong with getting the information for Xoom country of residence...";
        }
    }

    text += "\nPlease click on this link to confirm these changes: " + baseUrl + url + "/verify?key=" + token + "\nor click this link to discard these changes: " +
        baseUrl + url + "/discard?key=" + token;

    const message = {
        from: "no-reply@datamundi.space",
        to: email,
        subject: "verification",
        textBody: text,
        messageType: "basic"
    };

    return client.send(message);
}
exports.generateTokenPayment = generateTokenPayment;
exports.generateTokenPersonal = generateTokenPersonal;
exports.verify = verify;
exports.discard = discard;
