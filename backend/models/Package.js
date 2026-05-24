const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, index: true },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination' },
  price: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  durationDays: { type: Number, default: 1 },
  itinerarySummary: [String],
  description: String,
  category: { type: String, enum: ['adventure','budget','luxury','honeymoon','family','other'], default: 'other' },
  tags: [String],
  images: [String],
  availableDates: [Date],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Package', packageSchema);
