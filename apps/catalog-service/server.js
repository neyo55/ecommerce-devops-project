const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Neyo55 Store Inventory (Now with 6 Items)
const products = [
  { 
    id: 1, 
    name: 'iPhone 15 Pro Max - 256GB', 
    price: 1199.00, 
    originalPrice: 1300.00,
    discount: '-8%',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=400&auto=format&fit=crop' 
  },
  { 
    id: 2, 
    name: 'Samsung 65" 4K Smart UHD TV', 
    price: 650.00, 
    originalPrice: 850.00,
    discount: '-23%',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=400&auto=format&fit=crop' 
  },
  { 
    id: 3, 
    name: '20000mAh Fast Charge Power Bank', 
    price: 15.99, 
    originalPrice: 25.00,
    discount: '-36%',
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?q=80&w=400&auto=format&fit=crop' 
  },
  { 
    id: 4, 
    name: 'Double Door Fridge 70L', 
    price: 250.00, 
    originalPrice: 310.00,
    discount: '-19%',
    image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?q=80&w=400&auto=format&fit=crop' 
  },
  { 
    id: 5, 
    name: 'Sony WH-1000XM5 Headphones', 
    price: 348.00, 
    originalPrice: 398.00,
    discount: '-12%',
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400&auto=format&fit=crop' 
  },
  { 
    id: 6, 
    name: 'Apple MacBook Pro M3 14"', 
    price: 1599.00, 
    originalPrice: 1799.00,
    discount: '-11%',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=400&auto=format&fit=crop' 
  }
];

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'catalog-service' });
});

// Get all products
app.get('/api/catalog', (req, res) => {
  res.json(products);
});

// THIS KEEPS THE POD ALIVE
app.listen(PORT, () => {
  console.log(`Catalog Service running on port ${PORT}`);
});
