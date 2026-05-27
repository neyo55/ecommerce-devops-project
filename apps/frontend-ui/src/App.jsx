import { useState, useEffect } from 'react'

function App() {
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  // 1. Fetch products from the Catalog Service when the page loads
  useEffect(() => {
    fetch('/api/catalog')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Error fetching catalog:", err));
      
    // Fetch initial cart count (assuming a hardcoded user ID of 'user123' for now)
    fetch('/api/cart/user123')
      .then(res => res.json())
      .then(data => setCartCount(data.length))
      .catch(err => console.error("Error fetching cart:", err));
  }, []);

  // 2. Add item to the Stateful Cart Service when button is clicked
  const addToCart = (product) => {
    fetch('/api/cart/user123', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product })
    })
    .then(res => res.json())
    .then(data => {
      setCartCount(data.cart.length);
      alert(`Added ${product.name} to cart!`);
    })
    .catch(err => console.error("Error adding to cart:", err));
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: '900px', margin: '0 auto', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <header style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: '1.5rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#2563eb', margin: 0, fontSize: '2.5rem' }}>🛒 DevOps Swag Store</h1>
          <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0', fontSize: '1.1rem' }}>Fully deployed via GitOps & ArgoCD</p>
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', backgroundColor: '#e5e7eb', padding: '0.5rem 1rem', borderRadius: '8px' }}>
          Cart: {cartCount}
        </div>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {products.length === 0 ? <p>Loading products from backend...</p> : 
          products.map(product => (
            <div key={product.id} style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{product.icon}</div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>{product.name}</h3>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#10b981', fontSize: '1.25rem' }}>${product.price.toFixed(2)}</p>
              <button 
                onClick={() => addToCart(product)}
                style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
                Add to Cart
              </button>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default App