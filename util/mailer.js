const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "noreply.datamundi@gmail.com",
        pass: "hLQ68qThjLFtXX4W5BnmbB7Ac"
    }
});

transporter.verify((error, succes) => {
    if (error) {
        console.log(error);
    }
    else{
        console.log("Server is ready");
        console.log(succes);
    }
});

module.exports = transporter;
