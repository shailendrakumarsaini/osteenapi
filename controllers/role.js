var Role = require('../models/role');
var config = require('../config')
var _ = require('lodash');

exports.list = async function (req, res) {
    var filters = await convertParams(Role, req.query);
    Role.find(filters.find)
        .where(filters.where)
        .sort(filters.sort)
        .skip(filters.start)
        .limit(filters.limit)
        .exec(function (err, roles) {
            if (err) { res.status(400); res.send(err); };
            res.send(roles);
        });
};
exports.findOne = function (req, res) {
    var id = req.params.id;
    Role.findOne({ _id: id })
        .exec(function (err, role) {
            if (err) { res.status(400); res.send(err); };
            res.send(role);
        });
};

exports.create = function (req, res) {
    var body = req.body;
    Role.create(body, function (err, role) {
        if (err) { res.status(400); res.send(err); };
        res.send(role);
    });
};

exports.update = function (req, res) {
    var body = req.body;
    Role.update({ _id: body._id }, body, function (err, role) {
        if (err) { res.status(400); res.send(err); };
        res.send(role);
    });
};

exports.delete = function (req, res) {
    var id = req.params.id;
    Role.deleteOne({ _id: id }, function (err, role) {
        if (err) { res.status(400); res.send(err); };
        res.send(role);
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