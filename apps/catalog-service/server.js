const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// The product database (hardcoded for this stateless service)
const products = [
  { id: 1, name: 'DevOps Coffee Mug', price: 15.99, icon: '☕' },
  { id: 2, name: 'Kubernetes T-Shirt', price: 25.00, icon: '👕' },
  { id: 3, name: 'AWS ECS Sticker Pack', price: 5.50, icon: '🏷️' },
  { id: 4, name: 'ArgoCD Captain Hat', price: 18.00, icon: '🐙' }
];

app.get('/api/catalog', (req, res) => {
    res.json(products);
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'catalog-service' });
});

app.listen(PORT, () => {
    console.log(`Catalog service running on port ${PORT}`);
});