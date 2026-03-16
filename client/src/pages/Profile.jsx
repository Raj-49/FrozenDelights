import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Profile = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileData(user);
    }
  }, [user]);

  const getProfileImage = () => {
    if (profileData?.profileImage) {
      return profileData.profileImage;
    }
    
    // Generate avatar based on user's name
    if (profileData?.name) {
      const initials = profileData.name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=4facfe&color=fff&size=128&bold=true`;
    }
    
    return 'https://ui-avatars.com/api/?name=User&background=6c757d&color=fff&size=128&bold=true';
  };

  const getAuthProviderBadge = () => {
    if (profileData?.authProvider === 'google') {
      return <Badge bg="danger" className="ms-2">Google</Badge>;
    }
    return <Badge bg="primary" className="ms-2">Email</Badge>;
  };

  const getVerificationBadge = () => {
    if (profileData?.isEmailVerified) {
      return <Badge bg="success">Verified</Badge>;
    }
    return <Badge bg="warning">Not Verified</Badge>;
  };

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Alert variant="danger">
              Please login to view your profile.
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="fw-bold">🍦 My Profile</h2>
                <p className="text-muted">Manage your account information</p>
              </div>

              {error && (
                <Alert variant="danger" onClose={() => setError('')} dismissible>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert variant="success" onClose={() => setSuccess('')} dismissible>
                  {success}
                </Alert>
              )}

              <Row className="align-items-center mb-4">
                <Col md={4} className="text-center">
                  <div className="profile-image-container mb-3">
                    <img
                      src={getProfileImage()}
                      alt="Profile"
                      className="rounded-circle"
                      style={{
                        width: '128px',
                        height: '128px',
                        objectFit: 'cover',
                        border: '4px solid #4facfe'
                      }}
                    />
                  </div>
                  <div className="mb-3">
                    {getAuthProviderBadge()}
                    <div className="mt-2">
                      {getVerificationBadge()}
                    </div>
                  </div>
                </Col>

                <Col md={8}>
                  <h4 className="mb-3">
                    {profileData?.name}
                    {profileData?.role === 'admin' && (
                      <Badge bg="danger" className="ms-2">Admin</Badge>
                    )}
                  </h4>
                  
                  <div className="mb-3">
                    <strong>Email:</strong> {profileData?.email}
                  </div>

                  <div className="mb-3">
                    <strong>Account Type:</strong> {profileData?.authProvider === 'google' ? 'Google Sign-In' : 'Email Registration'}
                  </div>

                  <div className="mb-3">
                    <strong>Member Since:</strong> {new Date(profileData?.createdAt).toLocaleDateString()}
                  </div>

                  <div className="mb-3">
                    <strong>Email Status:</strong> {profileData?.isEmailVerified ? 'Verified' : 'Not Verified'}
                  </div>

                  <div className="mb-3">
                    <strong>User ID:</strong> <code>{profileData?._id}</code>
                  </div>
                </Col>
              </Row>

              <hr className="my-4" />

              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0">Account Actions</h5>
                  <small className="text-muted">Manage your account settings</small>
                </div>
                <div>
                  <Button 
                    variant="outline-primary" 
                    className="me-2"
                    disabled={loading}
                  >
                    Edit Profile
                  </Button>
                  <Button 
                    variant="outline-danger"
                    onClick={handleLogout}
                    disabled={loading}
                  >
                    {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Logout'}
                  </Button>
                </div>
              </div>

              <Row className="mt-4">
                <Col md={6}>
                  <Card className="border-primary">
                    <Card.Body className="text-center">
                      <h5 className="text-primary">🛒 Order History</h5>
                      <p className="text-muted mb-0">View your past orders</p>
                      <Button variant="primary" size="sm" className="mt-2">
                        View Orders
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border-success">
                    <Card.Body className="text-center">
                      <h5 className="text-success">🏠 Delivery Address</h5>
                      <p className="text-muted mb-0">Manage delivery addresses</p>
                      <Button variant="success" size="sm" className="mt-2">
                        Manage Addresses
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <div className="mt-4 p-3 bg-light rounded">
                <h6 className="mb-2">🔒 Security Information</h6>
                <div className="row">
                  <div className="col-md-6">
                    <small className="text-muted">
                      <strong>Login Method:</strong> {profileData?.authProvider === 'google' ? 'Google OAuth' : 'Email/Password'}
                    </small>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted">
                      <strong>Last Login:</strong> {new Date().toLocaleDateString()}
                    </small>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
