import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { Spinner } from 'react-bootstrap';

const GoogleSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleGoogleSuccess = async () => {
      try {
        // Extract token from URL
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
          // Store token first so axios interceptor can send it
          localStorage.setItem('token', token);
          const response = await api.get('/auth/me');
          const loggedInUser = response.data.data;
          localStorage.setItem('user', JSON.stringify(loggedInUser));
          
          // Redirect based on role
          window.location.href = loggedInUser.role === 'admin' ? '/admin' : '/';
        } else {
          navigate('/login?error=google_failed');
        }
      } catch (error) {
        console.error('Google auth error:', error);
        navigate('/login?error=google_failed');
      }
    };

    handleGoogleSuccess();
  }, [location, navigate]);

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
