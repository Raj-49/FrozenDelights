import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fd-footer py-4 mt-5">
      <Container>
        <Row>
          <Col md={6} className="text-center text-md-start mb-3 mb-md-0">
            <h5 className="fw-bold">🍦 FrozenDelights</h5>
            <p className="mb-0 text-muted">
              Your favorite ice cream delivery service
            </p>
            <small className="text-muted d-block mt-1">Premium ordering experience for customers and admins.</small>
          </Col>
          
          <Col md={6} className="text-center text-md-end">
            <p className="mb-0">
              <small className="text-muted">
                © {currentYear} FrozenDelights. All rights reserved.
              </small>
            </p>
            <div className="mt-2">
              <small className="text-muted">
                Made with ❤️ for ice cream lovers
              </small>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
