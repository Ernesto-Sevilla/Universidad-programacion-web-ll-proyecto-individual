import React from "react";
import { Table, Button } from "react-bootstrap";

const TablaClientes = ({
  clientes,
  abrirModalEdicion,
  abrirModalEliminacion,
  generarPDFCliente,
}) => {
  return (
    <Table striped bordered hover responsive size="sm" className="shadow-sm">
      <thead className="table-dark">
        <tr>
          <th>ID</th>
          <th>Nombre Completo</th>
          <th>Correo Electrónico</th>
          <th className="d-none d-md-table-cell">Celular</th>
          <th className="d-none d-xl-table-cell">Fecha Registro</th>
          <th className="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {clientes.map((cliente) => (
          <tr key={cliente.id_cliente} className="align-middle">
            <td>{cliente.id_cliente}</td>
            <td className="fw-semibold">
              {cliente.nombre} {cliente.apellido}
            </td>
            <td>
              <a href={`mailto:${cliente.email}`} className="text-decoration-none">
                {cliente.email}
              </a>
            </td>
            <td className="d-none d-md-table-cell">
              {cliente.celular ? (
                <a href={`tel:${cliente.celular}`} className="text-muted text-decoration-none">
                  <i className="bi bi-telephone me-1"></i> {cliente.celular}
                </a>
              ) : (
                <span className="text-muted italic">No provisto</span>
              )}
            </td>
            <td className="d-none d-xl-table-cell small text-muted">
              {new Date(cliente.fecha_registro).toLocaleDateString()}
            </td>
            <td className="text-center">
              <Button
                variant="outline-warning"
                size="sm"
                className="me-2"
                onClick={() => abrirModalEdicion(cliente)}
                title="Editar Cliente"
              >
                <i className="bi bi-pencil"></i>
              </Button>

              <Button
                variant="outline-danger"
                size="sm"
                className="me-2"
                onClick={() => abrirModalEliminacion(cliente)}
                title="Eliminar Cliente"
              >
                <i className="bi bi-trash"></i>
              </Button>

              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => generarPDFCliente(cliente)}
                title="Exportar Ficha PDF"
              >
                <i className="bi bi-file-earmark-pdf"></i>
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TablaClientes;