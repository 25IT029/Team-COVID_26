const mongoose = require('mongoose');
const rideSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  driver: { type: String, required: true },
  from: { type: String, required: true, trim: true, index: true },
  to: { type: String, required: true, trim: true, index: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  seats: { type: Number, required: true, min: 1, max: 6 },
  price: { type: Number, required: true, min: 1 },
  rating: { type: Number, default: 5 },
  vehicle: { type: String, required: true }
}, { timestamps: true });
module.exports = mongoose.model('Ride', rideSchema);
