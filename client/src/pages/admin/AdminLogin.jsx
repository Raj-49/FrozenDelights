import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Container, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleGoogleAdminLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`;
  };

  return (
    <div className="min-vh-100 bg-dark">
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={7} lg={5}>
            <Card className="shadow border-0">
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-primary">🍦 FrozenDelights Admin</h2>
                  <p className="text-muted mb-1">Google Sign-In Only</p>
                  <small className="text-muted">Allowed admin email: shopfrozendelights@gmail.com</small>
                </div>

                {error && (
                  <Alert variant="danger" className="mb-3" onClose={() => setError('')} dismissible>
                    {error}
                  </Alert>
                )}

                <Alert variant="info" className="mb-4">
                  Admin manual email/password login is disabled. Please continue with Google.
                </Alert>

                <Button
                  variant="dark"
                  className="w-100 mb-3"
                  onClick={handleGoogleAdminLogin}
                >
                  Continue with Google
                </Button>

                <div className="text-center">
                  <Link to="/" className="text-decoration-none text-muted">
                    ← Back to Store
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminLogin;
