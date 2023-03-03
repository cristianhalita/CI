const express = require('express');
const expHbs = require('express-handlebars');
const path = require('path');

const app = express();
app.set('trust proxy', true);
app.use(express.urlencoded({
    extended: false
}));

app.use(express.json());

app.use(require('./sessions'));

app.use(express.static(path.join(__dirname, "public")));

app.engine('hbs', expHbs({
    layoutsDir: path.join(__dirname, "views", "layouts"),
    extname: ".hbs",
    defaultLayout: "layout",
    helpers: {
        ifCond: (v1, v2, options) => {
            if(v1 == v2) {
                return options.fn(this);
            }
            return options.inverse(this);
        },
        ifEquals: function (arg1, arg2, options) {
            return (arg1 == arg2) ? options.fn(this) : options.inverse(this);

        }
    },
    partialsDir: path.join(__dirname, "views", "partials")
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, "views"));

const loginRouter = require('./routers/login.js');
const registerRouter = require('./routers/register.js');
const forgotRouter = require('./routers/forgot');
const resetPasswordRouter = require('./routers/resetPassword');
const completeProfileRouter = require('./routers/completeProfile');
const logoutRouter = require('./routers/logout');
const pmLoginRouter = require('./routers/pm-login');

//import apps
const invoicesApp = require('./apps/invoices/invoicesApp');
const jobsApp = require('./apps/jobs/jobsApp');
const profileApp = require('./apps/profile/profileApp');

const checkedNDA = require('./middlewares/checkedNDA');
const doneReadingTest = require('./middlewares/doneReadingTest');
const checkedNotifications = require('./middlewares/checkedNotifications');
const authenticated = require('./middlewares/authenticated');
const pmAuthenticated = require('./middlewares/pmAuthenticated');
const isNotSubcontractor = require('./middlewares/isNotSubcontractor');

const profileController = require('./apps/profile/controllers/profile');

app.use((req, res, next) => {
    console.log('Incoming: ', req.url, req.method);

    if (!req.session.errors) {
        req.session.errors = [];
    }
    if (!req.session.successes) {
        req.session.successes = [];
    }
    if (!req.session.warnings) {
        req.session.warnings = [];
    }

    res.set('Cache-control', 'no-store');

    next();
});

//use routers
app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use('/forgot', forgotRouter);
app.use('/resetPassword', resetPasswordRouter);
app.use('/pm-login', pmAuthenticated, pmLoginRouter);
app.use('/profile', authenticated, checkedNDA, doneReadingTest, profileApp);
app.use('/completeProfile', authenticated, checkedNDA, isNotSubcontractor, doneReadingTest, completeProfileRouter);
app.use('/logout', logoutRouter);
app.use('/jobs', authenticated, checkedNDA,checkedNotifications, doneReadingTest, jobsApp);
app.use('/invoices', authenticated, checkedNDA,checkedNotifications, isNotSubcontractor, doneReadingTest, invoicesApp);

app.post('/checkForVerificationCode', require('./controllers/checkVerificationCode').post);
app.post('/agreeToNDA', authenticated, profileController.agreeToNDA);
app.post('/readingSpeed', authenticated, profileController.readingSpeed);

const checker = require('license-checker');

app.get('/licenses', (req, res) => {
    try {
        checker.init({start: path.join(__dirname), customPath: path.join(__dirname, "customPath.json")}, (err, packages) => {
            if (err) {
                console.error(err);
            }
            else {
                res.render('licenses', {
                    packages
                });
            }
        });
    }
    catch (e) {
        console.error(e);
    }
});

app.use('/rest-api', authenticated, require('./rest-api/app'));

app.use('/', (req, res, next) => {
    console.log('Last middleware: ', req.url);

    if (req.url !== "/favicon.ico") {
        if (req.session.user) {
            res.redirect('/profile');
        }
        else {
            res.redirect('/login');
        }
    }
    else {
        next();
    }
});

module.exports = app;
