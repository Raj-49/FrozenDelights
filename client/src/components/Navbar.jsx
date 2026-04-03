import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar as BSNavbar, Nav, Container, Badge, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileImageError, setProfileImageError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setProfileImageError(false);
  }, [user?.profileImage, user?.name]);

  useEffect(() => {
    const fetchUnread = async () => {
      if (!user) {
        setUnreadCount(0);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/notifications/unread-count`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        setUnreadCount(data?.data?.unreadCount || 0);
      } catch (error) {
        setUnreadCount(0);
      }
    };

    fetchUnread();
  }, [user, location.pathname]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!user || !token) {
      return undefined;
    }

    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const streamUrl = `${base.replace('/api', '')}/api/stream/me?token=${encodeURIComponent(token)}`;
    const eventSource = new EventSource(streamUrl);

    const handleNotification = () => {
      setUnreadCount((prev) => prev + 1);
    };

    eventSource.addEventListener('notification_new', handleNotification);

    return () => {
      eventSource.removeEventListener('notification_new', handleNotification);
      eventSource.close();
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getProfileImage = () => {
    const rawImage = user?.profileImage;
    const hasValidRemoteImage = typeof rawImage === 'string'
      && rawImage.trim() !== ''
      && rawImage !== 'null'
      && rawImage !== 'undefined';

    if (hasValidRemoteImage && !profileImageError) {
      return user.profileImage;
    }
    
    // Generate avatar based on user's name
    if (user?.name) {
      const initials = user.name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4facfe&color=fff&size=32&bold=true`;
    }
    
    return 'https://ui-avatars.com/api/?name=User&background=6c757d&color=fff&size=32&bold=true';
  };

  return (
    <BSNavbar 
      expand="lg" 
      sticky="top" 
      className={`custom-navbar ${scrolled ? 'scrolled' : ''}`}
      bg="white"
      variant="light"
    >
      <Container>
        <BSNavbar.Brand as={Link} to="/" className="fw-bold">
          🍦 FrozenDelights
        </BSNavbar.Brand>

        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            {/* Public Links */}
            <Nav.Link as={Link} to="/" className={isActive('/') ? 'active' : ''}>
              Home
            </Nav.Link>

            {/* Cart Link - Show for all users */}
            <Nav.Link as={Link} to="/cart" className={isActive('/cart') ? 'active' : ''}>
              Cart
              {cartCount > 0 && (
                <Badge bg="danger" className="ms-1">
                  {cartCount}
                </Badge>
              )}
            </Nav.Link>

            {/* Authenticated Links */}
            {user ? (
              <>
                {/* Profile Image Link */}
                <Nav.Link as={Link} to="/profile" className={`profile-link ${isActive('/profile') ? 'active' : ''}`}>
                  <img
                    src={getProfileImage()}
                    alt="Profile"
                    onError={() => setProfileImageError(true)}
                    className="rounded-circle"
                    style={{
                      width: '32px',
                      height: '32px',
                      objectFit: 'cover',
                      border: '2px solid #4facfe'
                    }}
                  />
                  <span className="ms-2 d-none d-lg-inline">Profile</span>
                </Nav.Link>

                <Nav.Link as={Link} to="/my-orders" className={isActive('/my-orders') ? 'active' : ''}>
                  My Orders
                </Nav.Link>

                <Nav.Link as={Link} to="/notifications" className={isActive('/notifications') ? 'active' : ''}>
                  Notifications
                  {unreadCount > 0 && (
                    <Badge bg="primary" className="ms-1">{unreadCount}</Badge>
                  )}
                </Nav.Link>

                {/* Admin Dashboard Link */}
                {user.role === 'admin' && (
                  <Nav.Link as={Link} to="/admin" className={isActive('/admin') ? 'active' : ''}>
                    Admin Dashboard
                  </Nav.Link>
                )}

                {/* Logout Button */}
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  onClick={handleLogout}
                  className="ms-2"
                >
                  Logout
                </Button>
              </>
            ) : (
              /* Unauthenticated Links */
              <>
                <Nav.Link as={Link} to="/login" className={isActive('/login') ? 'active' : ''}>
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register" className={isActive('/register') ? 'active' : ''}>
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>

      <style>{`
        .custom-navbar {
          transition: box-shadow 0.3s ease;
        }
        
        .custom-navbar.scrolled {
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .custom-navbar .navbar-brand {
          font-size: 1.5rem;
          color: #007bff !important;
        }
        
        .custom-navbar .nav-link {
          font-weight: 500;
          transition: color 0.3s ease;
        }
        
        .custom-navbar .nav-link:hover {
          color: #007bff !important;
        }
        
        .custom-navbar .nav-link.active {
          color: #007bff !important;
          font-weight: 600;
        }
      `}</style>
    </BSNavbar>
  );
};

export default Navbar;
