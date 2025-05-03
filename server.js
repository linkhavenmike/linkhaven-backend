const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

console.log('Starting server.js');

dotenv.config();

const app = express();

const winston = require('winston');
const logger = winston.createLogger({
  level: 'error',
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: 'error.log' })],
});

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    console.log('Incoming origin:', origin);
    const allowedOrigins = ['https://linkhaven.io', 'https://www.linkhaven.io', 'http://localhost:5173'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin || '*');
    } else {
      console.log('Origin not allowed:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Explicitly set CORS headers for all responses
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = ['https://linkhaven.io', 'https://www.linkhaven.io', 'http://localhost:5173'];
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  next();
});

app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Debug routes directory
console.log('Routes directory contents:', fs.readdirSync('./routes'));

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

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  logger.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});