import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Alert, Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import api from '../../api/axios';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await api.get(`/auth/verify-email/${token}`);
        
        if (response.data.success) {
          setSuccess(true);
          // Store token and user from response
          localStorage.setItem('token', response.data.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
          
          // Redirect after 2 seconds
          setTimeout(() => {
            navigate('/');
          }, 2000);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Email verification failed');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setError('Invalid verification link');
      setLoading(false);
    }
  }, [token, navigate, login]);

  if (loading) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Card className="shadow text-center p-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Verifying your email...</p>
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
              <h3 className="mb-3">Email verified!</h3>
              <p className="text-muted">
                Welcome to FrozenDelights. Redirecting to homepage...
              </p>
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
          <Card className="shadow text-center p-4">
            <div className="mb-4">
              <div style={{ fontSize: '3rem' }}>❌</div>
            </div>
            <h3 className="mb-3">Link expired or invalid</h3>
            <p className="text-muted mb-4">
              The verification link is no longer valid or has expired.
            </p>
            <Alert variant="danger">
              {error}
            </Alert>
            <div>
              <a href="/register" className="btn btn-primary">
                Go back to register
              </a>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default VerifyEmail;
