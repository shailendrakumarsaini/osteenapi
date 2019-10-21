var mongoose = require('mongoose');

var Schema = mongoose.Schema;
// create a schema
var emailSchema = new Schema({
    name: { type: String, unique: true, valueType: "String" },
    list: { type: Array, required: true, valueType: "Array" }
}, { versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
// the schema is useless so far
// we need to create a model using it
var Email = mongoose.model('Email', emailSchema);

// make this available to our users in our Node applications
module.exports = Email;