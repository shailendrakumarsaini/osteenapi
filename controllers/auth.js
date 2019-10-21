var config = require('../config')
var _ = require('lodash');
var ejs = require("ejs");
var path = require('path');
var fs = require('fs');
var express = require('express');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var User = require('./user.js');

module.exports = passport.use(new FacebookStrategy({
    clientID: "XXXXXXXXX", // Use your Facebook App Id
    clientSecret: "XXXXXXXXXXXXXX", // Use your Facebook App Secret
    callbackURL: "https://46e23722.ngrok.io/auth/facebook/callback",
    profileFields: ['id', 'emails', 'name']
},
    function (accessToken, refreshToken, profile, done) {
        User.findOne({ oauthID: profile.id }, function (err, user) {
            if (err) {
                console.log(err);  // handle errors!
            }
            if (!err && user !== null) {
                done(null, user);
            } else {
                user = new User({
                    oauthID: profile.id,
                    name: profile.displayName,
                    created: Date.now()
                });
                user.save(function (err) {
                    if (err) {
                        console.log(err);  // handle errors!
                    } else {
                        console.log("saving user ...");
                        done(null, user);
                    }
                });
            }
        });
    }
));


// passport.use(new GoogleStrategy({
//     clientID: config.google.clientID,
//     clientSecret: config.google.clientSecret,
//     callbackURL: config.google.callbackURL
// },
//     function (request, accessToken, refreshToken, profile, done) {
//         User.findOne({ oauthID: profile.id }, function (err, user) {
//             if (err) {
//                 console.log(err);  // handle errors!
//             }
//             if (!err && user !== null) {
//                 done(null, user);
//             } else {
//                 user = new User({
//                     oauthID: profile.id,
//                     name: profile.displayName,
//                     created: Date.now()
//                 });
//                 user.save(function (err) {
//                     if (err) {
//                         console.log(err);  // handle errors!
//                     } else {
//                         console.log("saving user ...");
//                         done(null, user);
//                     }
//                 });
//             }
//         });
//     }
// ));

