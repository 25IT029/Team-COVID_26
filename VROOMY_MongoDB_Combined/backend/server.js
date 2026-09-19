const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const app = express();
const PORT = Number(process.env.PORT || 5000);
const DB_NAME = process.env.MONGODB_DB || 'vroomy';

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '8mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..'), {
  etag: false,
  setHeaders: (res) => res.setHeader('Cache-Control', 'no-store')
}));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    databaseName: mongoose.connection.name || DB_NAME,
    host: '0.0.0.0',
    port: PORT
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/ride-bookings', require('./routes/rideBookings'));
app.use('/api/rides', require('./routes/rides'));
app.use('/api/admin', require('./routes/admin'));

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API endpoint not found.' });
  }
  res.status(404).sendFile(path.join(__dirname, '..', 'index.html'));
});

async function ensureInitialAdmin() {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) return;
  const exists = await User.exists({ role: 'admin' });
  if (exists) return;

  await User.create({
    name: process.env.ADMIN_NAME || 'VROOMY Admin',
    email: process.env.ADMIN_EMAIL.toLowerCase().trim(),
    phone: process.env.ADMIN_PHONE || '',
    passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
    role: 'admin',
    isVerified: true
  });
  console.log(`Initial admin created: ${process.env.ADMIN_EMAIL}`);
}

async function start() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is missing. Put it in backend/.env');
    process.exit(1);
  }
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is missing. Put it in backend/.env');
    process.exit(1);
  }

  // Explicit dbName prevents Mongoose from silently using MongoDB's default "test" database.
  await mongoose.connect(process.env.MONGODB_URI, { dbName: DB_NAME });
  await ensureInitialAdmin();

  console.log(`MongoDB connected → database: ${mongoose.connection.name}`);
  console.log(`VROOMY running on http://localhost:${PORT}`);
  console.log(`LAN access: http://<HOST-IP>:${PORT}`);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on 0.0.0.0:${PORT}`);
  });
}

start().catch((e) => {
  console.error('Server startup failed:', e.message);
  process.exit(1);
});
