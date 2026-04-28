import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';

// Import components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout';

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
const MyOrders = lazy(() => import('./pages/MyOrders'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const Notifications = lazy(() => import('./pages/Notifications'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));

// Route Guards
import ProtectedRoute from './routes/ProtectedRoute';
import GuestRoute from './routes/GuestRoute';
import AdminRoute from './routes/AdminRoute';

function AppRoutes() {
  const location = useLocation();
  const { user } = useAuth();
  const isAdminLogin = location.pathname === '/admin/login';
  const isAdminArea = location.pathname.startsWith('/admin') && !isAdminLogin;
  const shouldForceAdminShell = user?.role === 'admin' && !isAdminArea && !isAdminLogin;

  const fallback = (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  if (isAdminArea) {
    return (
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/menu" element={<Navigate to="/admin" replace />} />
        <Route path="/verify-email/:token" element={<Navigate to="/admin" replace />} />
        <Route path="/auth/google/success" element={<Navigate to="/admin" replace />} />
        <Route path="/forgot-password" element={<Navigate to="/admin" replace />} />
        <Route path="/reset-password/:token" element={<Navigate to="/admin" replace />} />

        {/* Admin Login */}
        <Route path="/admin/login" element={<Suspense fallback={fallback}><AdminLogin /></Suspense>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout><Suspense fallback={fallback}><AdminDashboard /></Suspense></AdminLayout></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><AdminLayout><Suspense fallback={fallback}><AdminProducts /></Suspense></AdminLayout></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminLayout><Suspense fallback={fallback}><AdminOrders /></Suspense></AdminLayout></AdminRoute>} />
        <Route path="/admin/coupons" element={<AdminRoute><AdminLayout><Suspense fallback={fallback}><AdminCoupons /></Suspense></AdminLayout></AdminRoute>} />
        <Route path="/admin/billing" element={<AdminRoute><AdminLayout><div><h1>Admin Billing</h1></div></AdminLayout></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminLayout><div><h1>Admin Users</h1></div></AdminLayout></AdminRoute>} />
      </Routes>
    );
  }

  if (shouldForceAdminShell) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="app-shell">
      {!isAdminLogin && <Navbar />}
      <main className="app-main">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/auth/google/success" element={<GoogleSuccess />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* Guest Routes (redirect to / if logged in) */}
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          
          {/* Admin Login */}
          <Route path="/admin/login" element={<Suspense fallback={fallback}><AdminLogin /></Suspense>} />
          
          {/* Protected Routes (any logged in user) */}
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/order/:id/success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
          <Route path="/order/:id/track" element={<ProtectedRoute><Suspense fallback={fallback}><TrackOrder /></Suspense></ProtectedRoute>} />
          <Route path="/my-orders" element={<ProtectedRoute><Suspense fallback={fallback}><MyOrders /></Suspense></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Suspense fallback={fallback}><Notifications /></Suspense></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Admin Routes (redirect to admin shell) */}
          <Route path="/admin" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/products" element={<Navigate to="/admin/products" replace />} />
          <Route path="/admin/orders" element={<Navigate to="/admin/orders" replace />} />
          <Route path="/admin/coupons" element={<Navigate to="/admin/coupons" replace />} />
          <Route path="/admin/billing" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/users" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ThemeProvider>
          <Router>
            <AppRoutes />
          </Router>
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
