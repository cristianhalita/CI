module.exports = (req, res, next) => {
    if (req.session.pm){
        next();
    }
    else {
        res.redirect('/login');
    }
};