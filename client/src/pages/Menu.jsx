import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { resolveProductImage } from '../utils/productImage';
import ProductViewerModal from '../components/ProductViewerModal';

const Menu = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [size, setSize] = useState('all');
  const [viewerProduct, setViewerProduct] = useState(null);

  const handleAddToCart = (product) => {
    if (product.stock > 0) {
      addToCart(product);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        if (response.data?.success) {
          setProducts(response.data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = useMemo(() => ['all', ...new Set(products.map((item) => item.category))], [products]);
  const sizes = useMemo(() => ['all', ...new Set(products.map((item) => item.size))], [products]);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return products.filter((item) => {
      const matchesSearch = !keyword
        || item.name?.toLowerCase().includes(keyword)
        || item.flavor?.toLowerCase().includes(keyword)
        || item.description?.toLowerCase().includes(keyword);
      const matchesCategory = category === 'all' || item.category === category;
      const matchesSize = size === 'all' || item.size === size;
      return matchesSearch && matchesCategory && matchesSize;
    });
  }, [products, search, category, size]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading full menu...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card className="border-0 shadow-sm mb-4 overflow-hidden">
        <Row className="g-0 align-items-center">
          <Col lg={8} className="p-4">
            <h2 className="fw-bold mb-2">Complete FrozenDelights Menu</h2>
            <p className="text-muted mb-0">Detailed catalog with flavors, sizes, pricing and rich visuals.</p>
          </Col>
          <Col lg={4}>
            <img
              src="https://loremflickr.com/1200/900/gelato,icecream?lock=3001"
              alt="Menu hero"
              style={{ width: '100%', height: '100%', minHeight: '220px', objectFit: 'cover' }}
            />
          </Col>
        </Row>
      </Card>

      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col md={5}>
              <Form.Control
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, flavor, or description"
              />
            </Col>
            <Col md={3}>
              <Form.Select value={category} onChange={(event) => setCategory(event.target.value)}>
                {categories.map((item) => (
                  <option key={item} value={item}>{item === 'all' ? 'All Categories' : item}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select value={size} onChange={(event) => setSize(event.target.value)}>
                {sizes.map((item) => (
                  <option key={item} value={item}>{item === 'all' ? 'All Sizes' : item}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2} className="d-flex align-items-center fw-semibold">
              Items: {filteredProducts.length}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row xs={1} md={2} lg={3} className="g-4">
        {filteredProducts.map((product) => (
          <Col key={product._id}>
            <Card
              className="h-100 border-0 shadow-sm"
              role="button"
              tabIndex={0}
              style={{ cursor: 'pointer' }}
              onClick={() => setViewerProduct(product)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setViewerProduct(product);
                }
              }}
            >
              {resolveProductImage(product) ? (
                <Card.Img
                  variant="top"
                  src={resolveProductImage(product)}
                  alt={product.name}
                  loading="lazy"
                  style={{ height: '220px', objectFit: 'cover' }}
                />
              ) : (
                <div className="d-flex align-items-center justify-content-center bg-light text-muted" style={{ height: '220px' }}>
                  No image
                </div>
              )}
              <Card.Body className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <Card.Title className="fs-5 mb-0">{product.name}</Card.Title>
                  <h5 className="text-primary mb-0">₹{Number(product.price || 0).toFixed(2)}</h5>
                </div>
                <Card.Text className="text-muted small mb-2" style={{ minHeight: '56px' }}>
                  {product.description || `${product.flavor} crafted in ${product.size} size.`}
                </Card.Text>
                <div className="d-flex flex-wrap gap-1 mb-2">
                  <Badge bg="secondary" className="text-capitalize">{product.category}</Badge>
                  <Badge bg="info">{product.flavor}</Badge>
                  <Badge bg="light" text="dark" className="text-capitalize">{product.size}</Badge>
                  <Badge bg={product.stock > 0 ? 'success' : 'danger'}>{product.stock > 0 ? `Stock ${product.stock}` : 'Out of Stock'}</Badge>
                </div>
                <div className="mt-auto d-flex justify-content-end">
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={product.stock <= 0}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleAddToCart(product);
                    }}
                  >
                    {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <ProductViewerModal
        show={Boolean(viewerProduct)}
        product={viewerProduct}
        onHide={() => setViewerProduct(null)}
        onAddToCart={(product) => handleAddToCart(product)}
      />
    </Container>
  );
};

export default Menu;
