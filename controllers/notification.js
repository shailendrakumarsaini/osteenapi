var Notification = require('../models/notification');
var Upload = require('../services/upload');
var Email = require('../models/email');
var nodemailer = require("nodemailer");
var schedule = require('node-schedule');
var config = require('../config');
var _ = require('lodash');
var fs = require('fs');
var parse = require('csv-parse');;
var jsonexport = require('jsonexport');
var moment = require('moment');
var stream = require('stream');
var sizeOf = require('image-size');
var formidable = require('formidable');
var noofProductFields = 2;
var util = require('util');
var { Storage } = require('@google-cloud/storage');
var gcs = new Storage({
    projectId: config.googleUpload.projectId,
    keyFilename: config.googleUpload.keyFilename
});
var smtpTransport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
        user: config.email.user,
        pass: config.email.pass
    }
});
function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function fileExtValidation(filename) {
    var fileName = filename;
    var fileExt = fileName.substring(fileName.lastIndexOf(".") + 1);
    if (fileExt == "csv" || fileExt == "xlsx") {
        return true;
    } else {
        return false;
    }
};

// function fieldValidation(fields, fieldRow) {
//     console.log("++)))))))))", fieldRow.length)
//     if (fieldRow.length != noofProductFields) {
//         return false;
//     }
//     fieldRow.forEach(function (element) {
//         if (fields.indexOf(element) === -1)
//             return false;
//     });
//     //validate order of fields
//     for (var i = 0; i < fields.length; i++) {
//         if (fields[i] != fieldRow[i])
//             return false;
//     }
//     return true;
// };
exports.list = function (req, res) {
    Notification.find({}).exec(function (err, notifications) {
        if (err) {
            res.status(400)
            res.send(err);
        }
        res.send(notifications);
    })
};

exports.create = function (req, res) {
    var body = req.body;
    body.identity = makeid(6);
    Notification.create(body, function (err, notification) {
        if (err) {
            res.status(400);
            res.send(err)
        }
        if (body.scheduled_type == 'later') {
            var scheduledTime = getScheduleFromDate(req.body.scheduled_time);
            if (!scheduledTime) {
                res.status(400);
                res.send("invalid Date")
            }
            schedule.scheduleJob(req.body.identity, scheduledTime, function () {
                sendResponse(notification);
            });
        } else if (body.scheduled_type == 'now') {
            sendResponse(notification);
        }
        res.send(notification)
    })
};
exports.findOne = function (req, res) {
    Notification.findById(req.params.id, function (err, notification) {
        if (err) {
            res.status(400)
            res.send(err);
        }
        res.send(notification);
    })
};

exports.update = function (req, res) {
    var body = req.body;
    Notification.findByIdAndUpdate({ _id: body._id }, { $set: req.body }, function (err, notification) {
        if (err) {
            res.status(400);
            res.send(err);
        }
        var my_job = schedule.scheduledJobs[body.identity];
        if (my_job) {
            my_job.cancel();
        }
        if (req.body.scheduled_type == 'later' && body.scheduled == true) {
            var scheduledTime = getScheduleFromDate(req.body.scheduled_time);
            if (!scheduledTime)
                return;
            var j = schedule.scheduleJob(body.identity, scheduledTime, function () {
                sendResponse(req.body);
            });
            res.send(notification);
        } else if (req.body.type == 'now') {
            sendResponse(req.body);
            res.send(notification)
        }
    });
};

exports.delete = function (req, res) {
    var body = req.body;
    Notification.findByIdAndRemove({ _id: body._id }, function (err, notification) {
        if (err) {
            res.status(400)
            res.send(err)
        };
        var my_job = schedule.scheduledJobs[body.identity];
        if (my_job) {
            my_job.cancel();
        }
        res.send(notification)
    })
};

exports.stop = function (req, res) {
    var message = req.body;
    var my_job = schedule.scheduledJobs[message.identity];
    if (my_job) {
        my_job.cancel();
    }
};
exports.restartall = function (req, res) {
    if (err) {
        res.status(400);
        res.send(err)
    }
    startScheduledAllJobs();
    res.send('Job restarted successfully')
};

exports.import = function (req, res) {
    var form = new formidable.IncomingForm();
    form.uploadDir = "./img";       //set upload directory
    form.keepExtensions = true;     //keep file extension
    form.parse(req, function (err, fields, files) {
        if (files == "" || files == null || files == undefined) {
            res.status(400);
            res.send("no file is imported");
        }
        var filePath = files.file.path;
        // File ext validation
        var test = fileExtValidation(filePath);
        if (test != true) {
            res.status(400);
            res.send("There is a problem with file extension. Please upload appropriate file");
        } else {
            var csvData = [];
            fs.createReadStream(filePath)
                .pipe(parse({ delimiter: ',' }))
                .on('data', function (csvrow) {
                    csvData.push(csvrow);
                })
                .on('end', function () {
                    var importingFields = ["name", "email"];
                    // Fields validation
                    // var resultValue = fieldValidation(importingFields, csvData[0]);
                    // if (!resultValue) {
                    //     res.status(400);
                    //     res.send("There is a problem with fields. Please correct the field names and reupload");
                    // } else {
                    var finalEmailList = [];
                    // * looping each and every product and creating an object for creating the product.
                    for (var i = 1; i < csvData.length; i++) {
                        finalEmailList.push(csvData[i][1])
                    }
                    var body = {
                        name: req.body.name,
                        list: finalEmailList
                    }
                    Email.create(body, function (err, emails) {
                        if (err) {
                            res.status(400);
                            res.send(err);
                        };
                        res.send(emails);
                    })
                    // }
                    fs.unlinkSync(filePath);
                })
        }

    });
};
exports.upload = function (req, res) {
    var form = new formidable.IncomingForm();
    form.uploadDir = "./img";       //set upload directory
    form.keepExtensions = true;     //keep file extension
    form.parse(req, function (err, fields, files) {
        if (files == "" || files == null || files == undefined) {
            res.status(400);
            res.send("no file is imported");
        }
        var filePath = files.file.path;
        var orginalName = files.file.name;
        var newPath = "img/" + orginalName
        fs.renameSync(filePath, newPath)
        var bucket = gcs.bucket(config.googleUpload.bucketName);
        bucket.upload(newPath, function (err, file) {
            if (err) {
                res.status(400);
                res.send(err);
            }
            var link = "https://storage.googleapis.com/" + config.googleUpload.bucketName + "/" + orginalName
            fs.unlinkSync(newPath);
            res.status(200);
            var obj={
                 url:link
            }
            res.send(obj);
        });
    });
};

function getScheduleFromDate(data) {
    var date = (data.date).split("-");
    var time = (data.time).split(":");
    var scheduleTime = new Date(date[0], parseInt(date[1]) - 1, parseInt(date[2]), parseInt(time[0]), parseInt(time[1]), 0);
    return scheduleTime
}


function sendResponse(job) {
    var mailOptions = {
        from: job.from,
        to: job.to,
        subject: job.subject,
        text: job.data
    }
    smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
            res.status(400);
            res.send(error);
        } else {
            Notification.updateOne({ _id: job._id }, { send_status: "sent", sent_time: new Date() }).exec(function (err, notification) {
                if (err) {
                    res.status(400)
                    res.send(err)
                }
                console.log("notification: " + notification);
            })
        }
    });
}

function startScheduledAllJobs() {
    Notification.find(function (err, notifications) {
        _.map(notifications, function (job) {
            if (job.scheduled_time && job.scheduled_type === 'on') {
                var scheduledTime = getScheduleFromDate(job.scheduled_time);
                if (!scheduledTime)
                    return;
                var j = schedule.scheduleJob(job.identity, scheduledTime, function () {
                    sendResponse(job)
                });
            }
        });
    });
}

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

startScheduledAllJobs();