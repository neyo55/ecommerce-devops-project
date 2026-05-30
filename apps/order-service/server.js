const express = require('express');
const amqp = require('amqplib');

const app = express();
const PORT = process.env.PORT || 3003;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq-service:5672';

let channel, connection;

async function connectToRabbitMQ() {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    
    const queue = 'order_queue';
    await channel.assertQueue(queue, { durable: true });
    
    console.log(`[*] Waiting for messages in ${queue}.`);
    
    // This function listens for new messages permanently
    channel.consume(queue, (msg) => {
      if (msg !== null) {
        const orderData = JSON.parse(msg.content.toString());
        console.log(`\n[x] Received New Order for user: ${orderData.username}`);
        console.log(`[x] Cart Items:`, orderData.items);
        
        // Simulate a 3-second payment processing delay
        setTimeout(() => {
          console.log(`[✓] Payment processed! Order complete for ${orderData.username}.`);
          
          // Acknowledge the message so RabbitMQ deletes it from the queue
          channel.ack(msg); 
        }, 3000);
      }
    });
  } catch (error) {
    console.error('RabbitMQ connection failed, retrying in 5 seconds...', error.message);
    setTimeout(connectToRabbitMQ, 5000);
  }
}

connectToRabbitMQ();

// A simple health check for Kubernetes
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'order-service' });
});

app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});