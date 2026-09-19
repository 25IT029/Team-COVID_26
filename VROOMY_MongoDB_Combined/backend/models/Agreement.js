const mongoose = require('mongoose');

const agreementSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true, index: true },
  agreementId: { type: String, required: true, unique: true, index: true },
  renterName: { type: String, required: true },
  renterEmail: { type: String, required: true },
  ownerName: { type: String, required: true },
  ownerEmail: { type: String, required: true },
  vehicleName: { type: String, required: true },
  vehicleNumberPlate: { type: String, default: '' },
  pickupDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },
  rentalAmount: { type: Number, required: true },
  paymentStatus: { type: String, default: 'PAID' },
  acceptedByUser: { type: Boolean, default: true },
  acceptedAt: { type: Date, default: Date.now },
  termsVersion: { type: String, default: 'v1' }
}, { timestamps: true });

module.exports = mongoose.model('Agreement', agreementSchema);
