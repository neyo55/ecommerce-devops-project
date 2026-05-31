import { useState, useEffect } from 'react'

function App() {
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  useEffect(() => {
    fetch('/api/catalog')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Error fetching catalog:", err));
      
    if (token) {
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

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setCartCount(0);
    setUsername('');
    setPassword('');
  };

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

  const handleCheckout = () => {
    if (cartCount === 0) return alert("Your cart is empty!");
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    fetch(`/api/cart/${payload.username}/checkout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      alert("🎉 " + data.message);
      setCartCount(0);
    })
    .catch(err => console.error("Error during checkout:", err));
  };

  if (!token) {
    return (
      <div style={{ fontFamily: 'system-ui, sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f3f4f6' }}>
        <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ textAlign: 'center', color: '#111827', marginBottom: '0.5rem', fontSize: '2rem' }}>DevOps Swag</h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '2rem' }}>Sign in to gear up</p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} style={{ padding: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem' }} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem' }} required />
            <button type="submit" style={{ padding: '0.85rem', backgroundColor: '#000', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem' }}>Secure Login</button>
            {authMessage && <p style={{ color: '#ef4444', textAlign: 'center', margin: 0, fontWeight: '500' }}>{authMessage}</p>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Navigation */}
      <nav style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', padding: '1rem 2rem', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ color: '#111827', margin: 0, fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px' }}>DevOps Swag</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ fontSize: '1rem', fontWeight: '600', color: '#374151' }}>
              🛒 Cart ({cartCount})
            </div>
            <button onClick={handleCheckout} style={{ padding: '0.6rem 1.2rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', transition: 'background-color 0.2s' }}>
              Checkout
            </button>
            <button onClick={handleLogout} style={{ padding: '0.6rem 1.2rem', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <div style={{ backgroundColor: '#111827', color: 'white', padding: '4rem 2rem', textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '3rem', margin: '0 0 1rem 0', fontWeight: '800' }}>Ship Code in Style.</h2>
        <p style={{ fontSize: '1.25rem', color: '#9ca3af', margin: 0, maxWidth: '600px', marginInline: 'auto' }}>
          Exclusive gear for platform engineers, SREs, and developers who deploy on Fridays. Fully powered by Kubernetes.
        </p>
      </div>
      
      {/* Product Grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {products.length === 0 ? <p style={{ textAlign: 'center', gridColumn: '1/-1', color: '#6b7280' }}>Loading gear from the cluster...</p> : 
            products.map(product => (
              <div key={product.id} style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '240px', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
                  <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#111827', fontSize: '1.25rem' }}>{product.name}</h3>
                  <p style={{ margin: '0 0 1.5rem 0', fontWeight: '700', color: '#4b5563', fontSize: '1.1rem' }}>${product.price.toFixed(2)}</p>
                  <button onClick={() => addToCart(product)} style={{ marginTop: 'auto', padding: '0.8rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', width: '100%', transition: 'background-color 0.2s' }}>
                    Add to Cart
                  </button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default App