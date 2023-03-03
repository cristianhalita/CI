const user = require('../models/freelancers');
const resetPasswordTokens = require('../models/resetPasswordTokens');
const socketlabs = require('../util/socketlabs');

const crypto = require('crypto');

exports.get = (req, res) => {
	const options = {
		title: "FL - Forgot Password?",
		errors: req.session.errors,
		warnings: req.session.warnings,
		successes: req.session.successes,
		inputs: req.session.inputs
	};

	req.session.inputs = null;
	req.session.errors = [];
	req.session.warnings = [];
	req.session.successes = [];

	res.render('forgot', options);
};

exports.post = async (req, res) => {
	const {email, origin = "/forgot"} = req.body;

	try {
		const freelancer = await user.getByEmail(email);

		if (freelancer) {
			const ip = req.ip;
			const userAgent = req.get('User-Agent');

			const uuid = crypto.randomUUID();
			const hash = crypto.createHash('sha256').update(uuid).digest('hex');
			await resetPasswordTokens.insert({
				freelancerId: freelancer.id,
				token: hash,
				ip,
				userAgent
			});

			socketlabs.resetPassword(freelancer.email, freelancer.firstName, uuid, ip, userAgent);
		}

		req.session.successes.push("A reset password link has been sent to the user's email address.");
	}
	catch (e) {
		console.error(e);
		req.session.errors.push("Something went wrong on the server.");
	}
	finally {
		res.redirect(origin);
	}
};