import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Form, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api/axios';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [formData, setFormData] = useState({
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    paymentMethod: 'cod'
  });

  const discount = appliedCoupon?.discount || 0;
  const discountedSubtotal = Number(Math.max(cartTotal - discount, 0).toFixed(2));
  const deliveryFee = cart.length > 0 ? (discountedSubtotal >= 299 ? 0 : 20) : 0;
  const tax = Number((discountedSubtotal * 0.05).toFixed(2));
  const total = Number((discountedSubtotal + tax + deliveryFee).toFixed(2));
  const savingsText = useMemo(() => {
    if (discount > 0) {
      return `You are saving ₹${discount.toFixed(2)} with your coupon.`;
    }

    return 'Add a coupon code to reduce the total amount.';
  }, [discount]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      setError('Please enter a coupon code.');
      return;
    }

    if (cartTotal <= 0) {
      setError('Add items to cart before applying coupon.');
      return;
    }

    try {
      setCouponLoading(true);
      setError('');

      const response = await api.post('/coupons/validate', {
        code: couponInput.trim(),
        subtotal: cartTotal
      });

      setAppliedCoupon(response.data?.data || null);
    } catch (apiError) {
      setAppliedCoupon(null);
      setError(apiError.response?.data?.message || 'Failed to apply coupon.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      setError('Your cart is empty. Add items before checkout.');
      return;
    }

    if (!formData.street || !formData.city || !formData.state || !formData.postalCode) {
      setError('Please complete your delivery address.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const isOnlinePayment = formData.paymentMethod === 'card' || formData.paymentMethod === 'upi';
      if (isOnlinePayment && !import.meta.env.VITE_RAZORPAY_KEY_ID) {
        setError('Online payment is not configured. Please select Cash on Delivery.');
        setLoading(false);
        return;
      }

      const payload = {
        items: cart.map((item) => ({
          productId: item._id,
          quantity: item.quantity
        })),
        deliveryAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone
        },
        paymentMethod: formData.paymentMethod
      };

      if (appliedCoupon?.code) {
        payload.couponCode = appliedCoupon.code;
      }

      const response = await api.post('/orders', payload);
      const orderId = response.data?.data?._id;

      if (!isOnlinePayment) {
        clearCart();
        navigate(`/order/${orderId}/success`);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Unable to load payment gateway. Please try again or use Cash on Delivery.');
        setLoading(false);
        return;
      }

      const paymentRes = await api.post('/payments/create-order', { orderId });
      const paymentData = paymentRes.data?.data;

      const options = {
        key: paymentData.keyId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: 'FrozenDelights',
        description: 'Ice Cream Order Payment',
        order_id: paymentData.razorpayOrderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: formData.phone || ''
        },
        notes: {
          orderId
        },
        handler: async (razorpayResponse) => {
          try {
            await api.post('/payments/verify', {
              orderId,
              razorpayOrderId: razorpayResponse.razorpay_order_id,
              razorpayPaymentId: razorpayResponse.razorpay_payment_id,
              razorpaySignature: razorpayResponse.razorpay_signature
            });

            clearCart();
            navigate(`/order/${orderId}/success`);
          } catch (verifyError) {
            setError(verifyError.response?.data?.message || 'Payment verification failed.');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setError('Payment cancelled. You can retry from My Orders.');
            setLoading(false);
          }
        },
        theme: {
          color: '#0d6efd'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      return;
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          <Card className="border-0 shadow-sm overflow-hidden mb-4">
            <Card.Body className="p-4 p-lg-5">
              <Row className="align-items-center g-4">
                <Col lg={8}>
                  <Badge bg="dark" className="mb-3">Secure checkout</Badge>
                  <h1 className="fw-bold mb-2">Complete your order</h1>
                  <p className="text-muted mb-0" style={{ maxWidth: '48rem' }}>
                    Review your delivery details, apply a coupon if you have one, and place your order with a clear summary of every charge.
                  </p>
                </Col>
                <Col lg={4} className="text-lg-end">
                  <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
                    <Badge bg="primary" className="px-3 py-2">{cart.length} item(s)</Badge>
                    <Badge bg="success" className="px-3 py-2">₹{total.toFixed(2)} total</Badge>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {error && <Alert variant="danger">{error}</Alert>}

          {cart.length === 0 && (
            <Alert variant="info">
              Your cart is empty! <a href="/menu">Browse our menu</a> to add items before checkout.
            </Alert>
          )}
          
          <Row className="g-4">
            <Col md={8}>
              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-transparent fw-semibold">Delivery Information</Card.Header>
                <Card.Body>
                  <Form>
                    <Form.Group className="mb-3" controlId="email">
                      <Form.Label>Email</Form.Label>
                      <Form.Control type="email" value={user.email} disabled />
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="phone">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="street">
                      <Form.Label>Street Address</Form.Label>
                      <Form.Control
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        placeholder="House no, street, area"
                      />
                    </Form.Group>

                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group controlId="city">
                          <Form.Label>City</Form.Label>
                          <Form.Control name="city" value={formData.city} onChange={handleChange} />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group controlId="state">
                          <Form.Label>State</Form.Label>
                          <Form.Control name="state" value={formData.state} onChange={handleChange} />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3" controlId="postalCode">
                      <Form.Label>Postal Code</Form.Label>
                      <Form.Control name="postalCode" value={formData.postalCode} onChange={handleChange} />
                    </Form.Group>
                  </Form>
                </Card.Body>
              </Card>
              
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-transparent fw-semibold">Payment Information</Card.Header>
                <Card.Body>
                  <div className="mb-3 text-muted small">
                    Choose the payment method that works best for you.
                  </div>
                  <Form>
                    {[
                      { value: 'cod', label: 'Cash on Delivery', note: 'Pay when your order arrives' },
                      { value: 'card', label: 'Credit/Debit Card', note: 'Fast online payment' },
                      { value: 'upi', label: 'UPI Payment', note: 'Quick scan and pay' }
                    ].map((option) => (
                      <Form.Check
                        key={option.value}
                        type="radio"
                        className="border rounded-3 p-3 mb-3"
                        label={
                          <div>
                            <div className="fw-semibold">{option.label}</div>
                            <small className="text-muted">{option.note}</small>
                          </div>
                        }
                        name="paymentMethod"
                        value={option.value}
                        checked={formData.paymentMethod === option.value}
                        onChange={handleChange}
                      />
                    ))}
                  </Form>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card className="sticky-top border-0 shadow-sm" style={{ top: '96px' }}>
                <Card.Header className="bg-transparent fw-semibold">Order Summary</Card.Header>
                <Card.Body>
                  <div className="mb-3 p-3 rounded-3 bg-body-tertiary">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-semibold">Current savings</span>
                      <Badge bg={discount > 0 ? 'success' : 'secondary'}>
                        {discount > 0 ? `₹${discount.toFixed(2)}` : 'None'}
                      </Badge>
                    </div>
                    <small className="text-muted">{savingsText}</small>
                  </div>

                  <div className="mb-3">
                    <Form.Label>Coupon Code</Form.Label>
                    <div className="d-flex gap-2">
                      <Form.Control
                        placeholder="Enter coupon"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        disabled={couponLoading || !!appliedCoupon}
                      />
                      {appliedCoupon ? (
                        <Button variant="outline-danger" onClick={handleRemoveCoupon}>Remove</Button>
                      ) : (
                        <Button variant="outline-primary" onClick={handleApplyCoupon} disabled={couponLoading || !couponInput.trim()}>
                          {couponLoading ? 'Applying...' : 'Apply'}
                        </Button>
                      )}
                    </div>
                    {appliedCoupon && <small className="text-success d-block mt-2">{appliedCoupon.code} applied successfully.</small>}
                  </div>

                  {cart.length === 0 ? (
                    <div className="text-center text-muted py-3">
                      <p>Your cart is empty</p>
                      <small>Add items to see order summary</small>
                    </div>
                  ) : (
                    <div className="mb-3">
                      {cart.map((item) => (
                        <div key={item._id} className="d-flex justify-content-between mb-2">
                          <small>{item.name} × {item.quantity}</small>
                          <small>₹{(item.price * item.quantity).toFixed(2)}</small>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <hr />
                  
                  <div className="mb-3">
                    <Row>
                      <Col>Subtotal:</Col>
                      <Col className="text-end">₹{cartTotal.toFixed(2)}</Col>
                    </Row>
                    <Row>
                      <Col>Discount:</Col>
                      <Col className="text-end text-success">- ₹{discount.toFixed(2)}</Col>
                    </Row>
                    <Row>
                      <Col>Delivery:</Col>
                      <Col className="text-end">₹{deliveryFee.toFixed(2)}</Col>
                    </Row>
                    <Row>
                      <Col>Tax:</Col>
                      <Col className="text-end">₹{tax.toFixed(2)}</Col>
                    </Row>
                  </div>
                  
                  <hr />
                  
                  <Row className="mb-3">
                    <Col><strong>Total:</strong></Col>
                    <Col className="text-end"><strong>₹{total.toFixed(2)}</strong></Col>
                  </Row>

                  <div className="mb-3 small text-muted">
                    Delivery fee becomes free above ₹299. Taxes are included in the total shown above.
                  </div>
                  
                  <Button
                    variant="success"
                    className="w-100"
                    disabled={cart.length === 0 || loading}
                    onClick={handlePlaceOrder}
                  >
                    {loading ? 'Placing Order...' : 'Place Order'}
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
