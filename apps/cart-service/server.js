const express = require('express');
const { createClient } = require('redis');
const amqp = require('amqplib');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3002;
const REDIS_URL = process.env.REDIS_URL || 'redis://redis-service:6379';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq-service:5672';

// --- Redis Setup ---
const redisClient = createClient({ url: REDIS_URL });
redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect().then(() => console.log('Connected to Redis'));

// --- RabbitMQ Setup ---
let rabbitChannel;
async function connectToRabbitMQ() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    rabbitChannel = await connection.createChannel();
    await rabbitChannel.assertQueue('order_queue', { durable: true });
    console.log('Connected to RabbitMQ');
  } catch (error) {
    console.error('RabbitMQ connection failed, retrying...', error.message);
    setTimeout(connectToRabbitMQ, 5000);
  }
}
connectToRabbitMQ();

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'cart-service' });
});

// Get Cart
app.get('/api/cart/:username', async (req, res) => {
  const { username } = req.params;
  const cartData = await redisClient.get(username);
  res.json(cartData ? JSON.parse(cartData) : []);
});

// Add to Cart
app.post('/api/cart/:username', async (req, res) => {
  const { username } = req.params;
  const { product } = req.body;
  
  const cartData = await redisClient.get(username);
  const cart = cartData ? JSON.parse(cartData) : [];
  
  cart.push(product);
  await redisClient.set(username, JSON.stringify(cart));
  
  res.json({ message: 'Item added', cart });
});

// Checkout Endpoint (The Event Producer)
app.post('/api/cart/:username/checkout', async (req, res) => {
  const { username } = req.params;
  
  try {
    const cartData = await redisClient.get(username);
    const cart = cartData ? JSON.parse(cartData) : [];
    
    if (cart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Create the order payload
    const orderPayload = {
      username: username,
      items: cart,
      timestamp: new Date().toISOString()
    };

    // Send the payload to RabbitMQ
    rabbitChannel.sendToQueue(
      'order_queue', 
      Buffer.from(JSON.stringify(orderPayload)), 
      { persistent: true }
    );
    
    // Clear the user's cart in Redis
    await redisClient.del(username);
    
    res.json({ message: 'Checkout successful! Order is processing.' });
  } catch (error) {
    res.status(500).json({ error: 'Checkout failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Cart Service running on port ${PORT}`);
});