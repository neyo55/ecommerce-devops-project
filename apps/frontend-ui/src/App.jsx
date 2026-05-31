import { useState, useEffect } from 'react'

function App() {
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [authSuccess, setAuthSuccess] = useState(false);

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

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isLoginView ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        if (isLoginView) {
          setToken(data.token);
          localStorage.setItem('token', data.token);
          setAuthMessage('');
        } else {
          setAuthSuccess(true);
          setAuthMessage('Account created! Please log in.');
          setIsLoginView(true);
          setPassword('');
        }
      } else {
        setAuthMessage(data.error || 'Authentication failed');
        setAuthSuccess(false);
      }
    } catch (err) {
      setAuthMessage('Server error. Please try again.');
      setAuthSuccess(false);
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
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ product })
    })
    .then(res => res.json())
    .then(data => setCartCount(data.cart.length))
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
      alert("✅ Order Placed Successfully!");
      setCartCount(0);
    })
    .catch(err => console.error("Error during checkout:", err));
  };

  // --- AUTHENTICATION SCREEN ---
  if (!token) {
    return (
      <div style={{ fontFamily: 'system-ui, sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f5f5' }}>
        <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ textAlign: 'center', color: '#2563eb', margin: '0 0 1.5rem 0', fontSize: '2.5rem', fontWeight: '900' }}>NEYO55 STORE</h2>
          
          <div style={{ display: 'flex', marginBottom: '1.5rem', borderBottom: '2px solid #eee' }}>
            <button onClick={() => {setIsLoginView(true); setAuthMessage('');}} style={{ flex: 1, padding: '1rem', backgroundColor: 'transparent', border: 'none', borderBottom: isLoginView ? '3px solid #2563eb' : 'none', fontWeight: isLoginView ? 'bold' : 'normal', color: isLoginView ? '#2563eb' : '#777', cursor: 'pointer', fontSize: '1.1rem' }}>Log In</button>
            <button onClick={() => {setIsLoginView(false); setAuthMessage('');}} style={{ flex: 1, padding: '1rem', backgroundColor: 'transparent', border: 'none', borderBottom: !isLoginView ? '3px solid #2563eb' : 'none', fontWeight: !isLoginView ? 'bold' : 'normal', color: !isLoginView ? '#2563eb' : '#777', cursor: 'pointer', fontSize: '1.1rem' }}>Register</button>
          </div>

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} style={{ padding: '1rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' }} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '1rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' }} required />
            <button type="submit" style={{ padding: '1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 6px rgba(37, 99, 235, 0.3)' }}>
              {isLoginView ? 'LOGIN' : 'CREATE ACCOUNT'}
            </button>
            {authMessage && <p style={{ color: authSuccess ? '#2e7d32' : '#d32f2f', textAlign: 'center', margin: 0, fontWeight: 'bold' }}>{authMessage}</p>}
          </form>
        </div>
      </div>
    );
  }

  const currentUser = token ? JSON.parse(atob(token.split('.')[1])).username : 'Guest';

  // --- MAIN STOREFRONT ---
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#f5f5f5', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .marquee-container {
            overflow: hidden; white-space: nowrap; background: #111827; color: white; padding: 10px 0; font-weight: bold; font-size: 0.9rem; letter-spacing: 1px;
          }
          .marquee-text {
            display: inline-block; animation: marquee 15s linear infinite;
          }
        `}
      </style>

      {/* Marquee Header */}
      <div className="marquee-container">
        <div className="marquee-text">
          🚀 WELCOME TO NEYO55 STORE! UP TO 40% OFF ELECTRONICS & APPLIANCES. FREE DELIVERY ON ORDERS OVER $50. SHOP NOW! 🚀
        </div>
      </div>

      {/* Main Navbar */}
      <nav style={{ backgroundColor: '#fff', padding: '1.5rem 2rem', position: 'sticky', top: 0, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h1 style={{ color: '#2563eb', margin: 0, fontSize: '2rem', fontWeight: '900' }}>NEYO55 STORE</h1>
        
        {/* Search Bar */}
        <div style={{ flex: '0 1 500px', display: 'flex' }}>
          <input type="text" placeholder="Search products, brands and categories" style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #ccc', borderRadius: '4px 0 0 4px', outline: 'none' }} />
          <button style={{ padding: '0.8rem 1.5rem', backgroundColor: '#2563eb', border: 'none', borderRadius: '0 4px 4px 0', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>SEARCH</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ fontWeight: '600', color: '#4b5563', fontSize: '1.1rem' }}>
            Hi, {currentUser} 👋
          </div>
          <div style={{ fontWeight: 'bold', color: '#333', fontSize: '1.1rem', backgroundColor: '#f3f4f6', padding: '0.5rem 1rem', borderRadius: '20px' }}>
            🛒 Cart: {cartCount}
          </div>
          <button onClick={handleCheckout} style={{ padding: '0.8rem 1.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)' }}>CHECKOUT</button>
          <button onClick={handleLogout} style={{ padding: '0.8rem 1.5rem', backgroundColor: '#fff', color: '#333', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>LOGOUT</button>
        </div>
      </nav>

      {/* Flash Sales Banner */}
      <div style={{ maxWidth: '1200px', margin: '2rem auto', backgroundColor: '#ef4444', borderRadius: '8px 8px 0 0', padding: '1rem 2rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>⚡ Flash Sales</h2>
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Time Left: 16h : 58m : 16s</div>
      </div>
      
      {/* Product Grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', backgroundColor: '#fff', borderRadius: '0 0 8px 8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {products.length === 0 ? <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>Loading products...</p> : 
            products.map(product => (
              <div key={product.id} style={{ border: '1px solid #eee', borderRadius: '4px', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'} onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}>
                
                {/* Discount Tag */}
                <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#fee2e2', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  {product.discount}
                </div>

                <div style={{ height: '200px', padding: '1rem' }}>
                  <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                
                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#333', fontSize: '1rem', fontWeight: 'normal', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h3>
                  <p style={{ margin: '0', fontWeight: 'bold', color: '#333', fontSize: '1.2rem' }}>${product.price.toFixed(2)}</p>
                  <p style={{ margin: '0 0 1rem 0', color: '#777', textDecoration: 'line-through', fontSize: '0.9rem' }}>${product.originalPrice.toFixed(2)}</p>
                  
                  {/* Progress Bar Fake */}
                  <div style={{ width: '100%', backgroundColor: '#eee', height: '6px', borderRadius: '3px', marginBottom: '1rem' }}>
                    <div style={{ width: '60%', backgroundColor: '#2563eb', height: '100%', borderRadius: '3px' }}></div>
                  </div>

                  <button onClick={() => addToCart(product)} style={{ marginTop: 'auto', padding: '0.8rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%', transition: 'background-color 0.2s' }}>
                    ADD TO CART
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