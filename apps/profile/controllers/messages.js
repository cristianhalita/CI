const freelancers_messages = require('../../../models/freelancers_messages');

exports.readMessage = async (req, res) => {
    const {messageId} = req.body;
    const {id: freelancerId} = req.session.user;

    console.log(messageId);

    try {
        await freelancers_messages.createOne(messageId, freelancerId);
        const unRead = await freelancers_messages.getUnread(freelancerId);
        res.status(200).json({
            unRead: unRead
        });
    }
    catch (e) {
        console.log(e);
        res.status(400).json({
            message: "oops"
        });
    }
};

exports.unReadMessage = async (req, res) => {
    const {messageId} = req.body;
    const {id: freelancerId} = req.session.user;

    try {
        await freelancers_messages.deleteOne(messageId, freelancerId);
        const unRead = await freelancers_messages.getUnread(freelancerId);
        res.status(200).json({
            unRead: unRead
        });
    }
    catch (e) {
        console.log(e);
        res.sendStatus(400);
    }
};
