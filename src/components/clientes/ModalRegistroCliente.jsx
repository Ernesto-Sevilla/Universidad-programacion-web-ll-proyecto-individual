import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalRegistroCliente = ({
  mostrarModal,
  setMostrarModal,
  nuevoCliente,
  manejoCambioInput,
  agregarCliente,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleRegistrar = async (e) => {
    e.preventDefault();
    if (deshabilitado) return;
    setDeshabilitado(true);
    await agregarCliente();
    setDeshabilitado(false);
  };

  // Validación básica para activar el botón guardar
  const formularioInvalido = 
    nuevoCliente.nombre.trim() === "" || 
    nuevoCliente.apellido.trim() === "" || 
    nuevoCliente.email.trim() === "";

  return (
    <Modal
      show={mostrarModal}
      onHide={() => setMostrarModal(false)}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-person-plus-fill me-2 text-primary"></i>
          Registrar Nuevo Cliente
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleRegistrar}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nombre <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={nuevoCliente.nombre}
              onChange={manejoCambioInput}
              placeholder="Ingresa los nombres"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Apellido <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="apellido"
              value={nuevoCliente.apellido}
              onChange={manejoCambioInput}
              placeholder="Ingresa los apellidos"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Correo Electrónico <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={nuevoCliente.email}
              onChange={manejoCambioInput}
              placeholder="ejemplo@correo.com"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Celular / Teléfono</Form.Label>
            <Form.Control
              type="tel"
              name="celular"
              value={nuevoCliente.celular}
              onChange={manejoCambioInput}
              placeholder="Ej: +505 8888-1111"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarModal(false)}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={formularioInvalido || deshabilitado}
          >
            {deshabilitado ? "Guardando..." : "Guardar Cliente"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ModalRegistroCliente;