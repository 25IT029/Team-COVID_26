require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicles');
const bookingRoutes = require('./routes/bookings');
const rideRoutes = require('./routes/rides');
const adminRoutes = require('./routes/admin');
const { sendTestEmail } = require('./email');
const { requireAuth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..')));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Sends only to TEST_EMAIL from .env. This is intended for safe setup checks.
app.post('/api/email/test', requireAuth, async (req, res) => {
  try {
    const result = await sendTestEmail();
    res.json({ message: 'Test email sent successfully.', id: result.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api/*', (req, res) => res.status(404).json({ message: 'API endpoint not found.' }));

async function start() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is missing. Create .env from .env.example.');
    process.exit(1);
  }
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is missing from .env.');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');
  console.log('VROOMY running at http://localhost:' + PORT);
  app.listen(PORT);
}
start().catch(err => {
  console.error('MongoDB connection failed:', err.message);
  process.exit(1);
});
