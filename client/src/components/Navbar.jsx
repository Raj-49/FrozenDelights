import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar as BSNavbar, Nav, Container, Badge, Button, Dropdown, Offcanvas } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { isDark } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileImageError, setProfileImageError] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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

  const handleMobileDestination = (path) => {
    setShowMobileMenu(false);
    navigate(path);
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
    <>
    <BSNavbar 
      expand="lg" 
      sticky="top" 
      className={`custom-navbar ${scrolled ? 'scrolled' : ''}`}
      bg={isDark ? 'dark' : 'white'}
      variant={isDark ? 'dark' : 'light'}
    >
      <Container>
        <BSNavbar.Brand as={Link} to="/" className="fw-bold">
          🍦 FrozenDelights
        </BSNavbar.Brand>

        <div className="d-flex align-items-center gap-2 d-lg-none">
          <ThemeToggle />
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setShowMobileMenu(true)}
          >
            ☰ More
          </Button>
        </div>

        <BSNavbar.Toggle aria-controls="basic-navbar-nav" className="d-none d-lg-inline-flex" />
        
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center d-none d-lg-flex">
            {/* Public Links */}
            <Nav.Link as={Link} to="/" className={isActive('/') ? 'active' : ''}>
              Home
            </Nav.Link>

            <Nav.Link as={Link} to="/menu" className={isActive('/menu') ? 'active' : ''}>
              Menu
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
                <ThemeToggle className="ms-lg-2" />

                <Dropdown align="end">
                  <Dropdown.Toggle as={Button} variant="outline-secondary" size="sm" className="ms-2 d-inline-flex align-items-center gap-2">
                    <img
                      src={getProfileImage()}
                      alt="Profile"
                      onError={() => setProfileImageError(true)}
                      className="rounded-circle"
                      style={{
                        width: '28px',
                        height: '28px',
                        objectFit: 'cover',
                        border: '2px solid currentColor'
                      }}
                    />
                    <span className="d-none d-lg-inline">{user.name?.split(' ')[0] || 'Account'}</span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to="/profile">👤 Profile</Dropdown.Item>
                    <Dropdown.Item as={Link} to="/my-orders">📦 My Orders</Dropdown.Item>
                    <Dropdown.Item as={Link} to="/notifications">
                      🔔 Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}
                    </Dropdown.Item>
                    {user.role === 'admin' && <Dropdown.Divider />}
                    {user.role === 'admin' && <Dropdown.Item as={Link} to="/admin">🛠 Admin Console</Dropdown.Item>}
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>↩ Logout</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              /* Unauthenticated Links */
              <>
                <ThemeToggle className="ms-2" />
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
          color: var(--bs-primary) !important;
        }
        
        .custom-navbar .nav-link {
          font-weight: 500;
          transition: color 0.3s ease;
        }
        
        .custom-navbar .nav-link:hover {
          color: var(--bs-primary) !important;
        }
        
        .custom-navbar .nav-link.active {
          color: var(--bs-primary) !important;
          font-weight: 600;
        }
      `}</style>
    </BSNavbar>

    <div className="mobile-bottom-nav d-lg-none">
      <Button variant={isActive('/') ? 'primary' : 'light'} onClick={() => handleMobileDestination('/')} className="mobile-nav-item">
        <span>🏠 Home</span>
      </Button>
      <Button variant={isActive('/menu') ? 'primary' : 'light'} onClick={() => handleMobileDestination('/menu')} className="mobile-nav-item">
        <span>🍨 Menu</span>
      </Button>
      <Button variant={isActive('/cart') ? 'primary' : 'light'} onClick={() => handleMobileDestination('/cart')} className="mobile-nav-item position-relative">
        <span>🛒 Cart</span>
        {cartCount > 0 && <Badge bg="danger" pill className="mobile-badge">{cartCount}</Badge>}
      </Button>
      <Button
        variant={isActive('/profile') || isActive('/login') ? 'primary' : 'light'}
        onClick={() => handleMobileDestination(user ? '/profile' : '/login')}
        className="mobile-nav-item"
      >
        <span>{user ? '👤 Account' : '🔑 Login'}</span>
      </Button>
    </div>

    <Offcanvas placement="bottom" show={showMobileMenu} onHide={() => setShowMobileMenu(false)}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>FrozenDelights</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <div className="d-grid gap-2">
          <Button variant="outline-primary" onClick={() => handleMobileDestination('/profile')} disabled={!user}>
            👤 Profile
          </Button>
          <Button variant="outline-primary" onClick={() => handleMobileDestination('/my-orders')} disabled={!user}>
            📦 My Orders
          </Button>
          <Button variant="outline-primary" onClick={() => handleMobileDestination('/notifications')} disabled={!user}>
            🔔 Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}
          </Button>
          {user?.role === 'admin' && (
            <Button variant="outline-dark" onClick={() => handleMobileDestination('/admin')}>
              🛠 Admin Console
            </Button>
          )}
          {user ? (
            <Button variant="outline-danger" onClick={() => { setShowMobileMenu(false); handleLogout(); }}>
              ↩ Logout
            </Button>
          ) : (
            <>
              <Button variant="primary" onClick={() => handleMobileDestination('/login')}>🔑 Login</Button>
              <Button variant="outline-primary" onClick={() => handleMobileDestination('/register')}>✨ Register</Button>
            </>
          )}
        </div>
      </Offcanvas.Body>
    </Offcanvas>
    </>
  );
};

export default Navbar;
