const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true, sparse: true },
  password: { type: String },
  googleId: { type: String },
  phone: { type: String, unique: true, sparse: true },
  role: { type: String, enum: ['user','admin','agent'], default: 'user' },
  preferences: { type: mongoose.Schema.Types.Mixed, default: {} },
  pastTrips: { type: Array, default: [] },
  otp: { code: String, expiresAt: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
