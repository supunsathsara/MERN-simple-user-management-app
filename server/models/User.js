const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  userType: { type: String, enum: ['ADMIN', 'USER'], required: true },
  status: { type: String, enum: ['ACTIVE', 'ONBOARD', 'INACTIVE'], required: true },
  basicInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'], required: true }
  },
  contactInfo: {
    mobileNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true }
  },
  authInfo: {
    password: { type: String, default: '' }
  }
});

// Hash password before saving
userSchema.pre('save', function(next) {
  if (!this.isModified('authInfo.password') || this.authInfo.password === '') return next();
  this.authInfo.password = bcrypt.hashSync(this.authInfo.password, 8);
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
