import React from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert variant="warning">
              Please login to view your cart. <a href="/login">Click here to login</a>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={12}>
          <div className="text-center mb-5">
            <h1 className="fw-bold">🛒 Your Cart</h1>
            <p className="text-muted">Review your ice cream selection</p>
          </div>
          
          <Alert variant="info">
            Your cart is empty! <a href="/menu">Browse our menu</a> to add delicious ice creams.
          </Alert>
          
          <Row className="mt-4">
            <Col md={8}>
              <Card>
                <Card.Header>Cart Items</Card.Header>
                <Card.Body className="text-center text-muted py-5">
                  <h4>No items in cart</h4>
                  <p className="mb-3">Add some delicious ice creams to your cart!</p>
                  <Button variant="primary" href="/menu">Browse Menu</Button>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card>
                <Card.Header>Order Summary</Card.Header>
                <Card.Body>
                  <Row className="mb-3">
                    <Col>Subtotal:</Col>
                    <Col className="text-end">₹0</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col>Delivery:</Col>
                    <Col className="text-end">₹20</Col>
                  </Row>
                  <hr />
                  <Row className="mb-3">
                    <Col><strong>Total:</strong></Col>
                    <Col className="text-end"><strong>₹20</strong></Col>
                  </Row>
                  <Button variant="success" className="w-100" disabled>
                    Proceed to Checkout
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;
