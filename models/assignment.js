var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var theme = {
    bgcolor : "#4da9d6"
}
var header = {
        blockA: {
            title : null,
            titleColor : null,
            subTitle : null,
            subTitleColor:null,
            image :null,
            icon :null,
            align:"left"
        },
        blockB: {
            title : null,
            titleColor : null,
            subTitle : null,
            subTitleColor:null,
            image :null,
            icon :null,
            align:"right"
        }
}
var footer = {
    title : null,
    color :null,
    description:null,
    image :null,
    icon :null
}
var finishOption = {
    thankYouPageWithLink : null,
    automericRedirection :null
}
var othersettings = {
    categorySort :null,
    language : "english",
    hidePreviousButton : false,
    singlePage : false
}

var assignmentSchema = new Schema({
    name: { type: String, required : true, valueType: "String" },
    course: { type: Schema.Types.ObjectId, ref: 'Course' },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    theme: { type: Object, default: theme },
    header: { type: Object, default: header },
    footer: { type: Object, default: footer },
    finishOption: { type: Object, default: finishOption },
    othersettings: { type: Object, default: othersettings },
    default: { type: Boolean, default: false }
}, { versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
// the schema is useless so far
// we need to create a model using it
var Assignment = mongoose.model('Assignment', assignmentSchema);

// make this available to our users in our Node applications
module.exports = Assignment;