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
  
  const [timeLeft, setTimeLeft] = useState({ hours: 16, minutes: 58, seconds: 16 });
  const [addedItem, setAddedItem] = useState(null); 

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) { seconds--; } 
        else {
          seconds = 59;
          if (minutes > 0) { minutes--; } 
          else {
            minutes = 59;
            if (hours > 0) hours--;
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
      } catch (e) { console.error("Invalid token format"); }
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
    setAddedItem(product.id);
    setTimeout(() => setAddedItem(null), 1500);

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
      alert("✅ Order Placed Successfully! Your items are on the way.");
      setCartCount(0);
    })
    .catch(err => console.error("Error during checkout:", err));
  };

  const formatTime = (val) => val.toString().padStart(2, '0');

  if (!token) {
    return (
      <div style={{ fontFamily: 'system-ui, sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f5f5' }}>
        <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ textAlign: 'center', color: '#2563eb', margin: '0 0 1.5rem 0', fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px' }}>NEYO55 STORE</h2>
          
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
            {authMessage && <p style={{ color: authSuccess ? '#10b981' : '#ef4444', textAlign: 'center', margin: 0, fontWeight: 'bold' }}>{authMessage}</p>}
          </form>
        </div>
      </div>
    );
  }

  const currentUser = token ? JSON.parse(atob(token.split('.')[1])).username : 'Guest';

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#f5f5f5', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <style>
        {`
          @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
          .marquee-container { overflow: hidden; white-space: nowrap; background: #111827; color: white; padding: 8px 0; font-weight: bold; font-size: 0.85rem; letter-spacing: 1px; }
          .marquee-text { display: inline-block; animation: marquee 20s linear infinite; }
          .nav-btn { transition: all 0.2s; }
          .nav-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .category-link { color: #4b5563; text-decoration: none; font-size: 0.95rem; font-weight: 500; transition: color 0.2s; cursor: pointer; }
          .category-link:hover { color: #2563eb; }
        `}
      </style>

      {/* Marquee Header */}
      <div className="marquee-container">
        <div className="marquee-text">
          🚀 WELCOME TO NEYO55 STORE! UP TO 40% OFF ELECTRONICS & APPLIANCES. FREE DELIVERY ON ORDERS OVER $50. SHOP NOW! 🚀
        </div>
      </div>

      {/* Main Navbar */}
      <nav style={{ backgroundColor: '#fff', padding: '1.2rem 2rem', position: 'sticky', top: 0, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6' }}>
        <h1 style={{ color: '#2563eb', margin: 0, fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-1px' }}>NEYO55<br/><span style={{fontSize: '1.2rem', color: '#111827'}}>STORE</span></h1>
        
        {/* Search Bar */}
        <div style={{ flex: '0 1 450px', display: 'flex' }}>
          <input type="text" placeholder="Search products, brands and categories" style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #ccc', borderRadius: '4px 0 0 4px', outline: 'none' }} />
          <button style={{ padding: '0.8rem 1.5rem', backgroundColor: '#2563eb', border: 'none', borderRadius: '0 4px 4px 0', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>SEARCH</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Hello,</span>
            <span style={{ fontWeight: 'bold', color: '#111827' }}>{currentUser}</span>
          </div>
          <div style={{ fontWeight: 'bold', color: '#111827', fontSize: '1.1rem', backgroundColor: '#f3f4f6', padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🛒 Cart: <span style={{ color: '#2563eb' }}>{cartCount}</span>
          </div>
          <button onClick={handleCheckout} className="nav-btn" style={{ padding: '0.8rem 1.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>CHECKOUT</button>
          <button onClick={handleLogout} className="nav-btn" style={{ padding: '0.8rem 1.5rem', backgroundColor: '#fff', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>LOGOUT</button>
        </div>
      </nav>

      {/* Secondary Categories Ribbon */}
      <div style={{ backgroundColor: '#fff', padding: '0.8rem 2rem', borderBottom: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', gap: '2rem', justifyContent: 'center' }}>
        <span className="category-link">📱 Phones & Tablets</span>
        <span className="category-link">💻 Computing</span>
        <span className="category-link">📺 TVs & Audio</span>
        <span className="category-link">🔌 Appliances</span>
        <span className="category-link">🎮 Gaming</span>
        <span className="category-link">⚡ Supermarket</span>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1 }}>
        {/* Flash Sales Banner */}
        <div style={{ maxWidth: '1200px', margin: '2rem auto 0 auto', backgroundColor: '#ef4444', borderRadius: '8px 8px 0 0', padding: '1.2rem 2rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem' }}>⚡ Flash Sales</h2>
          <div style={{ fontWeight: 'bold', fontSize: '1.2rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '5px 15px', borderRadius: '20px' }}>
            Time Left: {formatTime(timeLeft.hours)}h : {formatTime(timeLeft.minutes)}m : {formatTime(timeLeft.seconds)}s
          </div>
        </div>
        
        {/* Product Grid (Now displaying 6 items) */}
        <div style={{ maxWidth: '1200px', margin: '0 auto 3rem auto', padding: '2rem', backgroundColor: '#fff', borderRadius: '0 0 8px 8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
            {products.length === 0 ? <p style={{ textAlign: 'center', gridColumn: '1/-1', color: '#6b7280' }}>Loading products from the cluster...</p> : 
              products.map((product, index) => (
                <div key={product.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', transition: 'all 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'} onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}>
                  
                  {/* Discount Tag */}
                  <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#fee2e2', color: '#ef4444', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.9rem', zIndex: 2 }}>
                    {product.discount}
                  </div>

                  <div style={{ height: '220px', padding: '1rem', backgroundColor: '#fff' }}>
                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'transform 0.3s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
                  </div>
                  
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1, backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
                    <h3 style={{ margin: '0 0 0.25rem 0', color: '#111827', fontSize: '1.1rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h3>
                    
                    {/* Star Ratings */}
                    <div style={{ display: 'flex', alignItems: 'center', color: '#fbbf24', fontSize: '1rem', marginBottom: '0.75rem' }}>
                      ★★★★★ <span style={{ color: '#9ca3af', marginLeft: '6px', fontSize: '0.85rem' }}>({(124 + index * 17)})</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '1rem' }}>
                      <p style={{ margin: '0', fontWeight: '800', color: '#111827', fontSize: '1.4rem' }}>${product.price.toFixed(2)}</p>
                      <p style={{ margin: '0', color: '#9ca3af', textDecoration: 'line-through', fontSize: '1rem' }}>${product.originalPrice.toFixed(2)}</p>
                    </div>
                    
                    {/* Stock Progress Bar */}
                    <div style={{ width: '100%', backgroundColor: '#e5e7eb', height: '6px', borderRadius: '3px', marginBottom: '1.5rem' }}>
                      <div style={{ width: `${60 - (index * 5)}%`, backgroundColor: '#2563eb', height: '100%', borderRadius: '3px' }}></div>
                    </div>

                    <button 
                      onClick={() => addToCart(product)} 
                      style={{ 
                        marginTop: 'auto', padding: '0.8rem', 
                        backgroundColor: addedItem === product.id ? '#10b981' : '#2563eb', 
                        color: 'white', border: 'none', borderRadius: '6px', 
                        cursor: 'pointer', fontWeight: 'bold', width: '100%', 
                        transition: 'background-color 0.2s', display: 'flex',
                        justifyContent: 'center', alignItems: 'center', gap: '8px'
                      }}
                    >
                      {addedItem === product.id ? 'ADDED! ✅' : 'ADD TO CART 🛒'}
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: '#111827', color: '#9ca3af', padding: '3rem 2rem 2rem 2rem', textAlign: 'center', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ color: 'white', margin: 0, letterSpacing: '2px', fontSize: '1.5rem' }}>NEYO55 STORE</h2>
          <p style={{ margin: 0, fontSize: '0.95rem', color: '#d1d5db' }}>Fully powered by Kubernetes, GitOps, and Microservices.</p>
          <div style={{ borderTop: '1px solid #374151', margin: '2rem 0 1rem 0', paddingTop: '1.5rem', fontSize: '0.85rem' }}>
            &copy; {new Date().getFullYear()} Neyo55 Store. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App