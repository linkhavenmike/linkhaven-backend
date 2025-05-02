const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const linkRoutes = require('./routes/links');

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
  origin: ['https://linkhaven.io', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api/links', linkRoutes);

// Health check endpoint
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  logger.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.get('/', (req, res) => res.json({ message: 'Server is running' }));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});