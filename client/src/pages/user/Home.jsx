import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import { useCart } from '../../context/CartContext';
import api from '../../api/axios';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const { addToCart } = useCart();

  const categories = ['All', 'cone', 'cup', 'family pack', 'combo'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        if (response.data.success) {
          setProducts(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(product => product.category === activeCategory);

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
          <p className="mt-3">Loading delicious ice creams...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="fw-bold">🍦 FrozenDelights</h1>
        <p className="text-muted">Discover our amazing ice cream collection</p>
      </div>

      {/* Category Filter */}
      <div className="d-flex justify-content-center mb-4 flex-wrap">
        {categories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? 'primary' : 'outline-primary'}
            className="m-1"
            onClick={() => setActiveCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-5">
          <h4>No products found in this category</h4>
        </div>
      ) : (
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {filteredProducts.map((product) => (
            <Col key={product._id}>
              <Card className="h-100 product-card">
                <div className="position-relative">
                  <Card.Img
                    variant="top"
                    src={product.image || `https://picsum.photos/seed/${product.name}/400/300`}
                    alt={product.name}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  {product.stock === 0 && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-75">
                      <Badge bg="danger" className="fs-6">Out of Stock</Badge>
                    </div>
                  )}
                </div>
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="fs-6">{product.name}</Card.Title>
                  <div className="mb-2">
                    <Badge bg="info" className="me-1">{product.flavor}</Badge>
                    <Badge bg="secondary">{product.size}</Badge>
                  </div>
                  <div className="mb-2">
                    <Badge bg="warning" text="dark">{product.category}</Badge>
                  </div>
                  <div className="mt-auto">
                    <h4 className="text-primary mb-3">₹{product.price}</h4>
                    <Button
                      variant="primary"
                      className="w-100"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Home;
