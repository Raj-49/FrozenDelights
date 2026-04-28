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
    <Card className="h-100 product-card border-0 shadow-sm overflow-hidden">
      <div className="position-relative overflow-hidden product-card-media">
        {productImage ? (
          <Card.Img
            variant="top"
            src={productImage}
            alt={product.name}
            loading="lazy"
            className="product-image"
          />
        ) : (
          <div className="d-flex align-items-center justify-content-center bg-body-tertiary text-muted product-card-empty">
            No image
          </div>
        )}
        {product.stock === 0 && (
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center product-card-overlay">
            <Badge bg="danger" className="fs-6">Out of Stock</Badge>
          </div>
        )}
      </div>
      {productImages.length > 1 && (
        <div className="d-flex gap-1 px-3 pt-3 flex-wrap">
          {productImages.slice(0, 4).map((imageUrl, index) => (
            <img
              key={`${product._id || product.name}-thumb-${index}`}
              src={imageUrl}
              alt={`${product.name} ${index + 1}`}
              className="product-thumb"
            />
          ))}
        </div>
      )}
      <Card.Body className="d-flex flex-column p-3 p-lg-4">
        <Card.Title className="fs-6 fw-bold mb-2 product-title">{product.name}</Card.Title>
        
        <div className="mb-2 d-flex flex-wrap gap-1">
          <Badge bg="info">{product.flavor}</Badge>
          <Badge bg="secondary" className="text-capitalize">{product.size}</Badge>
        </div>

        <div className="mb-3">
          <Badge bg="warning" text="dark" className="text-capitalize product-category-badge">
            {product.category}
          </Badge>
        </div>

        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-end mb-3">
            <div>
              <small className="text-muted d-block">Starting from</small>
              <h4 className="text-primary mb-0 fw-bold">₹{Number(product.price || 0).toFixed(2)}</h4>
            </div>
            <small className="text-muted text-end">{product.stock > 0 ? `In stock: ${product.stock}` : 'Out of stock'}</small>
          </div>
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
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          background: var(--bs-tertiary-bg);
        }
        
        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 34px rgba(0,0,0,0.12) !important;
        }

        .product-card-media {
          background: var(--bs-secondary-bg);
        }

        .product-card-empty,
        .product-image {
          height: 200px;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        .product-image:hover {
          transform: scale(1.05);
        }

        .product-card-overlay {
          background: rgba(0, 0, 0, 0.68);
          backdrop-filter: blur(2px);
        }

        .product-thumb {
          width: 44px;
          height: 44px;
          object-fit: cover;
          border-radius: 0.75rem;
          border: 1px solid var(--bs-border-color);
        }

        .product-title {
          min-height: 2.4rem;
        }

        .product-category-badge {
          letter-spacing: 0.03em;
        }
      `}</style>
    </Card>
  );
};

export default ProductCard;
