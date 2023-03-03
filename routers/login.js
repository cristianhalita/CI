const express = require('express');
const router = express.Router();

const controller = require('../controllers/login.js');

router.use(isAuthenticated);

router.get('/', controller.get);
router.post('/', controller.post);

module.exports = router;

function isAuthenticated(req, res, next) {
    if (req.session.user){
        res.redirect('/profile');
    }
    else{
        // req.session.errors = ["You must be authenticated to view this page."];
        next();
    }
}