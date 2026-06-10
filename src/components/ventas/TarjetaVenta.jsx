import React from "react";
import { Row, Col, Spinner, Button, Badge } from "react-bootstrap";
import { useSeleccionTarjeta } from "@/utils/tarjetas";
import { TarjetaBase } from "@/utils/tarjetas";

export const TarjetaVenta = ({
    ventas,
    abrirModalEdicion,
    generarPDFVenta,
}) => {
    const { idActivo, alternarActivo, cerrar } = useSeleccionTarjeta();

    // Spinner de carga o estado vacío consistente con tu diseño
    if (!ventas || ventas.length === 0) {
        return (
            <div className="text-center my-5">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    // Funciones auxiliares locales para estilos dinámicos de la tarjeta
    const obtenerConfiguracionEstado = (estado) => {
        switch (estado) {
            case "Completada":
                return { badgeBg: "success", icon: "bi-check", textClass: "text-success", iconBase: "bi-cart-check" };
            case "Pendiente":
                return { badgeBg: "warning", icon: "bi-clock", textClass: "text-warning", iconBase: "bi-cart" };
            case "Anulada":
                return { badgeBg: "danger", icon: "bi-x", textClass: "text-danger", iconBase: "bi-cart-x" };
            default:
                return { badgeBg: "secondary", icon: "bi-info", textClass: "text-secondary", iconBase: "bi-cart" };
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
            {ventas.map((venta) => {
                const c = venta.clientes;
                const nombreCliente = c
                    ? c.nombre_cliente
                        ? `${c.nombre_cliente} ${c.apellido_cliente || ""}`.trim()
                        : `${c.nombre1 || ""} ${c.apellido1 || ""}`.trim()
                    : "Cliente no especificado";

                const config = obtenerConfiguracionEstado(venta.estado);

                return (
                    <TarjetaBase
                        key={venta.id_venta}
                        esActivo={idActivo === venta.id_venta}
                        alHacerClick={() => alternarActivo(venta.id_venta)}
                        ariaLabel={`Venta número ${venta.id_venta} por ${nombreCliente}`}
                        acciones={
                            <div className="d-flex gap-2">
                                <Button
                                    variant="outline-warning"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        abrirModalEdicion(venta);
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
                                        generarPDFVenta(venta);
                                        cerrar();
                                    }}
                                >
                                    <i className="bi bi-file-earmark-pdf"></i> Recibo
                                </Button>
                            </div>
                        }
                    >
                        <Row className="align-items-center gx-2 py-1">
                            {/* Icono Dinámico Lateral */}
                            <Col xs={2} className="text-center">
                                <div className={`rounded-circle p-2 d-inline-block bg-light ${config.textClass}`}>
                                    <i className={`bi ${config.iconBase} fs-3`}></i>
                                </div>
                            </Col>

                            {/* Información de la Venta */}
                            <Col xs={10} className="text-start">
                                <div className="fw-bold text-dark d-flex align-items-center justify-content-between gap-2">
                                    <span className="text-truncate">
                                        {nombreCliente}
                                    </span>
                                    <div className="d-flex align-items-center gap-1 flex-shrink-0">
                                        <span className="fw-bold text-dark me-1 small">
                                            {formatearMoneda(venta.total)}
                                        </span>
                                        <Badge bg={config.badgeBg} className="p-1" pill>
                                            <i className={`bi ${config.icon}`}></i>
                                        </Badge>
                                    </div>
                                </div>

                                {/* Subdetalles */}
                                <div className="small text-muted text-truncate mt-1">
                                    <i className="bi bi-hash me-1"></i> Transacción: #{venta.id_venta}
                                </div>
                                <div className="small text-secondary text-truncate">
                                    <i className="bi bi-calendar-event me-1"></i> Fecha: {formatearFecha(venta.fecha_venta)}
                                </div>
                                {venta.observaciones && (
                                    <div className="small text-muted text-truncate italic">
                                        <i className="bi bi-chat-left-text me-1"></i> {venta.observaciones}
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