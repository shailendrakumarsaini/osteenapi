var mongoose = require('mongoose');

var Schema = mongoose.Schema;
// create a schema
var departmentSchema = new Schema({
    name: { type: String, default: 'default', valueType: "String" },
    organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
    default: { type: Boolean, default: false }
}, { versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
// the schema is useless so far
// we need to create a model using it
var Department = mongoose.model('Department', departmentSchema);

// make this available to our users in our Node applications
module.exports = Department;