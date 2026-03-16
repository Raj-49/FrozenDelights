import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from 'react-bootstrap';

const GoogleSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const handleGoogleSuccess = () => {
      try {
        // Extract token from URL
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
          // Decode JWT payload to get user info
          const payload = JSON.parse(atob(token.split('.')[1]));
          const user = {
            id: payload.id,
            name: payload.name,
            email: payload.email,
            role: payload.role
          };

          // Store token and user
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));

          // Update AuthContext (this will trigger a re-render)
          login(payload.email, ''); // Empty password since it's OAuth
          
          // Redirect immediately
          navigate('/');
        } else {
          navigate('/login?error=google_failed');
        }
      } catch (error) {
        console.error('Google auth error:', error);
        navigate('/login?error=google_failed');
      }
    };

    handleGoogleSuccess();
  }, [location, navigate, login]);

  // Show loading spinner while processing
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className="text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Completing Google sign-in...</p>
      </div>
    </div>
  );
};

export default GoogleSuccess;
