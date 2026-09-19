const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

function publicUser(user) {
  return { id: user._id.toString(), name: user.name, email: user.email, phone: user.phone || '', role: user.role, isVerified: user.isVerified };
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(409).json({ message: 'An account with this email already exists.' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, phone, passwordHash, role: role === 'owner' ? 'owner' : 'user' });
    const token = jwt.sign({ userId: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: publicUser(user) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { userId, email, password } = req.body;
    const login = (email || userId || '').trim().toLowerCase();
    if (!login || !password) return res.status(400).json({ message: 'Email/User ID and password are required.' });
    let user = await User.findOne({ email: login });
    if (!user && /^[a-f0-9]{24}$/i.test(login)) user = await User.findById(login);
    if (!user) return res.status(401).json({ message: 'Invalid login details.' });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Invalid login details.' });
    const token = jwt.sign({ userId: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: publicUser(user) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
