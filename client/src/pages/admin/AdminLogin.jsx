import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Alert, Form, Button, Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import api from '../../api/axios';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If admin already logged in, redirect to admin dashboard
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        // Regular user trying to access admin login
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      
      if (response.data.success) {
        const { user: loggedInUser } = response.data.data;
        
        // Check if user is admin
        if (loggedInUser.role !== 'admin') {
          setError('Access denied. Admin credentials required.');
          // Clear form
          setFormData({ email: '', password: '' });
          return;
        }

        // Admin login successful
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        navigate('/admin');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-dark">
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Card className="shadow border-0">
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-primary">🍦 FrozenDelights Admin</h2>
                  <p className="text-muted">Admin Portal</p>
                </div>

                {error && (
                  <Alert variant="danger" className="mb-3" onClose={() => setError('')} dismissible>
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-dark">Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter admin email"
                      required
                      className="bg-light"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="text-dark">Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter admin password"
                      required
                      className="bg-light"
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" />
                        <span className="ms-2">Signing in...</span>
                      </>
                    ) : (
                      'Admin Sign In'
                    )}
                  </Button>
                </Form>

                <div className="text-center mt-3">
                  <Link to="/" className="text-decoration-none text-muted">
                    ← Back to Store
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style jsx>{`
        .min-vh-100 {
          min-height: 100vh;
        }
        .bg-dark {
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%) !important;
        }
        .border-0 {
          border: none !important;
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
