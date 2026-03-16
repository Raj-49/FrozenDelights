import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Form, Button, Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import api from '../../api/axios';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    // We could validate the token here, but we'll let the backend handle it
    if (!token) {
      setTokenValid(false);
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
      const response = await api.post(`/auth/reset-password/${token}`, {
        password: formData.password
      });

      if (response.data.success) {
        setSuccess(true);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Card className="shadow text-center p-4">
              <div className="mb-4">
                <div style={{ fontSize: '3rem' }}>❌</div>
              </div>
              <h3 className="mb-3">Invalid reset link</h3>
              <p className="text-muted mb-4">
                The password reset link is invalid.
              </p>
              <div>
                <a href="/forgot-password" className="btn btn-primary">
                  Request a new one
                </a>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  if (success) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Card className="shadow text-center p-4">
              <div className="mb-4">
                <div style={{ fontSize: '3rem' }}>✅</div>
              </div>
              <h3 className="mb-3">Password reset!</h3>
              <p className="text-muted">
                Redirecting to login...
              </p>
              <Spinner animation="border" variant="primary" />
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
                <p className="text-muted">Set new password</p>
              </div>

              {error && (
                <Alert variant="danger" className="mb-3">
                  {error}
                  {error.includes('expired') && (
                    <div className="mt-2">
                      <a href="/forgot-password" className="btn btn-sm btn-outline-danger">
                        Request a new one
                      </a>
                    </div>
                  )}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter new password (min 6 chars)"
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
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPassword;
