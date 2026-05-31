const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// The new products array with real images
const products = [
  { 
    id: 1, 
    name: 'DevOps Coffee Mug', 
    price: 15.99, 
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=400&auto=format&fit=crop' 
  },
  { 
    id: 2, 
    name: 'Kubernetes T-Shirt', 
    price: 25.00, 
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400&auto=format&fit=crop' 
  },
  { 
    id: 3, 
    name: 'AWS ECS Sticker Pack', 
    price: 5.50, 
    image: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?q=80&w=400&auto=format&fit=crop' 
  },
  { 
    id: 4, 
    name: 'ArgoCD Captain Hat', 
    price: 18.00, 
    image: 'https://images.unsplash.com/photo-1556306535-0f09a536f01f?q=80&w=400&auto=format&fit=crop' 
  }
];

// Health Check (Used by Kubernetes HPA and Readiness Probes)
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'catalog-service' });
});

// Get all products
app.get('/api/catalog', (req, res) => {
  res.json(products);
});

// THIS IS THE CRITICAL PART THAT KEEPS THE POD ALIVE
app.listen(PORT, () => {
  console.log(`Catalog Service running on port ${PORT}`);
});