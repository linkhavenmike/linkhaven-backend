const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Links endpoint' });
});

router.post('/', (req, res) => {
  res.status(201).json({ message: 'Create link endpoint' });
});

module.exports = router;