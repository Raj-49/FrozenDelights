import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Alert, Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import api from '../../api/axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for Google OAuth error
    const params = new URLSearchParams(location.search);
    if (params.get('error') === 'google_failed') {
      setError('Google login failed. Please try again.');
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error and verification state when user starts typing
    if (error) {
      setError('');
      setNeedsVerification(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNeedsVerification(false);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/');
      } else {
        if (result.needsVerification) {
          setNeedsVerification(true);
          setVerificationEmail(formData.email);
          setError('Please verify your email address before logging in.');
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    try {
      const response = await api.post('/auth/resend-verification', {
        email: verificationEmail
      });
      setError('Verification email resent! Please check your inbox.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="fw-bold">🍦 FrozenDelights</h2>
                <p className="text-muted">Welcome back!</p>
              </div>

              {error && (
                <Alert variant={needsVerification ? "warning" : "danger"} className="mb-3" onClose={() => setError('')} dismissible>
                  {error}
                  {needsVerification && (
                    <div className="mt-2">
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        onClick={handleResendVerification}
                        disabled={resendLoading}
                        className="me-2"
                      >
                        {resendLoading ? 'Sending...' : '📧 Resend Verification Email'}
                      </Button>
                      <small className="text-muted d-block mt-1">
                        Check your inbox at <strong>{verificationEmail}</strong>
                      </small>
                    </div>
                  )}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Form>

              <div className="text-center mb-3">
                <span className="text-muted">── OR ──</span>
              </div>

              <Button
                variant="outline-primary"
                className="w-100 mb-3"
                onClick={handleGoogleLogin}
              >
                Continue with Google 🔵
              </Button>

              <div className="text-center">
                <p className="mb-0">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-decoration-none">
                    Sign up
                  </Link>
                </p>
                <p className="mb-0">
                  <Link to="/forgot-password" className="text-decoration-none">
                    Forgot password?
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
