module.exports = (req, res, next) => {

    if (req.session.user){
        next();
    }
    else {
        console.log("Not authenticated", req.sessionID);
        res.redirect('/login');
    }
};