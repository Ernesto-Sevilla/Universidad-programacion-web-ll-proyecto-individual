import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalEdicionCliente = ({
  mostrarModalEdicion,
  setMostrarModalEdicion,
  clienteEditar,
  manejoCambioInputEdicion,
  actualizarCliente,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleActualizar = async (e) => {
    e.preventDefault();
    if (deshabilitado) return;
    setDeshabilitado(true);
    await actualizarCliente();
    setDeshabilitado(false);
  };

  const formularioInvalido = 
    !clienteEditar.nombre || clienteEditar.nombre.trim() === "" || 
    !clienteEditar.apellido || clienteEditar.apellido.trim() === "" || 
    !clienteEditar.email || clienteEditar.email.trim() === "";

  return (
    <Modal
      show={mostrarModalEdicion}
      onHide={() => setMostrarModalEdicion(false)}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-pencil-square me-2 text-warning"></i>
          Modificar Cliente
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleActualizar}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nombre <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={clienteEditar.nombre || ""}
              onChange={manejoCambioInputEdicion}
              placeholder="Nombres del cliente"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Apellido <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="apellido"
              value={clienteEditar.apellido || ""}
              onChange={manejoCambioInputEdicion}
              placeholder="Apellidos del cliente"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Correo Electrónico <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={clienteEditar.email || ""}
              onChange={manejoCambioInputEdicion}
              placeholder="ejemplo@correo.com"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Celular / Teléfono</Form.Label>
            <Form.Control
              type="tel"
              name="celular"
              value={clienteEditar.celular || ""}
              onChange={manejoCambioInputEdicion}
              placeholder="Número de teléfono"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarModalEdicion(false)}>
            Cancelar Edición
          </Button>
          <Button
            type="submit"
            variant="warning"
            disabled={formularioInvalido || deshabilitado}
          >
            {deshabilitado ? "Actualizando..." : "Actualizar Datos"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ModalEdicionCliente;