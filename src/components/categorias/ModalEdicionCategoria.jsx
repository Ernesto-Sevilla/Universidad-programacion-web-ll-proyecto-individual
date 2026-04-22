import React, {useState} from "react";
import { Modal, Form, Button, ModalTitle, ModalBody } from "react-bootstrap";

const [deshabilitado, setDeshabilitado] = useState(false);

    const handleActualizar = async () => {
      if (deshabilitado) return;
      setDeshabilitado(true);
      await actualizarCategoria();
      setDeshabilitado(false);
    };

const ModalEdicionCategoria = ({
  mostrarModalEdicion,
  SetMostrarModalEdicion,
  categoriaEditar,
  manejoCambioInputEdicion,
  actualizarCategoria,
}) =>{

  return (
    <Modal
      show={mostrarModalEdicion}
      onHide={() => SetMostrarModalEdicion(false)}
      keyboard={false}
      centered
    >
      <ModalTitle>Editar Categoría</ModalTitle>
      <ModalBody>
        <Form>
      </ModalBody>
    </Modal>

  );
};



export default ModalEdicionCategoria;