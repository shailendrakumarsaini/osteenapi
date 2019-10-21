var mongoose = require('mongoose');

var Schema = mongoose.Schema;
// create a schema
var notificationSchema = new Schema({
    identity: { type: String, valueType: "String" },
    from: { type: String, valueType: "String" },
    to: { type: Array, required: true, valueType: "Array" },
    subject: { type: String, required: true, valueType: "String" },
    data: { type: String, required: true, valueType: "String" },
    template: { type: String, valueType: "String" },
    send_status: { type: String, valueType: "String", default: null },
    sent_time: { type: Date, default: null },
    scheduled: { type: Boolean, default: false },
    scheduled_time: { type: Object, valueType: "Object" },
    scheduled_type: { type: String, valueType: "String" },
}, { versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
// the schema is useless so far
// we need to create a model using it
var Notification = mongoose.model('Notification', notificationSchema);

// make this available to our users in our Node applications
module.exports = Notification;