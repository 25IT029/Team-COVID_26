const mongoose = require('mongoose');
const agreementSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  acceptedByUser: { type: Boolean, default: false },
  acceptedAt: Date,
  termsVersion: { type: String, default: 'v1' }
}, { timestamps: true });
module.exports = mongoose.model('Agreement', agreementSchema);
