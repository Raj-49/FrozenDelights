import React, { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, Badge, Alert, Spinner, Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../../api/axios';

const statusBadgeVariant = (status) => {
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

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [sales, setSales] = useState([]);
  const [orderStats, setOrderStats] = useState([]);
  const [productStats, setProductStats] = useState([]);
  const [revenueSummary, setRevenueSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const chartColors = ['#0d6efd', '#20c997', '#ffc107', '#dc3545', '#6f42c1', '#198754'];

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [ordersRes, salesRes, orderStatsRes, productRes, revenueRes] = await Promise.all([
          api.get('/orders/admin/all'),
          api.get('/analytics/sales?days=7'),
          api.get('/analytics/orders'),
          api.get('/analytics/products'),
          api.get('/analytics/revenue')
        ]);

        setOrders(ordersRes.data?.data || []);
        setSales(salesRes.data?.data || []);
        setOrderStats(orderStatsRes.data?.data || []);
        setProductStats(productRes.data?.data || []);
        setRevenueSummary(revenueRes.data?.data || null);
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const metrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = orders.filter((order) => new Date(order.createdAt) >= today);
    const activeOrders = orders.filter((order) => ['Placed', 'Confirmed', 'Preparing', 'Out for Delivery'].includes(order.orderStatus));
    const deliveredOrders = orders.filter((order) => order.orderStatus === 'Delivered');
    const cancelledOrders = orders.filter((order) => order.orderStatus === 'Cancelled');
    const delayedWarning = orders.filter((order) => order.delaySeverity === 'warning').length;
    const delayedCritical = orders.filter((order) => order.delaySeverity === 'critical').length;
    const totalRevenue = revenueSummary?.totalRevenue ?? deliveredOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

    return {
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      activeOrders: activeOrders.length,
      deliveredOrders: deliveredOrders.length,
      cancelledOrders: cancelledOrders.length,
      delayedWarning,
      delayedCritical,
      totalRevenue
    };
  }, [orders, revenueSummary]);

  const recentOrders = useMemo(() => orders.slice(0, 8), [orders]);
  const urgentOrders = useMemo(() => {
    return orders
      .filter((order) => order.delaySeverity === 'critical' || order.delaySeverity === 'warning')
      .slice(0, 6);
  }, [orders]);

  const activeQueue = useMemo(() => {
    return orders
      .filter((order) => ['Placed', 'Confirmed', 'Preparing', 'Out for Delivery'].includes(order.orderStatus))
      .slice(0, 6);
  }, [orders]);

  return (
    <Container className="py-4">
      <Card className="mb-4 border-0 shadow-sm overflow-hidden">
        <Card.Body className="p-4 p-lg-5">
          <Row className="align-items-center g-4">
            <Col lg={8}>
              <Badge bg="dark" className="mb-3">Operations Console</Badge>
              <h2 className="fw-bold mb-2">Admin Dashboard</h2>
              <p className="text-muted mb-0" style={{ maxWidth: '58rem' }}>
                A focused view for monitoring orders, revenue, product performance, and urgent delivery issues in one place.
              </p>
            </Col>
            <Col lg={4} className="text-lg-end">
              <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
                <Button as={Link} to="/admin/orders" variant="primary">Open Orders</Button>
                <Button as={Link} to="/admin/products" variant="outline-primary">Products</Button>
                <Button as={Link} to="/admin/coupons" variant="outline-dark">Coupons</Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-3 mb-0">Loading dashboard...</p>
        </div>
      ) : (
        <>
          <Row className="g-3 mb-4">
            <Col md={6} lg={3}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <small className="text-muted">Total Orders</small>
                  <h3 className="mb-0 fw-bold">{metrics.totalOrders}</h3>
                  <small className="text-muted">All customer orders recorded</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <small className="text-muted">Today</small>
                  <h3 className="mb-0 fw-bold text-primary">{metrics.todayOrders}</h3>
                  <small className="text-muted">New orders placed today</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <small className="text-muted">In Progress</small>
                  <h3 className="mb-0 fw-bold text-warning">{metrics.activeOrders}</h3>
                  <small className="text-muted">Orders still moving through prep</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <small className="text-muted">Revenue</small>
                  <h3 className="mb-0 fw-bold text-success">₹{metrics.totalRevenue.toFixed(2)}</h3>
                  <small className="text-muted">Revenue recognized from completed sales</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-3 mb-4">
            <Col lg={7}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="d-flex justify-content-between align-items-center bg-transparent">
                  <span className="fw-semibold">Urgent Queue</span>
                  <Badge bg={urgentOrders.length > 0 ? 'danger' : 'success'}>{urgentOrders.length}</Badge>
                </Card.Header>
                <Card.Body>
                  {urgentOrders.length === 0 ? (
                    <div className="text-center text-muted py-4">No delayed orders right now.</div>
                  ) : (
                    <div className="d-grid gap-2">
                      {urgentOrders.map((order) => (
                        <div key={order._id} className="border rounded-3 p-3 d-flex justify-content-between align-items-center">
                          <div>
                            <div className="fw-semibold">#{order._id.slice(-8).toUpperCase()}</div>
                            <small className="text-muted">
                              {order.userId?.name || 'Unknown customer'} • {new Date(order.createdAt).toLocaleString()}
                            </small>
                            <div className="mt-1">
                              <Badge bg={order.delaySeverity === 'critical' ? 'danger' : 'warning'}>
                                {order.delaySeverity === 'critical' ? `Critical delay +${order.delayMinutes || 0} min` : `Warning +${order.delayMinutes || 0} min`}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-end">
                            <Badge bg={statusBadgeVariant(order.orderStatus)} className="mb-2">{order.orderStatus}</Badge>
                            <div className="fw-semibold">₹{Number(order.totalAmount || 0).toFixed(2)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={5}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-transparent fw-semibold">Quick Actions</Card.Header>
                <Card.Body className="d-grid gap-2">
                  <Button as={Link} to="/admin/orders" variant="primary">Review Orders</Button>
                  <Button as={Link} to="/admin/products" variant="outline-primary">Update Catalog</Button>
                  <Button as={Link} to="/admin/coupons" variant="outline-dark">Manage Offers</Button>
                  <Button as={Link} to="/" variant="outline-secondary">Open Customer Store</Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center bg-transparent">
              <span className="fw-semibold">Recent Orders</span>
              <Badge bg="dark">{recentOrders.length}</Badge>
            </Card.Header>
            <Card.Body>
              {recentOrders.length === 0 ? (
                <div className="text-center text-muted py-4">No orders yet.</div>
              ) : (
                <div className="table-responsive">
                  <Table hover align="middle" className="mb-0">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order._id}>
                          <td>#{order._id.slice(-8).toUpperCase()}</td>
                          <td>{order.userId?.name || 'Unknown'}</td>
                          <td><Badge bg={statusBadgeVariant(order.orderStatus)}>{order.orderStatus}</Badge></td>
                          <td>₹{Number(order.totalAmount || 0).toFixed(2)}</td>
                          <td>{new Date(order.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>

          <Row className="g-3 mt-1">
            <Col lg={7}>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-transparent fw-semibold">Last 7 Days Sales</Card.Header>
                <Card.Body style={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sales}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#0d6efd" name="Revenue (₹)" />
                      <Bar dataKey="orders" fill="#20c997" name="Orders" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={5}>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-transparent fw-semibold">Order Status Mix</Card.Header>
                <Card.Body style={{ height: 320 }}>
                  {orderStats.length === 0 ? (
                    <div className="text-center text-muted py-5">No data available.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={orderStats}
                          dataKey="count"
                          nameKey="status"
                          outerRadius={110}
                          label
                        >
                          {orderStats.map((entry, index) => (
                            <Cell key={entry.status} fill={chartColors[index % chartColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="mt-3 border-0 shadow-sm">
            <Card.Header className="bg-transparent fw-semibold">Top Products (By Quantity Sold)</Card.Header>
            <Card.Body>
              {productStats.length === 0 ? (
                <div className="text-center text-muted py-4">No product analytics available.</div>
              ) : (
                <div className="table-responsive">
                  <Table hover align="middle" className="mb-0">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Units Sold</th>
                        <th>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productStats.map((item) => (
                        <tr key={item.productId}>
                          <td>{item.name}</td>
                          <td>{item.quantitySold}</td>
                          <td>₹{Number(item.revenue || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
};

export default AdminDashboard;
