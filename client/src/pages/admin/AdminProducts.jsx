import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Spinner, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { resolveProductImage, resolveProductImages } from '../../utils/productImage';

const initialForm = {
  name: '',
  category: 'cone',
  flavor: '',
  size: 'medium',
  description: '',
  price: '',
  stock: ''
};

const CATEGORIES = ['cone', 'cup', 'family pack', 'combo'];
const SIZES = ['small', 'medium', 'large'];

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState('');
  const [toggling, setToggling] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState('');
  const [imageFiles, setImageFiles] = useState([]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/products/admin/all');
      setProducts(response.data?.data || []);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const summary = useMemo(() => {
    const total = products.length;
    const available = products.filter((p) => p.available).length;
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const lowStock = products.filter((p) => p.stock < 5).length;

    return { total, available, totalStock, lowStock };
  }, [products]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (event) => {
    const selected = Array.from(event.target.files || []).slice(0, 4);
    setImageFiles(selected);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (imageFiles.length) {
        const payload = new FormData();
        payload.append('name', formData.name.trim());
        payload.append('category', formData.category);
        payload.append('flavor', formData.flavor.trim());
        payload.append('size', formData.size);
        payload.append('description', formData.description.trim());
        payload.append('price', Number(formData.price || 0));
        payload.append('stock', Number(formData.stock || 0));
        imageFiles.forEach((file) => {
          payload.append('images', file);
        });

        if (editingId) {
          await api.put(`/products/${editingId}`, payload, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          setSuccess('Product updated successfully');
        } else {
          await api.post('/products', payload, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          setSuccess('Product created successfully');
        }
      } else {
        const payload = {
          name: formData.name.trim(),
          category: formData.category,
          flavor: formData.flavor.trim(),
          size: formData.size,
          description: formData.description.trim(),
          price: Number(formData.price || 0),
          stock: Number(formData.stock || 0)
        };

        if (editingId) {
          await api.put(`/products/${editingId}`, payload);
          setSuccess('Product updated successfully');
        } else {
          await api.post('/products', payload);
          setSuccess('Product created successfully');
        }
      }

      setFormData(initialForm);
      setImageFiles([]);
      setEditingId('');
      await fetchProducts();
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      category: product.category,
      flavor: product.flavor,
      size: product.size,
      description: product.description || '',
      price: product.price,
      stock: product.stock
    });
    setEditingId(product._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setFormData(initialForm);
    setEditingId('');
    setImageFiles([]);
  };

  const handleToggle = async (productId) => {
    try {
      setToggling(productId);
      setError('');
      setSuccess('');
      await api.patch(`/products/${productId}/toggle`);
      await fetchProducts();
      setSuccess('Product status updated');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to toggle product');
    } finally {
      setToggling('');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      setDeleting(productId);
      setError('');
      setSuccess('');
      await api.delete(`/products/${productId}`);
      await fetchProducts();
      setSuccess('Product deleted successfully');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleting('');
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1">Admin Products</h2>
          <p className="text-muted mb-0">Create, edit, and manage product catalog.</p>
        </div>
        <div className="d-flex gap-2">
          <Button as={Link} to="/admin" variant="outline-dark" size="sm">Dashboard</Button>
          <Button as={Link} to="/admin/coupons" variant="outline-primary" size="sm">Coupons</Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="mb-4">
        <Card.Body className="d-flex gap-2 flex-wrap">
          <Badge bg="dark">Total: {summary.total}</Badge>
          <Badge bg="success">Available: {summary.available}</Badge>
          <Badge bg="info">Total Stock: {summary.totalStock}</Badge>
          <Badge bg="warning" text="dark">Low Stock (&lt;5): {summary.lowStock}</Badge>
        </Card.Body>
      </Card>

      <Row className="g-4">
        <Col lg={5}>
          <Card>
            <Card.Header>{editingId ? 'Edit Product' : 'Create Product'}</Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="productName">
                  <Form.Label>Product Name</Form.Label>
                  <Form.Control
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Vanilla Cone"
                    required
                  />
                </Form.Group>

                <Row className="g-2 mb-3">
                  <Col md={6}>
                    <Form.Group controlId="category">
                      <Form.Label>Category</Form.Label>
                      <Form.Select name="category" value={formData.category} onChange={handleChange}>
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="size">
                      <Form.Label>Size</Form.Label>
                      <Form.Select name="size" value={formData.size} onChange={handleChange}>
                        {SIZES.map((sz) => (
                          <option key={sz} value={sz}>{sz}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="flavor">
                  <Form.Label>Flavor</Form.Label>
                  <Form.Control
                    name="flavor"
                    value={formData.flavor}
                    onChange={handleChange}
                    placeholder="Vanilla, Chocolate, Strawberry..."
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="description">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Rich chocolate roll with soft cake layers and creamy center"
                  />
                </Form.Group>

                <Row className="g-2 mb-3">
                  <Col md={6}>
                    <Form.Group controlId="price">
                      <Form.Label>Price (₹)</Form.Label>
                      <Form.Control
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="stock">
                      <Form.Label>Stock</Form.Label>
                      <Form.Control
                        name="stock"
                        type="number"
                        min="0"
                        value={formData.stock}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="image">
                  <Form.Label>Product Images (Max 4)</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                  />
                  {imageFiles.length > 0 && (
                    <small className="text-muted d-block mt-2">Selected: {imageFiles.length} image(s)</small>
                  )}
                  {editingId && imageFiles.length === 0 && (
                    <small className="text-muted d-block mt-2">No new images selected. Existing images will be kept.</small>
                  )}
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button type="submit" disabled={saving}>
                    {saving ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update Product' : 'Create Product')}
                  </Button>
                  {editingId && (
                    <Button variant="outline-secondary" onClick={handleCancel}>Cancel</Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={7}>
          <Card>
            <Card.Header>All Products</Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center text-muted py-4">No products created yet.</div>
              ) : (
                <div className="table-responsive">
                  <Table hover align="middle" className="mb-0">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product._id}>
                          <td>
                            <div className="mb-2">
                              {resolveProductImage(product) ? (
                                <img
                                  src={resolveProductImage(product)}
                                  alt={product.name}
                                  loading="lazy"
                                  style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px' }}
                                />
                              ) : (
                                <div className="d-flex align-items-center justify-content-center bg-light text-muted" style={{ width: '64px', height: '64px', borderRadius: '8px' }}>
                                  No image
                                </div>
                              )}
                            </div>
                            {resolveProductImages(product).length > 1 && (
                              <div className="d-flex gap-1 mb-2">
                                {resolveProductImages(product).slice(0, 4).map((imageUrl, index) => (
                                  <img
                                    key={`${product._id}-thumb-${index}`}
                                    src={imageUrl}
                                    alt={`${product.name} ${index + 1}`}
                                    loading="lazy"
                                    style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px' }}
                                  />
                                ))}
                              </div>
                            )}
                            <div className="fw-semibold">{product.name}</div>
                            <small className="text-muted">{product.flavor} / {product.size}</small>
                            <small className="text-muted d-block">Images: {resolveProductImages(product).length}</small>
                          </td>
                          <td><Badge bg="secondary">{product.category}</Badge></td>
                          <td>₹{Number(product.price || 0).toFixed(2)}</td>
                          <td>
                            {product.stock}
                            {product.stock < 5 && (
                              <small className="text-danger d-block">Low</small>
                            )}
                          </td>
                          <td>
                            {product.available ? (
                              <Badge bg="success">Available</Badge>
                            ) : (
                              <Badge bg="secondary">Unavailable</Badge>
                            )}
                          </td>
                          <td style={{ minWidth: '150px' }}>
                            <div className="d-flex gap-1 flex-wrap">
                              <Button
                                size="sm"
                                variant="outline-primary"
                                disabled={editingId === product._id}
                                onClick={() => handleEdit(product)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant={product.available ? 'outline-warning' : 'outline-success'}
                                disabled={toggling === product._id}
                                onClick={() => handleToggle(product._id)}
                              >
                                {toggling === product._id ? '...' : product.available ? 'Disable' : 'Enable'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                disabled={deleting === product._id}
                                onClick={() => handleDelete(product._id)}
                              >
                                {deleting === product._id ? '...' : 'Delete'}
                              </Button>
                            </div>
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

export default AdminProducts;
