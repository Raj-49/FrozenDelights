import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const OrderSuccess = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);
        setOrder(response.data.data);
      } catch (error) {
        setOrder(null);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="text-center shadow">
            <Card.Body className="p-5">
              <div className="mb-4">
                <div style={{ fontSize: '4rem' }}>🎉</div>
              </div>
              
              <h2 className="fw-bold text-success mb-3">Order Placed Successfully!</h2>
              <p className="text-muted mb-4">
                Thank you for your order! We'll deliver your ice creams as soon as possible.
              </p>
              
              <Alert variant="info">
                <strong>Order #{order?._id?.slice(-8).toUpperCase() || 'PENDING'}</strong>
                <br />
                <small>
                  You'll receive an order confirmation at {user?.email || 'your email address'}
                  {order?.totalAmount ? ` • Total ₹${order.totalAmount.toFixed(2)}` : ''}
                </small>
              </Alert>
              
              <div className="mb-4">
                <h5 className="mb-3">What's Next?</h5>
                <div className="text-start">
                  <div className="mb-2">
                    <span className="me-2">📦</span>
                    <span>Your order is being prepared</span>
                  </div>
                  <div className="mb-2">
                    <span className="me-2">🚚</span>
                    <span>Delivery partner will be assigned soon</span>
                  </div>
                  <div className="mb-2">
                    <span className="me-2">📍</span>
                    <span>Track your order in real-time</span>
                  </div>
                </div>
              </div>
              
              <div className="d-grid gap-2">
                <Button variant="primary" href="/my-orders">
                  Track My Order
                </Button>
                <Button variant="outline-primary" href="/menu">
                  Order More Ice Cream
                </Button>
                <Button variant="outline-secondary" href="/">
                  Back to Home
                </Button>
              </div>
              
              <div className="mt-4">
                <small className="text-muted">
                  Need help? Contact us at support@frozendelights.com
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderSuccess;
