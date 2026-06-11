import React from "react";
import { Table, Button, Image, ProgressBar } from "react-bootstrap";

const TablaProductos = ({ 
  productos, 
  abrirModalEliminacion, 
  abrirModalEdicion, 
  generarPDFProducto }) => {
  return (
    <Table hover responsive className="align-middle">
      <thead className="table-light">
        <tr>
          <th>Imagen</th>
          <th>Producto</th>
          <th>Categoría</th>
          <th>Precio</th>
          <th>Stock</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        {productos.map((prod) => (
          <tr key={prod.id_producto}>
            <td>
              {/*VISUALIZACIÓN DE LA IMAGEN */}
              <Image
                src={prod.imagen_url}
                alt={prod.nombre}
                rounded
                style={{ width: "50px", height: "50px", objectFit: "cover" }}
                onError={(e) => { e.target.src = "https://via.placeholder.com/50"; }}
              />
            </td>
            <td>
              <div className="fw-bold">{prod.nombre}</div>
              <small className="text-muted">{prod.descripcion_producto}</small>
            </td>
            <td>{prod.categorias?.nombre_categoria}</td>
            <td>${parseFloat(prod.precio_venta).toFixed(2)}</td>
            <td>{prod.stock}</td>

            <td className="text-end">

              <Button
                variant="outline-warning"
                size="sm"
                className="me-2"
                onClick={() => abrirModalEdicion(prod)}
              >
                <i className="bi bi-pencil"></i>
              </Button>

              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => abrirModalEliminacion(prod)}
              >
                <i className="bi bi-trash"></i>
              </Button>

              <Button
                variant="outline-primary"
                size="sm"
                className="ms-2"
                onClick={() => generarPDFProducto(prod)}
              >
                <i className="bi bi-file-pdf"></i>
              </Button>

            </td>

          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TablaProductos;