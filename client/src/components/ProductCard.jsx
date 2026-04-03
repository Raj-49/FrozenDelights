import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { resolveProductImage, resolveProductImages } from '../utils/productImage';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const productImage = resolveProductImage(product);
  const productImages = resolveProductImages(product);

  const handleAddToCart = () => {
    if (product.stock > 0) {
      addToCart(product);
    }
  };

  return (
    <Card className="h-100 product-card shadow-sm">
      <div className="position-relative overflow-hidden">
        {productImage ? (
          <Card.Img
            variant="top"
            src={productImage}
            alt={product.name}
            loading="lazy"
            style={{ 
              height: '200px', 
              objectFit: 'cover',
              transition: 'transform 0.3s ease'
            }}
            className="product-image"
          />
        ) : (
          <div className="d-flex align-items-center justify-content-center bg-light text-muted" style={{ height: '200px' }}>
            No image
          </div>
        )}
        {product.stock === 0 && (
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-75">
            <Badge bg="danger" className="fs-6">Out of Stock</Badge>
          </div>
        )}
      </div>
      {productImages.length > 1 && (
        <div className="d-flex gap-1 px-2 pt-2">
          {productImages.slice(0, 4).map((imageUrl, index) => (
            <img
              key={`${product._id || product.name}-thumb-${index}`}
              src={imageUrl}
              alt={`${product.name} ${index + 1}`}
              style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
            />
          ))}
        </div>
      )}
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

      <style>{`
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
