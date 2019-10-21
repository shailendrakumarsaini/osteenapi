// app.js

var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var organization = require('./routes/organization');
var department = require('./routes/department');
var user = require('./routes/user');
var question = require('./routes/question');
var course = require('./routes/course');
var category = require('./routes/category');
var assignment = require('./routes/assignment');
var role = require('./routes/role');
var label = require('./routes/label');
var notification = require('./routes/notification');
var app = express();
app.use(cors());
var schedule = require('node-schedule');
var config = require('./config');
var passport = require('passport');
var fbAuth = require('./controllers/auth.js');

// Set up mongoose connection
var mongoose = require('mongoose');
var dev_db_url = config.db.url;
mongoose.connect(dev_db_url, { useNewUrlParser: true }, (err) => {
    if (err) {
        console.log("DB Not Connected");
    } else {
        console.log("DB Connected")
    }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/organization', organization);
app.use('/department', department);
app.use('/user', user);
app.use('/question', question);
app.use('/course', course);
app.use('/category', category);
app.use('/assignment', assignment);
app.use('/label', label);
app.use('/role', role);
app.use('/notification', notification);

app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser(function (user, done) {
    console.log('serializeUser: ' + user._id);
    done(null, user._id);
});
passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        console.log(user);
        if (!err) done(null, user);
        else done(err, null);
    });
});


app.get('/account', ensureAuthenticated, function (req, res) {
    console.log(">>>>>>>>>>>>>>>>>>>>>res2", req)
    User.findById(req.session.passport.user, function (err, user) {
        if (err) {
            console.log(err);  // handle errors
        } else {
            res.render('account', { user: user });
        }
    });
});

app.get('/auth/facebook',
    passport.authenticate('facebook'),
    function (req, res) { });
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/' }),
    function (req, res) {
        console.log(">>>>>>>>>>>>>>>>>>>>>res1", res)
        res.redirect('/account');
    });

app.get('/auth/google',
    passport.authenticate('google', {
        scope: [
            'https://www.googleapis.com/auth/plus.login',
            'https://www.googleapis.com/auth/plus.profile.emails.read'
        ]
    }
    ));
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    function (req, res) {
        res.redirect('/account');
    });



function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/');
}

var port = 8080;

app.listen(port, () => {
    console.log('Server is up and running on port numner ' + port);
});
