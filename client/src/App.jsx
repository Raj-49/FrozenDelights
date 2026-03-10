import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Routes will be added here */}
              <Route path="/" element={<div><h1>Welcome to FrozenDelights</h1></div>} />
              <Route path="/login" element={<div><h1>Login Page</h1></div>} />
              <Route path="/register" element={<div><h1>Register Page</h1></div>} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
