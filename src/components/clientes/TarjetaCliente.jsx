import React from "react";
import { Row, Col, Spinner, Button } from "react-bootstrap";
import { useSeleccionTarjeta } from "../../components/herramientas/tarjetas/useSeleccionTarjeta";
import TarjetaBase from "../herramientas/tarjetas/TarjetaBase";

const TarjetaCliente = ({
  clientes,
  abrirModalEdicion,
  abrirModalEliminacion,
  generarPDFCliente,
}) => {
  const { idActivo, alternarActivo, cerrar } = useSeleccionTarjeta();

  if (!clientes || clientes.length === 0) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="mb-3">
      {clientes.map((cliente) => (
        <TarjetaBase
          key={cliente.id_cliente}
          esActivo={idActivo === cliente.id_cliente}
          alHacerClick={() => alternarActivo(cliente.id_cliente)}
          ariaLabel={`Cliente ${cliente.nombre} ${cliente.apellido}`}
          acciones={
            <div className="d-flex gap-2">
              <Button
                variant="outline-warning"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  abrirModalEdicion(cliente);
                  cerrar();
                }}
              >
                <i className="bi bi-pencil me-1"></i> Editar
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  abrirModalEliminacion(cliente);
                  cerrar();
                }}
              >
                <i className="bi bi-trash me-1"></i> Borrar
              </Button>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  generarPDFCliente(cliente);
                  cerrar();
                }}
              >
                <i className="bi bi-file-earmark-pdf"></i> PDF
              </Button>
            </div>
          }
        >
          {/* Contenido Responsivo para Dispositivos Móviles */}
          <Row className="align-items-center gx-2 py-1">
            <Col xs={2} className="text-center">
              <div className="bg-light rounded-circle p-2 d-inline-block text-primary">
                <i className="bi bi-person fs-3"></i>
              </div>
            </Col>
            <Col xs={10} className="text-start">
              <div className="fw-bold text-truncate text-dark">
                {cliente.nombre} {cliente.apellido}
              </div>
              <div className="small text-muted text-truncate">
                <i className="bi bi-envelope me-1"></i> {cliente.email}
              </div>
              {cliente.celular && (
                <div className="small text-secondary text-truncate">
                  <i className="bi bi-telephone me-1"></i> {cliente.celular}
                </div>
              )}
            </Col>
          </Row>
        </TarjetaBase>
      ))}
    </div>
  );
};

export default TarjetaCliente;