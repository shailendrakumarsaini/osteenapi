var mongoose = require('mongoose');

var Schema = mongoose.Schema;
// create a schema
var labelSchema = new Schema({
    name: { type: String, required: true },
    color: { type: String, default: null },
    active: { type: Boolean, default: true }
}, { versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
// the schema is useless so far
// we need to create a model using it
var Label = mongoose.model('Label', labelSchema);

// make this available to our users in our Node applications
module.exports = Label;