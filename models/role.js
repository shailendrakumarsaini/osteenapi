var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// create a schema
var rolesSchema = new Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    description: String
}, { versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
// the schema is useless so far
// we need to create a model using it
var Roles = mongoose.model('Roles', rolesSchema);

// make this available to our users in our Node applications
module.exports = Roles;