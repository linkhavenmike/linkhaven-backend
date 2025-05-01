const { authMiddleware } = require('./utils/auth');
const LINKS_FILE = './links.json';
const express = require('express');
const app = express();
const cors = require('cors');
const allowedOrigins = ['https://linkhaven.io', 'https://linkhaven-frontend.vercel.app'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const USERS_FILE = './users.json';
const SECRET = 'supersecret'; // replace later with an env var

app.use(express.json()); // Parse JSON request bodies

// Health check
app.get('/', (req, res) => {
  res.send('✅ Link Haven backend is running');
});

// Signup route
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;

  let users = [];
  if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8') || '[]');
  }

  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = { email, passwordHash, createdAt: new Date().toISOString() };
  users.push(user);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

  const token = jwt.sign({ email }, SECRET, { expiresIn: '7d' });
  res.json({ token });
});

// Login route (moved OUTSIDE of signup)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!fs.existsSync(USERS_FILE)) {
    return res.status(400).json({ message: 'No users found' });
  }

  const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8') || '[]');
  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({ email }, SECRET, { expiresIn: '7d' });
  res.json({ token });
});
app.get('/api/links', authMiddleware(SECRET), (req, res) => {
    const links = fs.existsSync(LINKS_FILE)
      ? JSON.parse(fs.readFileSync(LINKS_FILE, 'utf8') || '[]')
      : [];
  
    const userLinks = links.filter((link) => link.email === req.user.email);
    res.json(userLinks);
  });
  app.post('/api/links', authMiddleware(SECRET), (req, res) => {
    const { url, source, category } = req.body;
  
    if (!url || !url.startsWith('http')) {
      return res.status(400).json({ message: 'Invalid URL format' });
    }
  
    const links = fs.existsSync(LINKS_FILE)
      ? JSON.parse(fs.readFileSync(LINKS_FILE, 'utf8') || '[]')
      : [];
  
    const newLink = {
      email: req.user.email,
      url,
      source: source || 'web',
      category: category || '',
      createdAt: new Date().toISOString()
    };
  
    links.push(newLink);
    fs.writeFileSync(LINKS_FILE, JSON.stringify(links, null, 2));
  
    res.status(201).json({ message: 'Link saved', link: newLink });
  });  

  
  // Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});

