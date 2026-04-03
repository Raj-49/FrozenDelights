import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import api from '../../api/axios';
import { resolveProductImage } from '../../utils/productImage';
import ProductViewerModal from '../../components/ProductViewerModal';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewerProduct, setViewerProduct] = useState(null);
  const { addToCart } = useCart();

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

  const featuredProducts = useMemo(() => products.slice(0, 12), [products]);

  const categorySummary = useMemo(() => {
    const summary = {};
    for (const product of products) {
      summary[product.category] = (summary[product.category] || 0) + 1;
    }
    return Object.entries(summary).sort((a, b) => b[1] - a[1]);
  }, [products]);

  const inStockCount = useMemo(() => products.filter((item) => item.stock > 0).length, [products]);

  const handleAddToCart = (product) => {
    if (product.stock > 0) {
      addToCart(product);
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading menu...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card className="border-0 shadow-sm mb-4 overflow-hidden">
        <Row className="g-0 align-items-center">
          <Col lg={7} className="p-4 p-lg-5">
            <h1 className="fw-bold mb-3">FrozenDelights Premium Menu</h1>
            <p className="text-muted mb-4">
              Explore a complete ice cream collection with cones, cups, family packs and combos curated for every mood.
            </p>
            <div className="d-flex flex-wrap gap-2 mb-4">
              <Badge bg="dark" pill>Total Items: {products.length}</Badge>
              <Badge bg="success" pill>In Stock: {inStockCount}</Badge>
              <Badge bg="info" pill>Categories: {categorySummary.length}</Badge>
            </div>
            <div className="d-flex gap-2">
              <Button as={Link} to="/menu" variant="primary">Browse Full Menu</Button>
            </div>
          </Col>
          <Col lg={5}>
            <img
              src="https://loremflickr.com/1200/900/icecream,parlor?lock=2026"
              alt="FrozenDelights showcase"
              style={{ width: '100%', height: '100%', minHeight: '260px', objectFit: 'cover' }}
            />
          </Col>
        </Row>
      </Card>

      <Row className="g-3 mb-4">
        {categorySummary.slice(0, 4).map(([category, count]) => (
          <Col md={6} lg={3} key={category}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body>
                <div className="text-uppercase small text-muted">Category</div>
                <h5 className="fw-semibold text-capitalize mb-2">{category}</h5>
                <div className="text-primary fw-bold">{count} products</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold mb-0">Featured Picks</h3>
        <Button as={Link} to="/menu" variant="outline-primary" size="sm">See all</Button>
      </div>

      <Row xs={1} sm={2} lg={4} className="g-4">
        {featuredProducts.map((product) => (
          <Col key={product._id}>
            <Card
              className="h-100 shadow-sm border-0"
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
                  style={{ height: '210px', objectFit: 'cover' }}
                />
              ) : (
                <div className="d-flex align-items-center justify-content-center bg-light text-muted" style={{ height: '210px' }}>
                  No image
                </div>
              )}
              <Card.Body className="d-flex flex-column">
                <Card.Title className="fs-6 fw-bold mb-2">{product.name}</Card.Title>
                <Card.Text className="text-muted small mb-2" style={{ minHeight: '42px' }}>
                  {product.description || `${product.flavor} delight in ${product.size} size.`}
                </Card.Text>
                <div className="mb-2 d-flex flex-wrap gap-1">
                  <Badge bg="secondary" className="text-capitalize">{product.category}</Badge>
                  <Badge bg="info">{product.flavor}</Badge>
                  <Badge bg="light" text="dark" className="text-capitalize">{product.size}</Badge>
                </div>
                <div className="mt-auto d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 text-primary">₹{Number(product.price || 0).toFixed(2)}</h5>
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={product.stock <= 0}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleAddToCart(product);
                    }}
                  >
                    {product.stock > 0 ? 'Add' : 'Out'}
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

export default Home;
