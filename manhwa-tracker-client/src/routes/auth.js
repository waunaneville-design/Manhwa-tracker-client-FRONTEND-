const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// signup
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });

  try {
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ username, passwordHash: hash });
    await user.save();

    res.json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

module.exports = router;
