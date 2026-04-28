import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Badge, Button, Col, Container, Nav, Row } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const adminNavItems = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/coupons', label: 'Coupons' },
];

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-shell">
      <Container fluid className="py-3 py-lg-4">
        <Row className="g-4">
          <Col lg={2}>
            <div className="admin-sidebar sticky-lg-top p-3 rounded-4 border">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <div className="fw-bold">FrozenDelights</div>
                  <small className="text-muted">Admin Console</small>
                </div>
                <Badge bg="danger">Admin</Badge>
              </div>

              <Nav className="flex-column gap-1">
                {adminNavItems.map((item) => (
                  <Nav.Link
                    key={item.to}
                    as={Link}
                    to={item.to}
                    className={location.pathname === item.to ? 'active fw-semibold' : ''}
                  >
                    {item.label}
                  </Nav.Link>
                ))}
              </Nav>

              <hr />

              <div className="d-grid gap-2">
                <ThemeToggle className="w-100" />
                <Button as={Link} to="/" variant="outline-primary" size="sm">
                  Open Store
                </Button>
                <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>

              <div className="mt-3 small text-muted">
                Signed in as <strong>{user?.name || 'Admin'}</strong>
              </div>
            </div>
          </Col>

          <Col lg={10}>
            <div className="admin-content">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 d-lg-none">
                <div>
                  <div className="fw-bold">FrozenDelights Admin</div>
                  <small className="text-muted">Operations workspace</small>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  <ThemeToggle />
                  <Button as={Link} to="/" variant="outline-primary" size="sm">
                    Open Store
                  </Button>
                </div>
              </div>

              {children}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminLayout;
