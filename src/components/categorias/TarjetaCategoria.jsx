import React from "react";
import { Row, Col, Spinner, Button } from "react-bootstrap";
import { useSeleccionTarjeta } from "../../components/herramientas/tarjetas/useSeleccionTarjeta";
import TarjetaBase from "../herramientas/tarjetas/TarjetaBase";

const TarjetaCategoria = ({
  categorias,
  abrirModalEdicion,
  abrirModalEliminacion,
  generarPDFCategoria,
  copiarCategoria,
  abrirModalQR
}) => {
  const { idActivo, alternarActivo, cerrar } = useSeleccionTarjeta();

  if (!categorias || categorias.length === 0) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="success" />
      </div>
    );
  }

  return (
    <div>
      {categorias.map((cat) => (
        <TarjetaBase
          key={cat.id_categoria}
          esActivo={idActivo === cat.id_categoria}
          alHacerClick={() => alternarActivo(cat.id_categoria)}
          ariaLabel={`Categoría ${cat.nombre_categoria}`}
          acciones={
            <>
              <Button variant="outline-warning" size="sm" onClick={() => { abrirModalEdicion(cat); cerrar(); }}>
                <i className="bi bi-pencil"></i>
              </Button>
              <Button variant="outline-danger" size="sm" onClick={() => { abrirModalEliminacion(cat); cerrar(); }}>
                <i className="bi bi-trash"></i>
              </Button>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => { generarPDFCategoria(cat); cerrar(); }}
                title="Generar PDF"
              >
                <i className="bi bi-file-earmark-pdf"></i>
              </Button>
              <Button
                variant="outline-success"
                size="sm"
                onClick={() => { copiarCategoria(cat); cerrar(); }}
                title="Copiar al portapapeles"
              >
                <i className="bi bi-clipboard"></i>
              </Button>

              <Button
                variant="outline-dark"
                size="sm"
                className="me-2"
                onClick={() => abrirModalQR(cat)}
                title="Ver Código QR"
              >
                <i className="bi bi-qr-code"></i>
              </Button>
            </>
          }
        >
          {/* Contenido específico de Categoría */}
          <Row className="align-items-center gx-3">
            <Col xs={2} className="px-2 text-center">
              <i className="bi bi-bookmark text-muted fs-3"></i>
            </Col>
            <Col xs={10} className="text-start">
              <div className="fw-semibold text-truncate">{cat.nombre_categoria}</div>
              <div className="small text-muted text-truncate">{cat.descripcion_categoria}</div>
            </Col>
          </Row>
        </TarjetaBase>
      ))}
    </div>
  );
};

export default TarjetaCategoria;