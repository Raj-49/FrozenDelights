import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

const Menu = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={12}>
          <div className="text-center mb-5">
            <h1 className="fw-bold">🍦 Our Menu</h1>
            <p className="text-muted">Choose from our delicious ice cream selection</p>
          </div>
          
          <Row>
            <Col md={4} className="mb-4">
              <Card className="h-100">
                <Card.Img variant="top" src="https://picsum.photos/seed/icecream1/400/300" />
                <Card.Body>
                  <Card.Title>Vanilla Dream</Card.Title>
                  <Card.Text>Classic vanilla ice cream made with real vanilla beans</Card.Text>
                  <Card.Footer>
                    <strong>₹60</strong>
                    <Button variant="primary" className="float-end">Add to Cart</Button>
                  </Card.Footer>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-4">
              <Card className="h-100">
                <Card.Img variant="top" src="https://picsum.photos/seed/icecream2/400/300" />
                <Card.Body>
                  <Card.Title>Chocolate Blast</Card.Title>
                  <Card.Text>Rich chocolate ice cream with chocolate chips</Card.Text>
                  <Card.Footer>
                    <strong>₹70</strong>
                    <Button variant="primary" className="float-end">Add to Cart</Button>
                  </Card.Footer>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-4">
              <Card className="h-100">
                <Card.Img variant="top" src="https://picsum.photos/seed/icecream3/400/300" />
                <Card.Body>
                  <Card.Title>Strawberry Delight</Card.Title>
                  <Card.Text>Fresh strawberry ice cream with real fruit pieces</Card.Text>
                  <Card.Footer>
                    <strong>₹65</strong>
                    <Button variant="primary" className="float-end">Add to Cart</Button>
                  </Card.Footer>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Menu;
