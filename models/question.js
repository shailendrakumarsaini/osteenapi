var mongoose = require('mongoose');

var Schema = mongoose.Schema;
// create a schema
var type = {
    layout : null
}

var questionSchema = new Schema({
    title: { type: String, required: true, valueType: "String" },
    ans_type: { type: String, required: true, valueType: "String" },
    ans_subtype: { type: String, required: true, valueType: "String" },
    type: { type: Object, default: type },
    answers_list: { type: Object, default: {} },
    course: { type: Schema.Types.ObjectId, ref: 'Course' },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    assignment: { type: Schema.Types.ObjectId, ref: 'Assignment' },
    add_star: { type: Boolean, default: false },
    label: [{ type: Schema.Types.ObjectId, ref: 'Label' }],
    answer: { type: Array, required: true, valueType: "Array" },
    attachments: { type: Array, required: true, valueType: "Array" }
}, { versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
// the schema is useless so far
// we need to create a model using it
var Question = mongoose.model('Question', questionSchema);

// make this available to our users in our Node applications
module.exports = Question;