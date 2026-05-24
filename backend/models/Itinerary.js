const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  time: String,
  title: String,
  description: String,
  location: { lat: Number, lng: Number, name: String },
  cost: { type: Number, default: 0 },
  durationMinutes: Number,
  tags: [String]
});

const daySchema = new mongoose.Schema({
  dayNumber: Number,
  summary: String,
  activities: [activitySchema],
  weather: mongoose.Schema.Types.Mixed
});

const itinerarySchema = new mongoose.Schema({
  title: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
  days: [daySchema],
  estimatedCost: { type: Number, default: 0 },
  estimatedTimeMinutes: { type: Number, default: 0 },
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  sharedToken: { type: String },
  isPublic: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Itinerary', itinerarySchema);
