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

  const activeOrders = orders.filter((order) => ['Placed', 'Confirmed', 'Preparing', 'Out for Delivery'].includes(order.orderStatus)).length;
  const deliveredOrders = orders.filter((order) => order.orderStatus === 'Delivered').length;
  const cancelledOrders = orders.filter((order) => order.orderStatus === 'Cancelled').length;

  return (
    <Container className="py-5">
      <Card className="border-0 shadow-sm mb-4 overflow-hidden">
        <Card.Body className="p-4 p-lg-5">
          <Row className="align-items-center g-4">
            <Col lg={8}>
              <Badge bg="dark" className="mb-3">Order history</Badge>
              <h1 className="fw-bold mb-2">My Orders</h1>
              <p className="text-muted mb-0" style={{ maxWidth: '42rem' }}>
                Review current and past orders, jump into live tracking, and manage active orders from one place.
              </p>
            </Col>
            <Col lg={4}>
              <Row className="g-2 text-center">
                <Col xs={4}><div className="p-3 rounded-3 bg-body-tertiary"><div className="fw-bold">{orders.length}</div><small className="text-muted">Total</small></div></Col>
                <Col xs={4}><div className="p-3 rounded-3 bg-body-tertiary"><div className="fw-bold text-primary">{activeOrders}</div><small className="text-muted">Active</small></div></Col>
                <Col xs={4}><div className="p-3 rounded-3 bg-body-tertiary"><div className="fw-bold text-success">{deliveredOrders}</div><small className="text-muted">Done</small></div></Col>
              </Row>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}

      {orders.length === 0 ? (
        <Card className="border-0 shadow-sm">
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
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="mb-1">Order #{order._id.slice(-8).toUpperCase()}</h6>
                      <small className="text-muted">
                        {new Date(order.createdAt).toLocaleString()}
                      </small>
                    </div>
                    <Badge bg={statusBadge(order.orderStatus)}>{order.orderStatus}</Badge>
                  </div>

                  <div className="mb-3 p-3 rounded-3 bg-body-tertiary">
                    <small className="text-muted d-block mb-1">Items: {order.items.length}</small>
                    <div className="fw-semibold">Total: ₹{order.totalAmount?.toFixed(2)}</div>
                    <small className="text-muted">Tap track to follow the live order status.</small>
                  </div>

                  <div className="d-flex gap-2 mt-auto">
                    <Button as={Link} to={`/order/${order._id}/track`} variant="primary" size="sm">
                      Track Order
                    </Button>
                    {['Placed', 'Confirmed'].includes(order.orderStatus) && (
                      <Button as={Link} to={`/order/${order._id}/track`} variant="outline-secondary" size="sm">
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
