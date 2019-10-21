var mongoose = require('mongoose');

var Schema = mongoose.Schema;
// create a schema
var courseSchema = new Schema({
    name: { type: String, default: 'default', valueType: "String" },
    default: { type: Boolean, default: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    duration: { type: String, default: 'default', valueType: "String" }
}, { versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
// the schema is useless so far
// we need to create a model using it
var Course = mongoose.model('Course', courseSchema);

// make this available to our users in our Node applications
module.exports = Course;