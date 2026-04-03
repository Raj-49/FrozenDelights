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

  return (
    <Container className="py-4">
      <div className="mb-4 d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h2 className="fw-bold">Admin Dashboard</h2>
          <p className="text-muted mb-0">Operational snapshot for orders and revenue.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <Button as={Link} to="/admin/products" variant="outline-secondary" size="sm">Manage Products</Button>
          <Button as={Link} to="/admin/orders" variant="outline-primary" size="sm">Manage Orders</Button>
          <Button as={Link} to="/admin/coupons" variant="outline-dark" size="sm">Manage Coupons</Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-3 mb-0">Loading dashboard...</p>
        </div>
      ) : (
        <>
          <Row className="g-3 mb-4">
            <Col md={4} lg={3}>
              <Card><Card.Body><small className="text-muted">Total Orders</small><h4 className="mb-0">{metrics.totalOrders}</h4></Card.Body></Card>
            </Col>
            <Col md={4} lg={3}>
              <Card><Card.Body><small className="text-muted">Today</small><h4 className="mb-0">{metrics.todayOrders}</h4></Card.Body></Card>
            </Col>
            <Col md={4} lg={3}>
              <Card><Card.Body><small className="text-muted">In Progress</small><h4 className="mb-0">{metrics.activeOrders}</h4></Card.Body></Card>
            </Col>
            <Col md={4} lg={3}>
              <Card><Card.Body><small className="text-muted">Delivered</small><h4 className="mb-0">{metrics.deliveredOrders}</h4></Card.Body></Card>
            </Col>
            <Col md={4} lg={3}>
              <Card><Card.Body><small className="text-muted">Cancelled</small><h4 className="mb-0">{metrics.cancelledOrders}</h4></Card.Body></Card>
            </Col>
            <Col md={4} lg={3}>
              <Card><Card.Body><small className="text-muted">Delay Warning (&gt;=10m)</small><h4 className="mb-0 text-warning">{metrics.delayedWarning}</h4></Card.Body></Card>
            </Col>
            <Col md={4} lg={3}>
              <Card><Card.Body><small className="text-muted">Critical Delay (&gt;=20m)</small><h4 className="mb-0 text-danger">{metrics.delayedCritical}</h4></Card.Body></Card>
            </Col>
            <Col md={4} lg={3}>
              <Card><Card.Body><small className="text-muted">Revenue</small><h6 className="mb-0">₹{metrics.totalRevenue.toFixed(2)}</h6></Card.Body></Card>
            </Col>
          </Row>

          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>Recent Orders</span>
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
                          <td><Badge bg="secondary">{order.orderStatus}</Badge></td>
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
              <Card>
                <Card.Header>Last 7 Days Sales</Card.Header>
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
              <Card>
                <Card.Header>Order Status Mix</Card.Header>
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

          <Card className="mt-3">
            <Card.Header>Top Products (By Quantity Sold)</Card.Header>
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
