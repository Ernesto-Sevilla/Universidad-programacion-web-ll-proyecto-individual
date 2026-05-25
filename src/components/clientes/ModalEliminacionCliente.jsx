import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";

const ModalEliminacionCliente = ({
  mostrarModalEliminacion,
  setMostrarModalEliminacion,
  eliminarCliente,
  cliente,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleEliminar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await eliminarCliente();
    setDeshabilitado(false);
  };

  return (
    <Modal
      show={mostrarModalEliminacion}
      onHide={() => setMostrarModalEliminacion(false)}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title className="text-danger">
          <i className="bi bi-exclamation-octagon-fill me-2"></i>
          Confirmar Baja de Registro
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        ¿Estás plenamente seguro de remover al cliente{" "}
        <strong>
          {cliente?.nombre} {cliente?.apellido}
        </strong>{" "}
        del sistema empresarial? Esta acción no se puede deshacer.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModalEliminacion(false)}>
          Conservar Registro
        </Button>
        <Button
          variant="danger"
          onClick={handleEliminar}
          disabled={deshabilitado}
        >
          {deshabilitado ? "Eliminando..." : "Eliminar Permanentemente"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEliminacionCliente;