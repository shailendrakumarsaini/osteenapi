var mongoose = require('mongoose');

var Schema = mongoose.Schema;
// create a schema
var categorySchema = new Schema({
    name: { type: String, default: 'default', valueType: "String" },
    color: { type: String, default: 'default', valueType: "String" },
    default: { type: Boolean, default: true },
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }]
}, { versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
// the schema is useless so far
// we need to create a model using it
var Category = mongoose.model('Category', categorySchema);

// make this available to our users in our Node applications
module.exports = Category;