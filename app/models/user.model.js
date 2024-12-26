// models/user.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobile: { type: String, required: true },
    designation: { type: String, required: true },
    empId: { type: String, required: true, unique: true },
    userType: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    twoFactorSecret: { type: String },
    isTwoFactorEnabled: { type: Boolean, default: false },
    refreshToken: { type: String },
    role: { type: String, enum: ['Admin', 'Manager', 'TeamLead', 'Executive'], default: 'Executive' },
    languagePermissions: [{ type: String }],
    profile_image: {type: String, required: false},
    last_logged_in: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    report_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

// Middleware to hash the password before saving
userSchema.pre('save', async function (next) {
    try {
        if (!this.isModified('password')) {
            return next();
        }
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        console.log(error)
        next(err);
    }
});

userSchema.method("toJSON", function() {
    const {_id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

const User = mongoose.model('User', userSchema);
module.exports = User;
