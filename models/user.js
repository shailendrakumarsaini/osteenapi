var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// const bcrypt = require('mongoose-bcrypt');
var bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 10;

var userSchema = new Schema({
    first_name: { type: String, required: true, valueType: "String", default: null },
    last_name: { type: String, required: true, valueType: "String", default: null },
    // organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
    organization: { type: String, required: true, valueType: "String", default: null },
    // username: { type: String, valueType: "String", },
    password: { type: String, required: true, bcrypt: true },
    role: { type: Schema.Types.ObjectId, ref: 'Roles', default: null },
    mobile: { type: String, valueType: "String", default: null },
    email: { type: String, required: true, unique: true, valueType: "String" },
    secondaryEmail: { type: String, required: false, valueType: "String", default: null },
    // department: { type: Schema.Types.ObjectId, ref: 'Department' },
    location: { type: String, required: true, valueType: "String", default: null },
    image: { type: String, valueType: "String", default: null },
    isActive: { type: Boolean, default: false, valueType: "Boolean" },
    isApproved: { type: Boolean, default: false, valueType: "Boolean" },
    course: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    category: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    fromdate: { type: String, valueType: "String", default: null },
    todate: { type: String, valueType: "String", default: null },
}, { versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });


userSchema.pre('save', function (next) {
    var user = this;
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;