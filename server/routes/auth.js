const express = require('express');
const router = express.Router();

// In-memory user storage (replace with database)
const users = [];
let nextUserId = 1;

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Demo user for testing
  if (username === 'demo' && password === 'demo') {
    const user = {
      id: 1,
      username: 'demo',
      email: 'demo@example.com'
    };
    return res.json({ user, token: 'demo-token' });
  }

  // Check existing users
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword, token: `token-${user.id}` });
});

// Register
router.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  // Basic validation
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Check if user already exists
  const existingUser = users.find(u => u.username === username || u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }

  // Create new user
  const newUser = {
    id: nextUserId++,
    username,
    email,
    password,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);

  // Remove password from response
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({ user: userWithoutPassword, token: `token-${newUser.id}` });
});

// Get current user profile
router.get('/profile', (req, res) => {
  // This would normally verify JWT token
  res.json({ message: 'Profile endpoint - implement JWT verification' });
});

module.exports = router;