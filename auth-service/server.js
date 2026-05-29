const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Configure PostgreSQL connection using environment variables
const pool = new Pool({
  host: process.env.DB_HOST || 'auth-db-service',
  user: process.env.DB_USER || 'postgres_user',
  password: process.env.DB_PASSWORD, // Injected via K8s Secret
  database: process.env.DB_DATABASE || 'auth_db',
  port: 5432,
});

// Initialize database table
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL
      );
    `);
    console.log('Database table initialized successfully.');
  } catch (err) {
    console.error('Database initialization failed:', err.message);
  }
};
initDb();

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'auth-service' });
});

// Register Endpoint
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  try {
    // Note: In real production, hash the password using bcrypt before saving!
    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, password]);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login Endpoint
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate JWT token valid for 1 hour
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});