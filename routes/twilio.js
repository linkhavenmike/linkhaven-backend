const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/twilio/opt-in
router.post('/opt-in', async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  try {
    // Optional: Add phone number normalization/validation here
    const existingUser = await User.findOne({ phone });

    if (existingUser && existingUser.smsOptedIn) {
      return res.status(200).json({ message: 'Already opted in' });
    }

    // Either update existing user or create a new one
    const user = await User.findOneAndUpdate(
      { phone },
      { phone, smsOptedIn: true },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: 'Successfully opted in for SMS', user });
  } catch (err) {
    console.error('SMS opt-in failed:', err);
    res.status(500).json({ message: 'Failed to opt in for SMS' });
  }
});

module.exports = router;
