const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const Link = require('./models/Link');

const app = express();

// ✅ Robust CORS Configuration
const allowedOrigins = [
  'https://linkhaven.io',
  'https://linkhaven-frontend.vercel.app',
  'http://localhost:5173' // useful for local dev
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// ✅ Global Preflight OPTIONS Handler
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  return res.sendStatus(204);
});

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.get('/api/links', async (req, res) => {
  try {
    const links = await Link.find().sort({ createdAt: -1 }).limit(20);
    res.json(links);
  } catch (err) {
    console.error('❌ Error fetching links:', err);
    res.status(500).json({ error: 'Failed to fetch links' });
  }
});

app.post('/api/links', async (req, res) => {
  try {
    const { url, source, category } = req.body;

    if (!url || !source) {
      return res.status(400).json({ error: 'url and source are required' });
    }

    const link = await Link.create({ url, source, category });
    res.status(201).json(link);
  } catch (err) {
    console.error('❌ Error saving link:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// ✅ MongoDB + Server
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
 