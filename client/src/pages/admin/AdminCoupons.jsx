import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Spinner, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const initialForm = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: '',
  minOrderAmount: '',
  maxDiscountAmount: '',
  usageLimit: '',
  perUserLimit: '1',
  startsAt: '',
  expiresAt: ''
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState(initialForm);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/coupons/admin/all');
      setCoupons(response.data?.data || []);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const summary = useMemo(() => {
    const total = coupons.length;
    const active = coupons.filter((coupon) => coupon.active).length;
    const inactive = total - active;
    const expired = coupons.filter((coupon) => new Date(coupon.expiresAt) < new Date()).length;

    return { total, active, inactive, expired };
  }, [coupons]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue || 0),
        minOrderAmount: Number(formData.minOrderAmount || 0),
        maxDiscountAmount: Number(formData.maxDiscountAmount || 0),
        usageLimit: Number(formData.usageLimit || 0),
        perUserLimit: Number(formData.perUserLimit || 1),
        startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : new Date().toISOString(),
        expiresAt: new Date(formData.expiresAt).toISOString()
      };

      await api.post('/coupons/admin', payload);
      setSuccess('Coupon created successfully');
      setFormData(initialForm);
      await fetchCoupons();
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to create coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (couponId) => {
    try {
      setTogglingId(couponId);
      setError('');
      setSuccess('');
      await api.patch(`/coupons/admin/${couponId}/toggle`);
      await fetchCoupons();
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to toggle coupon');
    } finally {
      setTogglingId('');
    }
  };

  return (
    <Container className="py-4">
      <Card className="border-0 shadow-sm overflow-hidden mb-4">
        <Card.Body className="p-4 p-lg-5">
          <Row className="align-items-center g-3">
            <Col lg={8}>
              <Badge bg="dark" className="mb-3">Promotions control</Badge>
              <h2 className="fw-bold mb-2">Admin Coupons</h2>
              <p className="text-muted mb-0" style={{ maxWidth: '48rem' }}>
                Create and manage discount offers with a clear view of active, inactive, and expiring promotions.
              </p>
            </Col>
            <Col lg={4} className="text-lg-end">
              <div className="d-flex gap-2 flex-wrap justify-content-lg-end">
                <Button as={Link} to="/admin" variant="outline-dark" size="sm">Dashboard</Button>
                <Button as={Link} to="/admin/orders" variant="outline-primary" size="sm">Orders</Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body className="d-flex gap-2 flex-wrap">
          <Badge bg="dark">Total: {summary.total}</Badge>
          <Badge bg="success">Active: {summary.active}</Badge>
          <Badge bg="secondary">Inactive: {summary.inactive}</Badge>
          <Badge bg="warning" text="dark">Expired: {summary.expired}</Badge>
        </Card.Body>
      </Card>

      <Row className="g-4">
        <Col lg={5}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent fw-semibold">Create Coupon</Card.Header>
            <Card.Body>
              <Form onSubmit={handleCreate}>
                <Form.Group className="mb-3" controlId="couponCode">
                  <Form.Label>Code</Form.Label>
                  <Form.Control
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="SUMMER50"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="couponDescription">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Flat savings on weekend orders"
                  />
                </Form.Group>

                <Row className="g-2 mb-3">
                  <Col md={6}>
                    <Form.Group controlId="discountType">
                      <Form.Label>Discount Type</Form.Label>
                      <Form.Select name="discountType" value={formData.discountType} onChange={handleChange}>
                        <option value="percentage">Percentage</option>
                        <option value="flat">Flat</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="discountValue">
                      <Form.Label>Discount Value</Form.Label>
                      <Form.Control
                        name="discountValue"
                        type="number"
                        min="1"
                        step="0.01"
                        value={formData.discountValue}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="g-2 mb-3">
                  <Col md={6}>
                    <Form.Group controlId="minOrderAmount">
                      <Form.Label>Min Order Amount</Form.Label>
                      <Form.Control
                        name="minOrderAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.minOrderAmount}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="maxDiscountAmount">
                      <Form.Label>Max Discount Amount</Form.Label>
                      <Form.Control
                        name="maxDiscountAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.maxDiscountAmount}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="g-2 mb-3">
                  <Col md={6}>
                    <Form.Group controlId="usageLimit">
                      <Form.Label>Total Usage Limit</Form.Label>
                      <Form.Control
                        name="usageLimit"
                        type="number"
                        min="0"
                        value={formData.usageLimit}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="perUserLimit">
                      <Form.Label>Per User Limit</Form.Label>
                      <Form.Control
                        name="perUserLimit"
                        type="number"
                        min="1"
                        value={formData.perUserLimit}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="g-2 mb-3">
                  <Col md={6}>
                    <Form.Group controlId="startsAt">
                      <Form.Label>Starts At</Form.Label>
                      <Form.Control
                        name="startsAt"
                        type="datetime-local"
                        value={formData.startsAt}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="expiresAt">
                      <Form.Label>Expires At</Form.Label>
                      <Form.Control
                        name="expiresAt"
                        type="datetime-local"
                        value={formData.expiresAt}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button type="submit" disabled={saving}>
                  {saving ? 'Creating...' : 'Create Coupon'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={7}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent fw-semibold">All Coupons</Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" />
                </div>
              ) : coupons.length === 0 ? (
                <div className="text-center text-muted py-4">No coupons created yet.</div>
              ) : (
                <div className="table-responsive">
                  <Table hover align="middle" className="mb-0">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Type</th>
                        <th>Value</th>
                        <th>Usage</th>
                        <th>Validity</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map((coupon) => (
                        <tr key={coupon._id}>
                          <td>
                            <div className="fw-semibold">{coupon.code}</div>
                            <small className="text-muted">{coupon.description || '-'}</small>
                          </td>
                          <td>{coupon.discountType}</td>
                          <td>
                            {coupon.discountType === 'percentage'
                              ? `${coupon.discountValue}%`
                              : `₹${Number(coupon.discountValue || 0).toFixed(2)}`}
                          </td>
                          <td>
                            {coupon.usedCount || 0}
                            {coupon.usageLimit > 0 ? ` / ${coupon.usageLimit}` : ' / ∞'}
                          </td>
                          <td>
                            <small>
                              {new Date(coupon.startsAt).toLocaleDateString()} - {new Date(coupon.expiresAt).toLocaleDateString()}
                            </small>
                          </td>
                          <td>
                            {coupon.active ? <Badge bg="success">Active</Badge> : <Badge bg="secondary">Inactive</Badge>}
                          </td>
                          <td>
                            <Button
                              size="sm"
                              variant={coupon.active ? 'outline-danger' : 'outline-success'}
                              disabled={togglingId === coupon._id}
                              onClick={() => handleToggle(coupon._id)}
                            >
                              {togglingId === coupon._id ? 'Saving...' : coupon.active ? 'Disable' : 'Enable'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminCoupons;
