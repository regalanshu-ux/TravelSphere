const mongoose = require('mongoose');

const attractionSchema = new mongoose.Schema({
  name: String,
  description: String,
  location: { lat: Number, lng: Number },
  tags: [String]
});

const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: String,
  city: String,
  description: String,
  category: { type: String, enum: ['adventure','budget','luxury','honeymoon','family','other'], default: 'other' },
  tags: [String],
  attractions: [attractionSchema],
  images: [String],
  meta: { popularity: Number, rating: Number }
}, { timestamps: true });

module.exports = mongoose.model('Destination', destinationSchema);
