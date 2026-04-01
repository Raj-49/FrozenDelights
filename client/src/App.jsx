import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Import components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Import pages
import Home from './pages/user/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Profile from './pages/Profile';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import GoogleSuccess from './pages/auth/GoogleSuccess';
import AdminLogin from './pages/admin/AdminLogin';

// Route Guards
import ProtectedRoute from './routes/ProtectedRoute';
import GuestRoute from './routes/GuestRoute';
import AdminRoute from './routes/AdminRoute';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />
              <Route path="/auth/google/success" element={<GoogleSuccess />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              
              {/* Guest Routes (redirect to / if logged in) */}
              <Route path="/login" element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              } />
              <Route path="/register" element={
                <GuestRoute>
                  <Register />
                </GuestRoute>
              } />
              
              {/* Admin Login (special handling) */}
              <Route path="/admin/login" element={<AdminLogin />} />
              
              {/* Protected Routes (any logged in user) */}
              <Route path="/cart" element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } />
              <Route path="/order/:id/success" element={
                <ProtectedRoute>
                  <OrderSuccess />
                </ProtectedRoute>
              } />
              <Route path="/order/:id/track" element={
                <ProtectedRoute>
                  <div><h1>Track Order Page</h1></div>
                </ProtectedRoute>
              } />
              <Route path="/my-orders" element={
                <ProtectedRoute>
                  <div><h1>My Orders Page</h1></div>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes (admin only) */}
              <Route path="/admin" element={
                <AdminRoute>
                  <div><h1>Admin Dashboard</h1></div>
                </AdminRoute>
              } />
              <Route path="/admin/products" element={
                <AdminRoute>
                  <div><h1>Admin Products</h1></div>
                </AdminRoute>
              } />
              <Route path="/admin/orders" element={
                <AdminRoute>
                  <div><h1>Admin Orders</h1></div>
                </AdminRoute>
              } />
              <Route path="/admin/billing" element={
                <AdminRoute>
                  <div><h1>Admin Billing</h1></div>
                </AdminRoute>
              } />
              <Route path="/admin/users" element={
                <AdminRoute>
                  <div><h1>Admin Users</h1></div>
                </AdminRoute>
              } />
            </Routes>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
