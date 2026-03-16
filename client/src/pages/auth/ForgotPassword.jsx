import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import api from '../../api/axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setEmail(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      
      // Always show success message for security
      setSuccess(true);
    } catch (err) {
      // Still show success for security (don't reveal if email exists)
      setSuccess(true);
    } finally {
      setLoading(false);
    }
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
              <h3 className="mb-3">Check your email</h3>
              <p className="text-muted mb-4">
                If that email exists, we've sent a reset link. Check your inbox.
              </p>
              <div>
                <Link to="/login" className="btn btn-primary">
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
                <p className="text-muted">Reset your password</p>
              </div>

              {error && (
                <Alert variant="danger" className="mb-3" onClose={() => setError('')} dismissible>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </Button>
              </Form>

              <div className="text-center">
                <Link to="/login" className="text-decoration-none">
                  Back to login
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword;
