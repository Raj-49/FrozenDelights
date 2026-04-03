import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Image } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { resolveProductImage } from '../utils/productImage';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, updateQuantity, removeFromCart } = useCart();

  const deliveryFee = cart.length > 0 ? (cartTotal >= 299 ? 0 : 20) : 0;
  const tax = Number((cartTotal * 0.05).toFixed(2));
  const total = Number((cartTotal + tax + deliveryFee).toFixed(2));

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={12}>
          <div className="text-center mb-5">
            <h1 className="fw-bold">🛒 Your Cart</h1>
            <p className="text-muted">Review your ice cream selection</p>
          </div>

          {cart.length === 0 && (
            <Alert variant="info">
              Your cart is empty! <a href="/menu">Browse our menu</a> to add delicious ice creams.
            </Alert>
          )}
          
          <Row className="mt-4">
            <Col md={8}>
              <Card>
                <Card.Header>Cart Items</Card.Header>
                <Card.Body>
                  {cart.length === 0 ? (
                    <div className="text-center text-muted py-5">
                      <h4>No items in cart</h4>
                      <p className="mb-3">Add some delicious ice creams to your cart!</p>
                      <Button variant="primary" href="/menu">Browse Menu</Button>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item._id} className="d-flex align-items-center justify-content-between border-bottom py-3">
                        <div className="d-flex align-items-center gap-3">
                          {resolveProductImage(item) ? (
                            <Image
                               src={resolveProductImage(item)}
                              rounded
                              style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div className="d-flex align-items-center justify-content-center bg-light text-muted rounded" style={{ width: '70px', height: '70px' }}>
                              No image
                            </div>
                          )}
                          <div>
                            <h6 className="mb-1">{item.name}</h6>
                            <small className="text-muted">{item.flavor} • {item.size}</small>
                            <div className="fw-semibold text-primary">₹{item.price}</div>
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="fw-semibold" style={{ minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          >
                            +
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            className="ms-2"
                            onClick={() => removeFromCart(item._id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card>
                <Card.Header>Order Summary</Card.Header>
                <Card.Body>
                  <Row className="mb-3">
                    <Col>Subtotal:</Col>
                    <Col className="text-end">₹{cartTotal.toFixed(2)}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col>Delivery:</Col>
                    <Col className="text-end">₹{deliveryFee.toFixed(2)}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col>Tax (5%):</Col>
                    <Col className="text-end">₹{tax.toFixed(2)}</Col>
                  </Row>
                  <hr />
                  <Row className="mb-3">
                    <Col><strong>Total:</strong></Col>
                    <Col className="text-end"><strong>₹{total.toFixed(2)}</strong></Col>
                  </Row>
                  <Button
                    variant="success"
                    className="w-100"
                    disabled={cart.length === 0}
                    onClick={() => navigate('/checkout')}
                  >
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
