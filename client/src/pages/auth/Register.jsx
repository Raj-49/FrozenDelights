import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Alert, Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import api from '../../api/axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const { register } = useAuth();
  
  const navigate = useNavigate();

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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      if (result.success) {
        setSuccess(true);
        setError(result.message || 'Registration successful! Please check your email for verification.');
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setResendLoading(true);
    try {
      await api.post('/auth/resend-verification', {
        email: formData.email
      });
      setError('Verification email resent!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend email');
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  if (success) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Card className="shadow text-center p-4">
              <div className="mb-4">
                <div style={{ fontSize: '3rem' }}>📧</div>
              </div>
              <h3 className="mb-3">Check your email!</h3>
              <p className="text-muted mb-4">
                We sent a verification link to <strong>{formData.email}</strong>. 
                Click it to activate your account.
              </p>
              <Button
                variant="outline-primary"
                onClick={handleResendEmail}
                disabled={resendLoading}
                className="mb-3"
              >
                {resendLoading ? 'Resending...' : 'Resend email'}
              </Button>
              <div>
                <Link to="/login" className="text-decoration-none">
                  Back to login
                </Link>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="fw-bold">🍦 FrozenDelights</h2>
                <p className="text-muted">Create your account</p>
              </div>

              {error && (
                <Alert variant="danger" className="mb-3" onClose={() => setError('')} dismissible>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                  />
                </Form.Group>

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

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password (min 6 chars)"
                    required
                    minLength={6}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                    minLength={6}
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Sign Up'}
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
                  Already have an account?{' '}
                  <Link to="/login" className="text-decoration-none">
                    Sign in
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

export default Register;
