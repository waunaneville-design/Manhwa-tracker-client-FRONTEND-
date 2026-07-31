const express = require('express');
const fetch = require('node-fetch');
const Manga = require('../models/Manga');
const jwt = require('jsonwebtoken');

const router = express.Router();

// middleware to check JWT
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// fetch external manhwa
router.get('/manga/external', async (req, res) => {
  try {
    const response = await fetch('https://api.mangadex.org/manga?limit=10');
    const data = await response.json();
    const formatted = data.data.map(item => ({
      id: item.id,
      title: item.attributes.title.en || 'Untitled',
      description: item.attributes.description?.en || '',
      status: item.attributes.status
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch external manga' });
  }
});

// add manga to user list
router.post('/manga/add', authMiddleware, async (req, res) => {
  const { externalId, title, coverUrl } = req.body;
  try {
    const manga = new Manga({ userId: req.user.id, externalId, title, coverUrl });
    await manga.save();
    res.json({ message: 'Manga added', manga });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add manga' });
  }
});

// get user’s manga list
router.get('/manga/user', authMiddleware, async (req, res) => {
  try {
    const list = await Manga.find({ userId: req.user.id });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user manga list' });
  }
});

module.exports = router;
