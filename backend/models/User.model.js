const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    city: { type: String, trim: true, default: 'Bengaluru', maxlength: 60 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
