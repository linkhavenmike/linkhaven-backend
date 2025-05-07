const express = require('express');
const router = express.Router();
const { parsePhoneNumber } = require('libphonenumber-js');
const User = require('../models/User');
const Link = require('../models/Link');

// POST /twilio/sms-inbound
router.post('/sms-inbound', async (req, res) => {
  const { From, Body } = req.body;

  try {
    if (!From || !Body) {
      return res
        .status(400)
        .type('text/xml')
        .send(`<Response><Message>Missing phone or message body.</Message></Response>`);
    }

    const phone = parsePhoneNumber(From)?.format('E.164') || From;
    const url = Body.trim();

    let user = await User.findOne({ phone });

    if (!user) {
      user = await User.create({
        phone,
        provisional: true,
        createdAt: new Date(),
      });
    }

    await Link.create({
      userId: user._id,
      url,
      source: 'sms',
      createdAt: new Date(),
    });

    return res
      .status(200)
      .type('text/xml')
      .send(`<Response><Message>✅ Link saved! Visit linkhaven.io/dashboard</Message></Response>`);
  } catch (err) {
    console.error('Error handling SMS:', err);
    return res
      .status(500)
      .type('text/xml')
      .send(`<Response><Message>⚠️ Error saving your link. Try again later.</Message></Response>`);
  }
});

module.exports = router;
