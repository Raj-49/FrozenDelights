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
          <Card className="text-center shadow border-0 overflow-hidden">
            <Card.Body className="p-5">
              <div className="mb-4">
                <div style={{ fontSize: '4rem' }}>🎉</div>
                <h2 className="fw-bold text-success mb-2">Order Placed Successfully!</h2>
                <p className="text-muted mb-0">
                  Thank you for your order. Your ice creams are now in the processing flow and can be tracked anytime.
                </p>
              </div>

              <Alert variant="success" className="text-start">
                <strong>Order #{order?._id?.slice(-8).toUpperCase() || 'PENDING'}</strong>
                <br />
                <small>
                  Confirmation will be sent to {user?.email || 'your email address'}
                  {order?.totalAmount ? ` • Total ₹${order.totalAmount.toFixed(2)}` : ''}
                </small>
              </Alert>

              <Row className="g-3 mb-4 text-start">
                {[
                  { icon: '📦', title: 'Order received', text: 'Your order has entered the queue.' },
                  { icon: '🚚', title: 'Delivery in progress', text: 'We will assign the delivery flow shortly.' },
                  { icon: '📍', title: 'Live tracking available', text: 'Use tracking to follow progress step by step.' }
                ].map((item) => (
                  <Col md={4} key={item.title}>
                    <div className="p-3 rounded-3 bg-body-tertiary h-100">
                      <div className="fs-4 mb-2">{item.icon}</div>
                      <div className="fw-semibold mb-1">{item.title}</div>
                      <small className="text-muted">{item.text}</small>
                    </div>
                  </Col>
                ))}
              </Row>

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

              <div className="mt-4 small text-muted">
                Need help? Contact us at support@frozendelights.com
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderSuccess;
