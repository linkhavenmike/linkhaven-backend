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

// Configure CORS middleware
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

// Apply CORS headers to all responses
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

// ✅ Global Preflight OPTIONS Handler
app.options('*', (req, res) => {
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

// Add missing signup endpoint with proper CORS handling
app.post('/api/signup', async (req, res) => {
  try {
    // Your signup logic here
    const { username, email, password } = req.body;
    
    // For demonstration purposes only:
    console.log('User signup attempt:', { username, email });
    
    // Return a success response
    res.status(201).json({ message: 'User registered successfully' });
    
  } catch (err) {
    console.error('❌ Error during signup:', err);
    res.status(500).json({ error: 'Signup failed' });
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