const argon2 = require('argon2');
const crypto = require("crypto");
const resetPasswordTokens = require("../models/resetPasswordTokens");

exports.hashPassword = (plainTextPassword) => {
	return argon2.hash(plainTextPassword, {
		parallelism: 2,
		type: argon2.argon2i
	});
};

exports.verifyPassword = (plaintTextPassword, hashedPassword) => {
	return argon2.verify(hashedPassword, plaintTextPassword);
};

exports.validateToken = async (token) => {
	token = crypto.createHash("sha256").update(token).digest('hex');
	const resetPasswordToken = await resetPasswordTokens.getByToken(token);

	if (!resetPasswordToken) {
		throw new Error("This link is invalid.")
	}
	else {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);

		if (yesterday > resetPasswordToken.stamp) {
			throw new Error("This link expired, please request a new link.");
		}
	}
	return resetPasswordToken;
};

exports.generateTemporaryPassword = () => {
	let pin = "";

	for (let i = 0; i < 6; i++) {
		const randomNumber = Math.floor(Math.random() * 10); // from 0 to 9
		pin += randomNumber.toString();
	}

	return pin;
};
