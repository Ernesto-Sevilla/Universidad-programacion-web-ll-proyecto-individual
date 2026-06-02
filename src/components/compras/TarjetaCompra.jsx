import React from "react";
import { Row, Col, Spinner, Button, Badge } from "react-bootstrap";
import { useSeleccionTarjeta } from "@/utils/tarjetas";
import { TarjetaBase } from "@/utils/tarjetas";

export const TarjetaCompra = ({
  compras,
  abrirModalEdicion,
  generarPDFCompra,
}) => {
  const { idActivo, alternarActivo, cerrar } = useSeleccionTarjeta();

  // Spinner de carga o estado vacío consistente con tu diseño de SmartVentas
  if (!compras || compras.length === 0) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  // Funciones auxiliares locales adaptadas al flujo de abastecimiento
  const obtenerConfiguracionEstado = (estado) => {
    switch (estado) {
      case "Completada":
        return { badgeBg: "success", icon: "bi-check", textClass: "text-success", iconBase: "bi-box-seam-fill" };
      case "Pendiente":
        return { badgeBg: "warning", icon: "bi-clock", textClass: "text-warning", iconBase: "bi-box-seam" };
      case "Cancelada":
        return { badgeBg: "danger", icon: "bi-x", textClass: "text-danger", iconBase: "bi-slash-circle" };
      default:
        // Por defecto, si no maneja estado explícito, asumimos el éxito del reabastecimiento
        return { badgeBg: "success", icon: "bi-check-all", textClass: "text-success", iconBase: "bi-box-seam" };
    }
  };

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat("es-NI", {
      style: "currency",
      currency: "NIO",
    }).format(monto);
  };

  const formatearFecha = (fechaString) => {
    if (!fechaString) return "---";
    return new Date(fechaString).toLocaleDateString("es-NI", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="mb-3">
      {compras.map((compra) => {
        // Almacenamos directamente el nombre del proveedor (VARCHAR)
        const nombreProveedor = compra.proveedor ? compra.proveedor.trim() : "Proveedor General";
        const config = obtenerConfiguracionEstado(compra.estado);

        return (
          <TarjetaBase
            key={compra.id_compra}
            esActivo={idActivo === compra.id_compra}
            alHacerClick={() => alternarActivo(compra.id_compra)}
            ariaLabel={`Compra número ${compra.id_compra} a ${nombreProveedor}`}
            acciones={
              <div className="d-flex gap-2">
                <Button
                  variant="outline-warning"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    abrirModalEdicion(compra);
                    cerrar();
                  }}
                >
                  <i className="bi bi-pencil me-1"></i> Editar
                </Button>

                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    generarPDFCompra(compra);
                    cerrar();
                  }}
                >
                  <i className="bi bi-receipt"></i> Comprobante
                </Button>
              </div>
            }
          >
            <Row className="align-items-center gx-2 py-1">
              {/* Icono Dinámico Lateral de Abastecimiento */}
              <Col xs={2} className="text-center">
                <div className={`rounded-circle p-2 d-inline-block bg-light ${config.textClass}`}>
                  <i className={`bi ${config.iconBase} fs-3`}></i>
                </div>
              </Col>

              {/* Información General de la Compra */}
              <Col xs={10} className="text-start">
                <div className="fw-bold text-dark d-flex align-items-center justify-content-between gap-2">
                  <span className="text-truncate">
                    {nombreProveedor}
                  </span>
                  <div className="d-flex align-items-center gap-1 flex-shrink-0">
                    <span className="fw-bold text-dark me-1 small">
                      {formatearMoneda(compra.total)}
                    </span>
                    <Badge bg={config.badgeBg} className="p-1" pill>
                      <i className={`bi ${config.icon}`}></i>
                    </Badge>
                  </div>
                </div>

                {/* Subdetalles Técnicos */}
                <div className="small text-muted text-truncate mt-1">
                  <i className="bi bi-hash me-1"></i> Lote Compra: #{compra.id_compra}
                </div>
                <div className="small text-secondary text-truncate">
                  <i className="bi bi-calendar-event me-1"></i> Adquisición: {formatearFecha(compra.fecha_compra)}
                </div>

                {compra.observaciones && (
                  <div className="small text-muted text-truncate italic">
                    <i className="bi bi-chat-left-text me-1"></i> {compra.observaciones}
                  </div>
                )}
              </Col>
            </Row>
          </TarjetaBase>
        );
      })}
    </div>
  );
};