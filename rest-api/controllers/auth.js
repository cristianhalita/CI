const tokenSecret = 'ijuhdfg54*541¨dsfft1dfg154';
const jwt = require('jsonwebtoken');

function signToken (payload) {
	return jwt.sign(payload, tokenSecret, {
		expiresIn: 86400
	});
}


exports.getToken = async (req, res) => {
	try {
		const token = signToken({
			sub: req.session.user.id
		});
		res.json({token});
	}
	catch (e) {
		res.sendStatus(500);
	}
};