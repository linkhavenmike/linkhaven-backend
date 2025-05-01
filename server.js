const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const Link = require('./models/Link');

const app = express();

// ✅ CORS Configuration - Simplified but robust approach
const allowedOrigins = [
  'https://linkhaven.io',
  'https://linkhaven-frontend.vercel.app',
  'http://localhost:5173'
];

// Setup CORS before any other middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Always allow OPTIONS requests for CORS preflight
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.status(204).end();
  }
  
  // Set CORS headers for all other requests
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  next();
});

// Regular middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Link Haven API is running' });
});

// API Routes
app.get('/api/links', async (req, res) => {
  try {
    const links = await Link.find().sort({ createdAt: -1 }).limit(20);
    res.json(links);
  } catch (err) {
    console.error('Error fetching links:', err);
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
    console.error('Error saving link:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// User signup endpoint
app.post('/api/signup', async (req, res) => {
  try {
    // Your signup logic here
    const { username, email, password } = req.body;
    
    // For demonstration purposes
    console.log('User signup attempt:', { username, email });
    
    // Return a success response
    res.status(201).json({ message: 'User registered successfully' });
    
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Catch-all route
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Server startup error:', err);
    process.exit(1);
  }
};

startServer();