import { useState, useEffect } from 'react'

function App() {
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  
  // Authentication State
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  // 1. Fetch products from the Catalog Service
  useEffect(() => {
    fetch('/api/catalog')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Error fetching catalog:", err));
      
    // If logged in, fetch their specific cart
    if (token) {
      // Decode username from JWT (Basic implementation for UI purposes)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        fetch(`/api/cart/${payload.username}`)
          .then(res => res.json())
          .then(data => setCartCount(data.length || 0))
          .catch(err => console.error("Error fetching cart:", err));
      } catch (e) {
        console.error("Invalid token format");
      }
    }
  }, [token]);

  // 2. Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        setAuthMessage('');
      } else {
        setAuthMessage(data.error || 'Login failed');
      }
    } catch (err) {
      setAuthMessage('Server error. Please try again.');
    }
  };

  // 3. Handle Logout
  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setCartCount(0);
    setUsername('');
    setPassword('');
  };

  // 4. Add item to the Stateful Cart Service
  const addToCart = (product) => {
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    fetch(`/api/cart/${payload.username}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ product })
    })
    .then(res => res.json())
    .then(data => {
      setCartCount(data.cart.length);
    })
    .catch(err => console.error("Error adding to cart:", err));
  };

  // --- RENDER LOGIN SCREEN IF NO TOKEN ---
  if (!token) {
    return (
      <div style={{ fontFamily: 'system-ui, sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ textAlign: 'center', color: '#2563eb', marginBottom: '1.5rem' }}>🔐 DevOps Swag Login</h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="text" 
              placeholder="Username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
              required 
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
              required 
            />
            <button type="submit" style={{ padding: '0.75rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Secure Login
            </button>
            {authMessage && <p style={{ color: '#ef4444', textAlign: 'center', margin: 0 }}>{authMessage}</p>}
          </form>
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
            Use the user you registered via cURL!
          </p>
        </div>
      </div>
    );
  }

  // --- RENDER STOREFRONT IF LOGGED IN ---
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: '900px', margin: '0 auto', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <header style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: '1.5rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#2563eb', margin: 0, fontSize: '2.5rem' }}>🛒 DevOps Swag Store</h1>
          <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0', fontSize: '1.1rem' }}>Fully deployed via GitOps & ArgoCD</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', backgroundColor: '#e5e7eb', padding: '0.5rem 1rem', borderRadius: '8px' }}>
            Cart: {cartCount}
          </div>
          <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            Logout
          </button>
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