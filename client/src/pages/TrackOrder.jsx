import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Card, Badge, Alert, Spinner, Button, Row, Col, ProgressBar } from 'react-bootstrap';
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


const statusOrder = ['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];

const statusEmoji = {
  Placed: '📋',
  Confirmed: '✅',
  Preparing: '👨‍🍳',
  'Out for Delivery': '🚴',
  Delivered: '🎉',
  Cancelled: '❌'
};

const statusMessages = {
  Placed: 'Your order has been received',
  Confirmed: 'Your order has been confirmed',
  Preparing: 'We\'re preparing your ice cream',
  'Out for Delivery': 'Your order is on the way',
  Delivered: 'Order delivered!',
  Cancelled: 'Order cancelled'
};

const badgeVariant = (status) => {
  const map = { Placed: 'secondary', Confirmed: 'info', Preparing: 'warning', 'Out for Delivery': 'primary', Delivered: 'success', Cancelled: 'danger' };
  return map[status] || 'secondary';
};

const TrackOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [reconLoading, setReconLoading] = useState(false);
  const [etaCountdown, setEtaCountdown] = useState(null);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data.data);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to fetch order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!order) return;
    const timer = setInterval(() => {
      if (order.estimatedDeliveryAt) {
        const diff = Math.max(0, Math.ceil((new Date(order.estimatedDeliveryAt) - new Date()) / 60000));
        setEtaCountdown(diff);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [order]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !id) return undefined;

    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const streamUrl = `${base.replace('/api', '')}/api/stream/me?token=${encodeURIComponent(token)}`;
    const eventSource = new EventSource(streamUrl);

    const handleOrderEvent = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.orderId === id) fetchOrder();
      } catch (error) {
        // ignore error
      }
    };

    eventSource.addEventListener('order_update', handleOrderEvent);
    eventSource.addEventListener('payment_update', handleOrderEvent);

    return () => {
      eventSource.removeEventListener('order_update', handleOrderEvent);
      eventSource.removeEventListener('payment_update', handleOrderEvent);
      eventSource.close();
    };
  }, [id]);

  const handleCancelOrder = async () => {
    try {
      setCancelLoading(true);
      await api.post(`/orders/${id}/cancel`, { reason: 'Cancelled by customer' });
      await fetchOrder();
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to cancel');
    } finally {
      setCancelLoading(false);
    }
  };

  const handlePayNow = async () => {
    try {
      setPayLoading(true);
      setError('');
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError('Unable to load payment gateway');
        setPayLoading(false);
        return;
      }
      const paymentRes = await api.post('/payments/create-order', { orderId: id });
      const paymentData = paymentRes.data?.data;
      const options = {
        key: paymentData.keyId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: 'FrozenDelights',
        description: 'Order Payment',
        order_id: paymentData.razorpayOrderId,
        prefill: { name: order?.userId?.name || '', email: order?.userId?.email || '' },
        notes: { orderId: id },
        handler: async (razorpayResponse) => {
          try {
            await api.post('/payments/verify', {
              orderId: id,
              razorpayOrderId: razorpayResponse.razorpay_order_id,
              razorpayPaymentId: razorpayResponse.razorpay_payment_id,
              razorpaySignature: razorpayResponse.razorpay_signature
            });
            await fetchOrder();
          } catch (verifyError) {
            setError(verifyError.response?.data?.message || 'Verification failed');
          }
        },
        modal: { ondismiss: () => setError('Payment cancelled') },
        theme: { color: '#0d6efd' }
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to initiate payment');
    } finally {
      setPayLoading(false);
    }
  };

  const handleReconcile = async () => {
    try {
      setReconLoading(true);
      setError('');
      await api.post(`/payments/reconcile/${id}`);
      await fetchOrder();
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to sync');
    } finally {
      setReconLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Loading...</p>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || 'Order not found'}</Alert>
      </Container>
    );
  }

  const currentStepIndex = statusOrder.indexOf(order.orderStatus);
  const isTerminal = ['Delivered', 'Cancelled'].includes(order.orderStatus);
  const progress = isTerminal ? 100 : ((currentStepIndex + 1) / statusOrder.length) * 100;
  const trackBadgeVariant = badgeVariant(order.orderStatus);

  return (
    <Container className="py-4">
      <div className="mb-3">
        <Button as={Link} to="/my-orders" variant="outline-secondary" size="sm">← Back to Orders</Button>
      </div>

      <Card className="border-0 shadow-sm mb-4 overflow-hidden">
        <Card.Body className="p-4 p-lg-5">
          <Row className="g-4 align-items-center">
            <Col lg={8}>
              <Badge bg="dark" className="mb-3">Live tracking</Badge>
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <h3 className="mb-0">Order #{order._id.slice(-8).toUpperCase()}</h3>
                <Badge bg={trackBadgeVariant} className="fs-6">{order.orderStatus}</Badge>
              </div>
              <small className="text-muted">Placed on {new Date(order.createdAt).toLocaleString()}</small>
            </Col>
            <Col lg={4} className="text-lg-end">
              <div className="p-3 rounded-3 bg-body-tertiary d-inline-block text-start">
                <div className="fw-semibold mb-1">Delivery status</div>
                {!isTerminal ? (
                  order.isDelayed ? (
                    <div>
                      <Badge bg="danger" className="mb-2">Running {order.delayMinutes}m late</Badge>
                      <div className="small text-muted">We are actively processing this order.</div>
                    </div>
                  ) : (
                    <div>
                      <Badge bg="success" className="mb-2">On track</Badge>
                      <div className="small text-muted">ETA: {etaCountdown ?? order.etaMinutesRemaining ?? '-'} min</div>
                    </div>
                  )
                ) : (
                  <div>
                    <Badge bg={order.orderStatus === 'Delivered' ? 'success' : 'secondary'} className="mb-2">{order.orderStatus}</Badge>
                    <div className="small text-muted">This order has reached a final status.</div>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      {!isTerminal && (
        <Alert variant={order.isDelayed ? 'warning' : 'info'} className="mb-4 border-0 shadow-sm">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div>
              <div className="fw-semibold mb-1">{order.isDelayed ? `⏰ Running ${order.delayMinutes}m late` : '⏱️ On track'}</div>
              <div className="small">{statusMessages[order.orderStatus] || 'Your order is moving ahead.'}</div>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              {order.delaySeverity === 'critical' && <Badge bg="danger">Critical</Badge>}
              {order.delaySeverity === 'warning' && <Badge bg="warning" text="dark">Warning</Badge>}
            </div>
          </div>
        </Alert>
      )}

      <Row className="g-4 mb-4">
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent fw-semibold">Items</Card.Header>
            <Card.Body>
              {order.items.map((item, i) => (
                <div key={i} className="d-flex justify-content-between border-bottom py-3">
                  <div>
                    <div className="fw-semibold">{item.name}</div>
                    <small className="text-muted">{item.flavor} / {item.size} • Qty {item.quantity}</small>
                  </div>
                  <div className="fw-semibold">₹{(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent fw-semibold">Summary</Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2"><span>Subtotal:</span><span>₹{order.subtotal?.toFixed(2)}</span></div>
              {order.discountAmount > 0 && <div className="d-flex justify-content-between mb-2 text-success"><span>Discount:</span><span>-₹{order.discountAmount?.toFixed(2)}</span></div>}
              <div className="d-flex justify-content-between mb-2"><span>Tax (5%):</span><span>₹{order.tax?.toFixed(2)}</span></div>
              <div className="d-flex justify-content-between mb-3 border-top pt-3"><strong>Total:</strong><strong className="fs-5">₹{order.totalAmount?.toFixed(2)}</strong></div>
              <div className="p-3 rounded-3 bg-body-tertiary">
                <small className="d-block mb-1"><strong>Payment:</strong> {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}</small>
                <Badge bg={order.paymentStatus === 'paid' ? 'success' : 'warning'}>{order.paymentStatus}</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Body className="d-flex gap-2 flex-wrap">
          {['Placed', 'Confirmed'].includes(order.orderStatus) && <Button variant="outline-danger" onClick={handleCancelOrder} disabled={cancelLoading}>{cancelLoading ? 'Cancelling...' : 'Cancel Order'}</Button>}
          {order.paymentMethod !== 'cod' && order.paymentStatus !== 'paid' && order.orderStatus !== 'Cancelled' && <Button variant="success" onClick={handlePayNow} disabled={payLoading}>{payLoading ? 'Opening Payment...' : 'Pay Now'}</Button>}
          {order.paymentMethod !== 'cod' && order.paymentStatus !== 'paid' && <Button variant="outline-primary" onClick={handleReconcile} disabled={reconLoading}>{reconLoading ? 'Syncing...' : 'Sync Payment'}</Button>}
          <Button variant="primary" onClick={() => navigate('/menu')} className="ms-auto">Order Again</Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TrackOrder;
