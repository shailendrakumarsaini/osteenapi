var User = require('../models/user');
var nodemailer = require("nodemailer");
var config = require('../config')
var _ = require('lodash');
const bcrypt = require('mongoose-bcrypt');
var ejs = require("ejs");
var path = require('path');


var smtpTransport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
        user: config.email.user,
        pass: config.email.pass
    }
});


function generatePassword(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

exports.test = function (req, res) {
    res.json({'msg':'Greetings from the Test controller!'});
};

exports.list = async function (req, res) {
    var filters = await convertParams(User, req.query);
    User.find(filters.find)
        .where(filters.where)
        .sort(filters.sort)
        .skip(filters.start)
        .limit(filters.limit)
        .populate('role')
        .populate('category')
        .populate('course')
        .exec(function (err, users) {
            if (err) {
                res.status(400);
                res.send(err);
            };
            res.send(users);
        });
};

exports.findOne = function (req, res) {

    var id = req.params.id;
    User.findOne({ _id: id }).populate('role')
        .populate('category')
        .populate('course')
        .exec(function (err, user) {
            if (err) {
                res.send(err)
            };
            if (user) {
                res.status(200);
                res.send(user);
            } else {
                res.status(200);
                res.send("no user found");
            }
        });
};

exports.create = function (req, res) {
    var body = req.body;
    User.create(body, function (err, user) {
        if (err) {
            res.status(400);
            res.send(err);
            console.log(err)
        };
        if (user) {
            var verificationLink = config.verification + "?email=" + user.email;
            var mailOptions = {
                to: user.email,
                subject: 'Welcome greeting from Osteen',
                html: "<p> Hello " + user.username + " !</p> \n" + "<p>Your login details as below. </p> \n" + "<p> UserName:  " + user.email + "</p> \n" + "<p> Password: " + req.body.password + "</p> \n" +
                    "<p> Please complete you verification by clicking on the link: " + verificationLink + "</p> \n"
            }
            smtpTransport.sendMail(mailOptions, function (error, response) {
                if (error) {
                    res.status(400);
                    res.json({"msg":"Invalid User Logins For sending notification"});
                } else {
                    res.status(200);
                    res.send(user);
                }
            });
        }
    });
};

exports.update = function (req, res) {
    var body = req.body;
    User.update({ _id: body._id }, body, function (err, user) {
        if (err) {
            res.status(400);
            res.send(err);
        };
        res.send(user);
    });
};

exports.delete = function (req, res) {
    var id = req.params.id;
    User.deleteOne({ _id: id }, function (err, user) {
        if (err) {
            res.status(400);
            res.send(err);
        };
        res.send(user);
    });
};

exports.deleteMany = function (req, res) {
    var ids = req.params.ids;
    User.deleteMany({ _id: ids.split(',') }, function (err, users) {
        if (err) {
            res.status(400);
            res.send(err);
        };
        res.send(users);
    });
};

exports.login = function (req, res) {
    var q = {
        $or: [{
            email: req.body.identifier
        },
        {
            mobile: req.body.identifier
        }
        ]
    }
    User.findOne(q)
        .exec(function (err, user) {
            if (err) return next(err);
            if (user) {
                if (user.isActive) {
                    if (user.isApproved) {
                        user.comparePassword(req.body.password, function (err, isMatch) {
                            if (isMatch) {
                                res.status(200);
                                res.send(user);
                            } else {
                                res.status(400);
                                res.json({"msg":"Wrong Password"});
                            }
                        });
                    } else {
                        res.status(400);
                        res.json({"msg":"Your Account is not approved, Please contact to the Admin"});
                    }
                } else {
                    res.status(400);
                    res.json({"msg":"Your email is not verified, Please complete verification process"});
                }
            } else {
                res.status(400);
                res.json({"msg":"Invalid Credentials"});
            }
        });
};

exports.forgotpassword = function (req, res) {
    var email = req.body.email;
    var newPassword = generatePassword(10);
    User.findOne({ "email": email }, function (err, user) {
        if (err) {
            res.send(err)
        };
        if (user) {
            User.update({ _id: user._id }, { "password": newPassword }, function (err, updatedUser) {
                if (err) {
                    res.send(err)
                };
                var mailOptions = {
                    to: req.body.email,
                    subject: 'Reset Password',
                    html: "<p> Hello " + user.username + " !</p> \n" + "<p>Your login details as below. </p> \n" + "<p> UserName:  " + user.email + "</p> \n" + "<p> Password: " + newPassword + "</p> \n"
                }
                smtpTransport.sendMail(mailOptions, function (error, response) {
                    if (error) {
                        res.status(400);
                        res.send("Invalid User Logins For sending notification");
                    } else {
                        res.status(200);
                        res.send(updatedUser);
                    }
                });
            });
        } else {
            res.status(400);
            res.send("Invalid email")
        }
    });
};

exports.verification = function (req, res) {
    var email = req.query.email;
    User.findOne({ "email": email }, function (err, user) {
        if (err) {
            res.status(400)
            res.send(err);
        };
        if (user) {
            User.update({ _id: user._id }, { "isActive": true }, function (err, updatedUser) {
                if (err) {
                    res.status(400);
                    res.send(err)
                };
                res.status(200);
                res.send(updatedUser);
            });
        } else {
            res.status(400);
            res.send("Invalid link");
        }
    });
};

function convertParams(model, params) {
    var finalQuery = {};
    var keys = _.keys(model.schema.obj)
    var query = _.keys(params)
    var final = _.intersectionWith(query, keys)
    var options = ['_ne', '_lt', '_gt', '_lte', '_gte']
    finalQuery.find = {};
    finalQuery.where = {};
    finalQuery.sort = {};
    finalQuery.start = 0;
    finalQuery.limit = 10;
    if (params._q) {
        var $or = []
        _.mapKeys(model.schema.obj, function (value, key) {
            if (value.valueType === "String") {
                var q = {}
                var query = params._q;
                if (q[key] === "role") {
                    q[key] = query
                } else {
                    q[key] = { $regex: query }
                }

                $or.push(q)
            }
        })
        finalQuery.find['$or'] = $or;
        _.map(query, (q) => {
            _.map(options, (option) => {
                if (_.includes(q, option)) {
                    var newQuery = {}
                    newQuery[option.replace('_', '$')] = params[q];
                    finalQuery.where[q.replace(option, '')] = newQuery;
                } else if (_.includes(q, '_sort')) {
                    var actualQuery = params[q].split(':')
                    finalQuery.sort[actualQuery[0]] = actualQuery[1]
                } else if (_.includes(q, '_start')) {
                    finalQuery.start = parseInt(params[q]);
                } else if (_.includes(q, '_limit')) {
                    finalQuery.limit = parseInt(params[q]);
                } else if (_.includes(q, 'date_bt')) {
                    var newQuerydate = {};
                    var actualQuery = params[q].split(':');
                    newQuerydate['$gte'] = new Date(actualQuery[0]);
                    newQuerydate['$lte'] = new Date(actualQuery[1]);
                    finalQuery.where['created_at'] = newQuerydate;
                }
            });
        });

        _.map(final, (f) => {
            finalQuery.where[f] = params[f]
        });
        return (finalQuery);
    } else {
        _.map(query, (q) => {
            _.map(options, (option) => {
                if (_.includes(q, option)) {
                    var newQuery = {}
                    newQuery[option.replace('_', '$')] = params[q];
                    finalQuery.where[q.replace(option, '')] = newQuery;
                } else if (_.includes(q, '_sort')) {
                    var actualQuery = params[q].split(':')
                    finalQuery.sort[actualQuery[0]] = actualQuery[1]
                } else if (_.includes(q, '_start')) {
                    finalQuery.start = parseInt(params[q]);
                } else if (_.includes(q, '_limit')) {
                    finalQuery.limit = parseInt(params[q]);
                } else if (_.includes(q, 'date_bt')) {
                    var newQuerydate = {};
                    var actualQuery = params[q].split(':');
                    newQuerydate['$gte'] = new Date(actualQuery[0]);
                    newQuerydate['$lte'] = new Date(actualQuery[1]);
                    finalQuery.where['created_at'] = newQuerydate;
                }
            });
        });

        _.map(final, (f) => {
            finalQuery.where[f] = params[f]
        });

        return (finalQuery);
    }
}