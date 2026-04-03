import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Carousel, Col, Modal, Row } from 'react-bootstrap';
import { resolveProductImage, resolveProductImages } from '../utils/productImage';

const ProductViewerModal = ({ show, product, onHide, onAddToCart }) => {
  const images = useMemo(() => resolveProductImages(product), [product]);
  const primaryImage = resolveProductImage(product);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [product?.id, product?._id]);

  if (!product) {
    return null;
  }

  const hasImages = images.length > 0;

  return (
    <Modal show={show} onHide={onHide} size="xl" centered contentClassName="border-0 shadow">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">{product.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-2">
        <Row className="g-4 align-items-start">
          <Col lg={7}>
            <div className="rounded-4 overflow-hidden bg-light border">
              {hasImages ? (
                <Carousel
                  activeIndex={activeIndex}
                  onSelect={(selectedIndex) => setActiveIndex(selectedIndex)}
                  indicators={images.length > 1}
                  interval={null}
                  fade
                >
                  {images.slice(0, 4).map((imageUrl, index) => (
                    <Carousel.Item key={`${product._id || product.name}-slide-${index}`}>
                      <div className="bg-white d-flex align-items-center justify-content-center" style={{ minHeight: '460px' }}>
                        <img
                          src={imageUrl}
                          alt={`${product.name} ${index + 1}`}
                          style={{ width: '100%', maxHeight: '460px', objectFit: 'contain' }}
                        />
                      </div>
                    </Carousel.Item>
                  ))}
                </Carousel>
              ) : (
                <div className="d-flex align-items-center justify-content-center bg-light text-muted" style={{ minHeight: '460px' }}>
                  No image
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="d-flex gap-2 mt-3 flex-wrap">
                {images.slice(0, 4).map((imageUrl, index) => (
                  <button
                    key={`${product._id || product.name}-thumb-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`p-0 border rounded-3 overflow-hidden ${activeIndex === index ? 'border-primary border-2' : 'border-light'}`}
                    style={{ width: '72px', height: '72px', background: 'transparent' }}
                  >
                    <img
                      src={imageUrl}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </Col>

          <Col lg={5}>
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <div className="text-muted small mb-1">Product details</div>
                <h3 className="fw-bold mb-0">₹{Number(product.price || 0).toFixed(2)}</h3>
              </div>
              <Badge bg={product.stock > 0 ? 'success' : 'danger'} className="fs-6">
                {product.stock > 0 ? `Stock ${product.stock}` : 'Out of Stock'}
              </Badge>
            </div>

            <p className="text-muted mb-4" style={{ lineHeight: 1.7 }}>
              {product.description || `${product.flavor} crafted in ${product.size} size.`}
            </p>

            <div className="d-flex flex-wrap gap-2 mb-4">
              <Badge bg="secondary" className="text-capitalize px-3 py-2">{product.category}</Badge>
              <Badge bg="info" className="px-3 py-2">{product.flavor}</Badge>
              <Badge bg="light" text="dark" className="text-capitalize px-3 py-2">{product.size}</Badge>
            </div>

            <div className="rounded-4 border bg-light p-3 mb-4">
              <div className="fw-semibold mb-2">Quick info</div>
              <div className="text-muted small mb-1">Flavor: {product.flavor}</div>
              <div className="text-muted small mb-1">Category: {product.category}</div>
              <div className="text-muted small mb-1">Size: {product.size}</div>
              <div className="text-muted small mb-1">Images: {images.length}</div>
              <div className="text-muted small">Main image loaded: {primaryImage ? 'Yes' : 'No'}</div>
            </div>

            <div className="d-flex gap-2">
              <Button variant="primary" className="flex-grow-1" disabled={product.stock <= 0} onClick={() => onAddToCart?.(product)}>
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              <Button variant="outline-secondary" onClick={onHide}>Close</Button>
            </div>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default ProductViewerModal;