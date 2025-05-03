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

// Define CORS options with dynamic origin function
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like curl, mobile apps)
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

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

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