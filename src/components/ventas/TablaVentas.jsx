import React from "react";
import { Table, Button, Badge } from "react-bootstrap";

export const TablaVentas = ({
  ventas,
  abrirModalEdicion,
  generarPDFVenta,
}) => {

  // Función auxiliar para formatear la fecha de Supabase (ISO string)
  const formatearFecha = (fechaString) => {
    if (!fechaString) return "---";
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString("es-NI", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Función auxiliar para formatear montos en Córdobas
  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat("es-NI", {
      style: "currency",
      currency: "NIO",
    }).format(monto);
  };

  return (
    <Table striped bordered hover responsive size="sm" className="shadow-sm">
      <thead className="table-dark">
        <tr>
          <th>ID</th>
          <th>Fecha / Hora</th>
          <th>Cliente</th>
          <th>Monto Total</th>
          <th className="text-center">Estado</th>
          <th className="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {ventas.map((venta) => {
          // Extraemos de forma segura el objeto de relación 'clientes' inyectado por Supabase
          const c = venta.clientes;
          const nombreCliente = c
            ? c.nombre
              ? `${c.nombre} ${c.apellido || ""}`.trim()
              : `${c.nombre || ""} ${c.apellido || ""}`.trim()
            : "Cliente no especificado";

          // Determinar si la venta está cerrada
          const esCerrada = venta.estado === "Cerrada";

          return (
            <tr key={venta.id_venta} className="align-middle">
              <td>{venta.id_venta}</td>
              <td className="text-nowrap">{formatearFecha(venta.fecha_venta)}</td>
              <td className="fw-semibold">
                {nombreCliente} {c && <small className="text-muted d-block">{c.celular}</small>}
              </td>
              <td className="fw-bold text-end pe-3">
                {formatearMoneda(venta.total)}
              </td>
              <td className="text-center">
                {/* Detalle 1: Badge condicional verde (success) para Abierta y rojo (danger) para Cerrada */}
                <Badge
                  bg={esCerrada ? "danger" : "success"}
                  className="px-2.5 py-1.5 fs-7 fw-bold shadow-sm"
                >
                  <i className={`bi ${esCerrada ? "bi-lock-fill" : "bi-unlock-fill"} me-1`}></i>
                  {venta.estado || "Abierta"}
                </Badge>
              </td>
              <td className="text-center text-nowrap">
                {/* Detalle 2: Intercambio dinámico del botón según el estado */}
                {esCerrada ? (
                  // Botón verde con ojo para registros Cerrados (Solo lectura)
                  <Button
                    variant="outline-success"
                    size="sm"
                    className="me-2"
                    onClick={() => abrirModalEdicion(venta)}
                    title="Ver detalles de la venta (Solo Lectura)"
                  >
                    <i className="bi bi-eye-fill"></i>
                  </Button>
                ) : (
                  // Botón clásico amarillo para registros Abiertos
                  <Button
                    variant="outline-warning"
                    size="sm"
                    className="me-2"
                    onClick={() => abrirModalEdicion(venta)}
                    title="Editar Venta / Cerrar Registro"
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                )}

                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => generarPDFVenta(venta)}
                  title="Exportar Recibo PDF"
                >
                  <i className="bi bi-file-earmark-pdf"></i>
                </Button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};