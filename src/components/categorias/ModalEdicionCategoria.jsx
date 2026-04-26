import React, { useState } from "react";
import { Modal, Form, Button, ModalTitle, ModalBody, FormGroup, FormLabel, FormControl, ModalFooter } from "react-bootstrap";

const ModalEdicionCategoria = ({
  mostrarModalEdicion,
  SetMostrarModalEdicion,
  categoriaEditar,
  manejoCambioInputEdicion,
  actualizarCategoria,
}) => {

  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleActualizar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await actualizarCategoria();
    setDeshabilitado(false);
  };

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

          <FormGroup className="mb-3">
            <FormLabel>Nombre</FormLabel>
            <FormControl
              type="text"
              name="nombre_categoria"
              value={categoriaEditar.nombre_categoria}
              onChange={manejoCambioInputEdicion}
              placeholder="Ingresa el nombre de la categoría"
            />
          </FormGroup>

          <FormGroup className="mb-3">
            <FormLabel>Descripción</FormLabel>
            <FormControl
              as="textarea"
              name="descripcion_categoria"
              value={categoriaEditar.descripcion_categoria}
              onChange={manejoCambioInputEdicion}
              placeholder="Ingresa una descripción para la categoría"
            />
          </FormGroup>

        </Form>
      </ModalBody>

      <ModalFooter>
        <Button variant="secondary" onClick={() => SetMostrarModalEdicion(false)}>
          Cancelar edición
        </Button>
        <Button
          variant="primary"
          onClick={handleActualizar}
          disabled={categoriaEditar.nombre_categoria.trim() === "" || deshabilitado}
        >
          Actualizar
        </Button>
      </ModalFooter>
    </Modal>

  );
};



export default ModalEdicionCategoria;