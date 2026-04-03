import React, { useEffect, useState } from 'react';
import { Container, Card, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import api from '../api/axios';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications/me?limit=50');
      setNotifications(response.data?.data || []);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      return undefined;
    }

    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const streamUrl = `${base.replace('/api', '')}/api/stream/me?token=${encodeURIComponent(token)}`;
    const eventSource = new EventSource(streamUrl);

    const handleNotification = async (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (!payload?.title) {
          return;
        }

        setNotifications((prev) => [
          {
            _id: `live-${Date.now()}`,
            title: payload.title,
            message: payload.message,
            createdAt: payload.createdAt || new Date().toISOString(),
            isRead: false
          },
          ...prev
        ]);
      } catch (error) {
        await fetchNotifications();
      }
    };

    eventSource.addEventListener('notification_new', handleNotification);

    return () => {
      eventSource.removeEventListener('notification_new', handleNotification);
      eventSource.close();
    };
  }, []);

  const markOneRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((item) => item._id === id ? { ...item, isRead: true } : item));
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to mark notification read');
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to mark all notifications read');
    }
  };

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-1">Notifications</h3>
          <small className="text-muted">Order and payment updates in one place</small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Badge bg="dark">Unread: {unreadCount}</Badge>
          <Button size="sm" variant="outline-primary" onClick={markAllRead} disabled={unreadCount === 0}>
            Mark all read
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-2 mb-0">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <Card.Body className="text-center text-muted py-5">No notifications yet.</Card.Body>
        </Card>
      ) : (
        notifications.map((item) => (
          <Card key={item._id} className="mb-2">
            <Card.Body className="d-flex justify-content-between align-items-start">
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <strong>{item.title}</strong>
                  {!item.isRead && <Badge bg="primary">New</Badge>}
                </div>
                <div className="text-muted mb-1">{item.message}</div>
                <small className="text-muted">{new Date(item.createdAt).toLocaleString()}</small>
              </div>
              {!item.isRead && (
                <Button size="sm" variant="outline-secondary" onClick={() => markOneRead(item._id)}>
                  Mark read
                </Button>
              )}
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
};

export default Notifications;
