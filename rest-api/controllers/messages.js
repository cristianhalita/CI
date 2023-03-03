const chatMessages = require('../../models/chatMessages');

exports.getMessages = async (req, res) => {
	try {
		const {id: freelancerId} = req.session.user;

		res.json({
			messages: await chatMessages.getByFreelancerId(freelancerId)
		});
	}
	catch (e) {
		console.error(e);
		res.sendStatus(500);
	}
}