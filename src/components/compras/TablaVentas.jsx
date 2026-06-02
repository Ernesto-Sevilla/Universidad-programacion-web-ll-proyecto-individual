import React from "react";
import { Table, Button, Badge } from "react-bootstrap";

export const TablaCompras = ({
  compras,
  abrirModalEdicion,
  generarPDFCompra,
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

  // Función auxiliar para formatear montos en Córdobas (NIO)
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
          <th>Proveedor</th>
          <th>Comprador (Empleado)</th>
          <th>Monto Total</th>
          <th className="text-center">Estado</th>
          <th className="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {compras.map((compra) => {
          // Extraemos de forma segura la relación del empleado que registró el abastecimiento
          const emp = compra.empleados;
          const nombreEmpleado = emp
            ? `${emp.nombre_empleado || ""} ${emp.apellido_empleado || ""}`.trim()
            : "No asignado";

          const nombreProveedor = compra.proveedor ? compra.proveedor.trim() : "Proveedor General";

          // En compras el flujo asienta inventario de inmediato, tratándose como consolidada
          const esCompletada = compra.estado === "Cancelada" ? false : true;

          return (
            <tr key={compra.id_compra} className="align-middle">
              <td>{compra.id_compra}</td>
              <td className="text-nowrap">{formatearFecha(compra.fecha_compra)}</td>
              <td className="fw-semibold text-primary">
                <i className="bi bi-building me-1 small"></i> {nombreProveedor}
              </td>
              <td className="text-muted">{nombreEmpleado}</td>
              <td className="fw-bold text-end pe-3">
                {formatearMoneda(compra.total)}
              </td>
              <td className="text-center">
                <Badge
                  bg={esCompletada ? "success" : "danger"}
                  className="px-2.5 py-1.5 fs-7 fw-bold shadow-sm"
                >
                  <i className={`bi ${esCompletada ? "bi-box-seam-fill" : "bi-x-circle-fill"} me-1`}></i>
                  {compra.estado || "Completada"}
                </Badge>
              </td>
              <td className="text-center text-nowrap">
                {/* Botón de visualización/edición según estado de auditoría */}
                {compra.estado === "Completada" || !compra.estado ? (
                  <Button
                    variant="outline-success"
                    size="sm"
                    className="me-2"
                    onClick={() => abrirModalEdicion(compra)}
                    title="Ver detalles del lote (Solo Lectura)"
                  >
                    <i className="bi bi-eye-fill"></i>
                  </Button>
                ) : (
                  <Button
                    variant="outline-warning"
                    size="sm"
                    className="me-2"
                    onClick={() => abrirModalEdicion(compra)}
                    title="Editar Registro de Compra"
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                )}

                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => generarPDFCompra(compra)}
                  title="Exportar Comprobante PDF"
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