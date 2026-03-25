import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";

const RutaProtegida = () => {

  return (
    <Container className="mt-3">
      <Row className="align-items-center">
        <Col>
          <h2><i className="bi-house-fill me-2"></i> Ruta Protegida </h2>
        </Col>
      </Row>
    </Container>
  );
};

export default RutaProtegida;