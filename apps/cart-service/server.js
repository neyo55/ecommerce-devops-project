const express = require('express');
const cors = require('cors');
const { createClient } = require('redis');

const app = express();
const PORT = process.env.PORT || 3002;

// 12-Factor App: Read Redis URL from environment variables
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

app.use(cors());
app.use(express.json());

// Initialize Redis Client
const redisClient = createClient({ url: REDIS_URL });
redisClient.on('error', (err) => console.error('Redis Client Error', err));

// Connect to Redis before starting the API
redisClient.connect().then(() => {
    console.log(`Connected to Redis at ${REDIS_URL}`);
}).catch(console.error);

// Mandatory Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'cart-service', redis: redisClient.isOpen ? 'CONNECTED' : 'DISCONNECTED' });
});

// Add item to cart
app.post('/api/cart/:userId', async (req, res) => {
    const { userId } = req.params;
    const { product } = req.body;
    
    // Fetch current cart or create empty array
    const currentCartData = await redisClient.get(`cart:${userId}`);
    const cart = currentCartData ? JSON.parse(currentCartData) : [];
    
    cart.push(product);
    
    // Save back to Redis
    await redisClient.set(`cart:${userId}`, JSON.stringify(cart));
    res.json({ message: 'Item added', cart });
});

// Get user cart
app.get('/api/cart/:userId', async (req, res) => {
    const { userId } = req.params;
    const cartData = await redisClient.get(`cart:${userId}`);
    res.json(cartData ? JSON.parse(cartData) : []);
});

app.listen(PORT, () => {
    console.log(`Cart service running on port ${PORT}`);
});