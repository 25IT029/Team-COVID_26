const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const Ride = require('./models/Ride');

const demoVehicles = [
  { name: 'Honda Activa', type: 'Scooter', location: 'Vesu, Surat', price: 80, rating: 4.7, image: 'https://dukaan.b-cdn.net/700x700/webp/media/257922e3-935a-42b9-8074-dc86daac2d84.jpeg' },
  { name: 'Yamaha FZ', type: 'Bike', location: 'Adajan, Surat', price: 100, rating: 4.8, image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80' },
  { name: 'Tata Tiago EV', type: 'Car', location: 'Citylight, Surat', price: 240, rating: 4.9, image: 'https://images10.gaadi.com/usedcar_image/BP2A.250605.031.A3/original/37e4c941-b5e9-4d07-bc3d-04100fbc6546.jpg' }
];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB || 'vroomy' });

  if (process.env.ADMIN_EMAIL && !await User.exists({ role: 'admin' })) {
    await User.create({
      name: process.env.ADMIN_NAME || 'VROOMY Admin',
      email: process.env.ADMIN_EMAIL.toLowerCase(),
      phone: process.env.ADMIN_PHONE || '',
      passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@12345', 10),
      role: 'admin',
      isVerified: true
    });
  }

  let owner = await User.findOne({ email: 'demo.owner@vroomy.local' });
  if (!owner) {
    owner = await User.create({
      name: 'VROOMY Demo Owner',
      email: 'demo.owner@vroomy.local',
      phone: '9999999999',
      passwordHash: await bcrypt.hash('Demo@12345', 10),
      role: 'owner',
      isVerified: true
    });
  }

  if (!await Vehicle.exists({ ownerId: owner._id })) {
    await Vehicle.insertMany(demoVehicles.map(v => ({ ...v, ownerId: owner._id, verified: true, status: 'available' })));
  }

  if (!await Ride.exists({ driverId: owner._id })) {
    await Ride.insertMany([
      { driverId: owner._id, driver: owner.name, from: 'Surat', to: 'Ahmedabad', date: new Date('2026-09-20'), time: '08:00', seats: 2, price: 300, rating: 4.8, vehicle: 'Hyundai Creta', status: 'approved' },
      { driverId: owner._id, driver: owner.name, from: 'Surat', to: 'Ahmedabad', date: new Date('2026-09-20'), time: '09:00', seats: 1, price: 280, rating: 4.7, vehicle: 'Maruti Baleno', status: 'approved' }
    ]);
  }

  console.log(`Seed complete. Database: ${mongoose.connection.name}`);
  console.log(`Admin: ${process.env.ADMIN_EMAIL}`);
  console.log('Demo owner: demo.owner@vroomy.local / Demo@12345');
  await mongoose.disconnect();
})().catch(e => {
  console.error('Seed failed:', e.message);
  process.exit(1);
});
