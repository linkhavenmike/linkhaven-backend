const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();
console.log('Starting server.js');

// ----- CORS -----
const allowedOrigins = [
  'https://www.linkhaven.io',
  'https://linkhaven.io',
  'http://localhost:3000'
];

// Handle preflight and custom CORS headers manually
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('ok');
  }

  next();
});

// Also use cors middleware for any future dynamic handling
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ----- Body Parsers -----
app.use(express.json()); // For JSON APIs
app.use(express.urlencoded({ extended: false })); // For form-encoded (e.g. Twilio SMS)

// ----- Route Imports -----
console.log('Loading routes...');
const authRoutes = require('./routes/auth');
const linkRoutes = require('./routes/links');
const twilioRoutes = require('./routes/twilio');

// ----- Mount Routes -----
app.use('/api', authRoutes);
app.use('/api/links', linkRoutes);
app.use('/twilio', twilioRoutes);
console.log('Routes mounted');

// ----- Health Checks -----
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/', (req, res) => res.json({ message: 'Server is running' }));

// ----- MongoDB Connection -----
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ----- Start Server -----
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
