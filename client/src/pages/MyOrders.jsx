import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import api from '../api/axios';

const statusBadge = (status) => {
  const map = {
    Placed: 'secondary',
    Confirmed: 'info',
    Preparing: 'warning',
    'Out for Delivery': 'primary',
    Delivered: 'success',
    Cancelled: 'danger'
  };

  return map[status] || 'secondary';
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders/my');
        setOrders(response.data.data || []);
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Failed to load your orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Loading your orders...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="text-center mb-4">
        <h1 className="fw-bold">📦 My Orders</h1>
        <p className="text-muted">Track and manage your past orders</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {orders.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <h5>No orders yet</h5>
            <p className="text-muted">Place your first order and it will appear here.</p>
            <Button as={Link} to="/menu" variant="primary">Browse Menu</Button>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {orders.map((order) => (
            <Col md={6} key={order._id}>
              <Card className="h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="mb-1">Order #{order._id.slice(-8).toUpperCase()}</h6>
                      <small className="text-muted">
                        {new Date(order.createdAt).toLocaleString()}
                      </small>
                    </div>
                    <Badge bg={statusBadge(order.orderStatus)}>{order.orderStatus}</Badge>
                  </div>

                  <div className="mb-3">
                    <small className="text-muted">Items: {order.items.length}</small>
                    <div className="fw-semibold">Total: ₹{order.totalAmount?.toFixed(2)}</div>
                  </div>

                  <div className="d-flex gap-2">
                    <Button as={Link} to={`/order/${order._id}/track`} variant="outline-primary" size="sm">
                      Track
                    </Button>
                    {['Placed', 'Confirmed'].includes(order.orderStatus) && (
                      <Button as={Link} to={`/order/${order._id}/track`} variant="outline-danger" size="sm">
                        Manage
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default MyOrders;
