const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001; // 12-Factor App rule: Externalize config

app.use(cors());
app.use(express.json());

// Mandatory Health Check Endpoint for Kubernetes/AWS ECS
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'catalog-service' });
});

// Mock Product Data
app.get('/products', (req, res) => {
    res.json([
        { id: 1, name: 'DevOps Coffee Mug', price: 15.99 },
        { id: 2, name: 'Kubernetes T-Shirt', price: 25.00 },
        { id: 3, name: 'AWS ECS Sticker Pack', price: 5.50 }
    ]);
});

app.listen(PORT, () => {
    console.log(`Catalog service running on port ${PORT}`);
});