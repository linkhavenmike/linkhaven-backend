console.log('links.js loaded');
const express = require('express');
const router = express.Router();
const Link = require('../models/Link');
const auth = require('../middleware/auth');

// GET /api/links — fetch links for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const links = await Link.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(links);
  } catch (err) {
    console.error('Error fetching links:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// POST /api/links — create a new link
router.post('/', auth, async (req, res) => {
  try {
    const { url, source, category } = req.body;

    if (!url || !source) {
      return res.status(400).json({ message: 'URL and source are required' });
    }

    const newLink = new Link({
      url,
      source,
      category,
      user: req.user.id
    });

    await newLink.save();
    res.status(201).json(newLink);
  } catch (err) {
    console.error('Error saving link:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
