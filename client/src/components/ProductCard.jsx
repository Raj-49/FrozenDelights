import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (product.stock > 0) {
      addToCart(product);
    }
  };

  return (
    <Card className="h-100 product-card shadow-sm">
      <div className="position-relative overflow-hidden">
        <Card.Img
          variant="top"
          src={product.image || `https://picsum.photos/seed/${product.name}/400/300`}
          alt={product.name}
          style={{ 
            height: '200px', 
            objectFit: 'cover',
            transition: 'transform 0.3s ease'
          }}
          className="product-image"
        />
        {product.stock === 0 && (
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-75">
            <Badge bg="danger" className="fs-6">Out of Stock</Badge>
          </div>
        )}
      </div>
      <Card.Body className="d-flex flex-column">
        <Card.Title className="fs-6 fw-bold mb-2">{product.name}</Card.Title>
        
        <div className="mb-2">
          <Badge bg="info" className="me-1">{product.flavor}</Badge>
          <Badge bg="secondary" className="text-capitalize">{product.size}</Badge>
        </div>

        <div className="mb-3">
          <Badge bg="warning" text="dark" className="text-capitalize">
            {product.category}
          </Badge>
        </div>

        <div className="mt-auto">
          <h4 className="text-primary mb-3 fw-bold">₹{product.price}</h4>
          <Button
            variant="primary"
            className="w-100"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </Card.Body>

      <style jsx>{`
        .product-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .product-card:hover {
          transform: scale(1.03);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
        }
        
        .product-image:hover {
          transform: scale(1.05);
        }
      `}</style>
    </Card>
  );
};

export default ProductCard;
