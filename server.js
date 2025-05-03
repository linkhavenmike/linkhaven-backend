const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

console.log('Starting server.js');

dotenv.config();

const app = express();

// Define allowed origins
const allowedOrigins = [
  'https://www.linkhaven.io',
  'https://linkhaven.io',
  'http://localhost:3000' // For local development
];

// Force CORS headers manually for all responses
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Fix: send dummy body instead of using .sendStatus(204)
  if (req.method === 'OPTIONS') {
    return res.status(204).send('ok');
  }

  next();
});

// THEN: Use cors middleware for other requests
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Load routes
console.log('Attempting to load routes');
const authRoutes = require(path.join(__dirname, 'routes', 'auth'));
const linkRoutes = require(path.join(__dirname, 'routes', 'links'));
console.log('authRoutes loaded:', authRoutes);
console.log('linkRoutes loaded:', linkRoutes);

// Routes
app.use('/api', authRoutes);
console.log('Mounted /api routes');
app.use('/api/links', linkRoutes);
console.log('Mounted /api/links routes');

// Health check endpoint
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Root endpoint
app.get('/', (req, res) => res.json({ message: 'Server is running' }));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
