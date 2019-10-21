var Assignment = require('../models/assignment');
var config = require('../config')
var _ = require('lodash');

exports.list = async function (req, res) {
    var filters = await convertParams(Assignment, req.query);
    Assignment.find(filters.find)
        .where(filters.where)
        .sort(filters.sort)
        .skip(filters.start)
        .limit(filters.limit)
        .exec(function (err, assignments) {
            if (err) {
                res.status(400);
                res.send(err);
            };
            res.send(assignments);
        });
};
exports.findOne = function (req, res) {
    var id = req.params.id;
    Assignment.findOne({ _id: id })
        .exec(function (err, assignment) {
            if (err) {
                res.status(400);
                res.send(err);
            };
            res.send(assignment);
        });
};

exports.create = function (req, res) {
    var body = req.body;
    Assignment.create(body, function (err, assignment) {
        if (err) {
            res.status(400);
            res.send(err);
            console.log(err)
        };
        res.send(assignment);
    });
};

exports.update = function (req, res) {
    var body = req.body;
    Assignment.update({ _id: body._id }, body, function (err, assignment) {
        if (err) {
            res.status(400);
            res.send(err);
        };
        res.send(assignment);
    });
};

exports.delete = function (req, res) {
    var id = req.params.id;
    Assignment.deleteOne({ _id: id }, function (err, assignment) {
        if (err) {
            res.status(400);
            res.send(err);
        };
        res.send(assignment);
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