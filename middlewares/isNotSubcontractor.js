module.exports = (req, res, next) => {
    if (req.session.user.lspId){
        res.redirect('/profile');
    }
    else {
        next();
    }
};
