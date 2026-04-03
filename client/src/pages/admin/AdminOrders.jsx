import React, { useEffect, useMemo, useState } from 'react';
import { Container, Card, Table, Badge, Button, Form, Alert, Spinner } from 'react-bootstrap';
import api from '../../api/axios';

const STATUS_OPTIONS = ['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
const ALLOWED_NEXT_STATUSES = {
  Placed: ['Confirmed', 'Cancelled'],
  Confirmed: ['Preparing', 'Cancelled'],
  Preparing: ['Out for Delivery'],
  'Out for Delivery': ['Delivered'],
  Delivered: [],
  Cancelled: []
};

const badgeVariant = (status) => {
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

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusDrafts, setStatusDrafts] = useState({});
  const [updatingOrderId, setUpdatingOrderId] = useState('');
  const [success, setSuccess] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/orders/admin/all');
      const orderData = response.data?.data || [];
      setOrders(orderData);

      const draftMap = {};
      orderData.forEach((order) => {
        draftMap[order._id] = order.orderStatus;
      });
      setStatusDrafts(draftMap);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const groupedCounts = useMemo(() => {
    const counts = { total: orders.length };

    STATUS_OPTIONS.forEach((status) => {
      counts[status] = orders.filter((order) => order.orderStatus === status).length;
    });

    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (priorityFilter === 'critical') {
      return orders.filter((order) => order.delaySeverity === 'critical');
    }
    if (priorityFilter === 'warning') {
      return orders.filter((order) => order.delaySeverity === 'warning');
    }
    if (priorityFilter === 'ontime') {
      return orders.filter((order) => !order.isDelayed && !['Delivered', 'Cancelled'].includes(order.orderStatus));
    }
    return orders;
  }, [orders, priorityFilter]);

  const handleStatusChange = (orderId, status) => {
    setStatusDrafts((prev) => ({
      ...prev,
      [orderId]: status
    }));
  };

  const handleUpdateStatus = async (orderId) => {
    const nextStatus = statusDrafts[orderId];
    const currentOrder = orders.find((order) => order._id === orderId);

    if (!currentOrder || nextStatus === currentOrder.orderStatus) {
      return;
    }

    try {
      setUpdatingOrderId(orderId);
      setError('');
      setSuccess('');

      await api.patch(`/orders/${orderId}/status`, {
        status: nextStatus,
        note: `Updated by admin to ${nextStatus}`
      });

      setSuccess('Order status updated successfully');
      await fetchOrders();
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId('');
    }
  };

  const getStatusOptionsForOrder = (currentStatus) => {
    const nextStatuses = ALLOWED_NEXT_STATUSES[currentStatus] || [];
    return [currentStatus, ...nextStatuses];
  };

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h2 className="fw-bold">Admin Orders</h2>
        <p className="text-muted mb-0">Monitor all customer orders and process status transitions.</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="mb-4">
        <Card.Body className="d-flex gap-2 flex-wrap">
          <Badge bg="dark">Total: {groupedCounts.total || 0}</Badge>
          <Badge bg="secondary">Placed: {groupedCounts.Placed || 0}</Badge>
          <Badge bg="info">Confirmed: {groupedCounts.Confirmed || 0}</Badge>
          <Badge bg="warning" text="dark">Preparing: {groupedCounts.Preparing || 0}</Badge>
          <Badge bg="primary">Out for Delivery: {groupedCounts['Out for Delivery'] || 0}</Badge>
          <Badge bg="success">Delivered: {groupedCounts.Delivered || 0}</Badge>
          <Badge bg="danger">Cancelled: {groupedCounts.Cancelled || 0}</Badge>
        </Card.Body>
      </Card>

      <div className="d-flex gap-2 flex-wrap mb-3">
        <Button size="sm" variant={priorityFilter === 'all' ? 'dark' : 'outline-dark'} onClick={() => setPriorityFilter('all')}>All</Button>
        <Button size="sm" variant={priorityFilter === 'critical' ? 'danger' : 'outline-danger'} onClick={() => setPriorityFilter('critical')}>Critical Delay</Button>
        <Button size="sm" variant={priorityFilter === 'warning' ? 'warning' : 'outline-warning'} onClick={() => setPriorityFilter('warning')}>Warning Delay</Button>
        <Button size="sm" variant={priorityFilter === 'ontime' ? 'success' : 'outline-success'} onClick={() => setPriorityFilter('ontime')}>On Time</Button>
      </div>

      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-2 mb-0">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-5 text-muted">No orders found.</div>
          ) : (
            <div className="table-responsive">
              <Table hover align="middle">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>SLA</th>
                    <th>Current</th>
                    <th>Update Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <div className="fw-semibold">#{order._id.slice(-8).toUpperCase()}</div>
                        <small className="text-muted">{new Date(order.createdAt).toLocaleString()}</small>
                      </td>
                      <td>
                        <div>{order.userId?.name || 'Unknown'}</div>
                        <small className="text-muted">{order.userId?.email || 'No email'}</small>
                      </td>
                      <td>₹{Number(order.totalAmount || 0).toFixed(2)}</td>
                      <td>
                        {order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled' ? (
                          <Badge bg="secondary">Closed</Badge>
                        ) : order.delaySeverity === 'critical' ? (
                          <>
                            <Badge bg="danger">Critical</Badge>
                            <div><small className="text-danger">+{order.delayMinutes || 0} min</small></div>
                          </>
                        ) : order.delaySeverity === 'warning' ? (
                          <>
                            <Badge bg="warning" text="dark">Warning</Badge>
                            <div><small className="text-warning">+{order.delayMinutes || 0} min</small></div>
                          </>
                        ) : (
                          <>
                            <Badge bg="success">On Time</Badge>
                            <div><small className="text-muted">ETA {order.etaMinutesRemaining ?? '-'} min</small></div>
                          </>
                        )}
                      </td>
                      <td>
                        <Badge bg={badgeVariant(order.orderStatus)}>{order.orderStatus}</Badge>
                      </td>
                      <td style={{ minWidth: '190px' }}>
                        <Form.Select
                          size="sm"
                          value={statusDrafts[order._id] || order.orderStatus}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        >
                          {getStatusOptionsForOrder(order.orderStatus).map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </Form.Select>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(order._id)}
                          disabled={
                            updatingOrderId === order._id ||
                            (statusDrafts[order._id] || order.orderStatus) === order.orderStatus
                          }
                        >
                          {updatingOrderId === order._id ? 'Saving...' : 'Update'}
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
    </Container>
  );
};

export default AdminOrders;
