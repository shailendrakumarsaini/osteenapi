var mongoose = require('mongoose');

var Schema = mongoose.Schema;
// create a schema
var orgSchema = new Schema({
    name: { type: String, required: true },
    org_id: { type: String, required: true, unique: true },
    active: { type: Boolean, default: true }
}, { versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
// the schema is useless so far
// we need to create a model using it
var Organization = mongoose.model('Organization', orgSchema);

// make this available to our users in our Node applications
module.exports = Organization;