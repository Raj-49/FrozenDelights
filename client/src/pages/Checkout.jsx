import React from 'react';
import { Container, Row, Col, Card, Button, Alert, Form } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const Checkout = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert variant="warning">
              Please login to proceed with checkout. <a href="/login">Click here to login</a>
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
            <h1 className="fw-bold">🛍️ Checkout</h1>
            <p className="text-muted">Complete your order details</p>
          </div>
          
          <Alert variant="info">
            Your cart is empty! <a href="/menu">Browse our menu</a> to add items before checkout.
          </Alert>
          
          <Row>
            <Col md={8}>
              <Card className="mb-4">
                <Card.Header>Delivery Information</Card.Header>
                <Card.Body>
                  <Form>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group controlId="firstName">
                          <Form.Label>First Name</Form.Label>
                          <Form.Control type="text" placeholder={user.name?.split(' ')[0] || ''} />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group controlId="lastName">
                          <Form.Label>Last Name</Form.Label>
                          <Form.Control type="text" placeholder={user.name?.split(' ')[1] || ''} />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3" controlId="email">
                      <Form.Label>Email</Form.Label>
                      <Form.Control type="email" value={user.email} disabled />
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="phone">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control type="tel" placeholder="+91 98765 43210" />
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="address">
                      <Form.Label>Delivery Address</Form.Label>
                      <Form.Control as="textarea" rows={3} placeholder="Enter your complete delivery address" />
                    </Form.Group>
                  </Form>
                </Card.Body>
              </Card>
              
              <Card>
                <Card.Header>Payment Information</Card.Header>
                <Card.Body>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Check type="radio" label="Cash on Delivery" name="paymentMethod" defaultChecked />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Check type="radio" label="Credit/Debit Card" name="paymentMethod" />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Check type="radio" label="UPI Payment" name="paymentMethod" />
                    </Form.Group>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card className="sticky-top" style={{ top: '20px' }}>
                <Card.Header>Order Summary</Card.Header>
                <Card.Body>
                  <div className="text-center text-muted py-3">
                    <p>Your cart is empty</p>
                    <small>Add items to see order summary</small>
                  </div>
                  
                  <hr />
                  
                  <div className="mb-3">
                    <Row>
                      <Col>Subtotal:</Col>
                      <Col className="text-end">₹0</Col>
                    </Row>
                    <Row>
                      <Col>Delivery:</Col>
                      <Col className="text-end">₹20</Col>
                    </Row>
                    <Row>
                      <Col>Tax:</Col>
                      <Col className="text-end">₹0</Col>
                    </Row>
                  </div>
                  
                  <hr />
                  
                  <Row className="mb-3">
                    <Col><strong>Total:</strong></Col>
                    <Col className="text-end"><strong>₹20</strong></Col>
                  </Row>
                  
                  <Button variant="success" className="w-100" disabled>
                    Place Order
                  </Button>
                  
                  <div className="mt-3 text-center">
                    <small className="text-muted">
                      <a href="/cart">← Back to Cart</a>
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;
