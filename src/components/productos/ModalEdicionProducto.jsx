import React, {useState} from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";

const ModalEdicionProducto = ({
  mostrarModalEdicion,
  setMostrarModalEdicion,
  productoEditar,
  manejoCambioInputEdicion,
  manejoCambioArchivoActualizar,
  actualizarProducto,
  categorias
}) => {

  const [deshabilitado, setDeshabilitado] = useState(false);

  const handActualizar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await actualizarProducto();
    setDeshabilitado(false);
  }

  

  return (

    <Modal
      show={mostrarModalEdicion}
      onHide={() => setMostrarModalEdicion(false)}
      backdrop="static"
      centered
      size="lg"
    >

      <Modal.Header closeButton>
        <Modal.Title>Editar Producto</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Row>

            <Col xs={12} md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Categoria</Form.Label>
                <Form.Select
                name="categoria_producto"
                value={productoEditar.categoria_producto || ""}
                onChange={manejoCambioInputEdicion}
                required>
                  
                  <option value="">Seleccione...</option>
                  {categorias.map((cat) => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>
                      {cat.nombre_categoria}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre *</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={productoEditar.nombre || ""}
                  onChange={manejoCambioInputEdicion}
                  required
                  /> 
              </Form.Group>
            </Col>

            <Col xs={12} md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Precio de venta *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  name="precio_venta"
                  value={productoEditar.precio_venta || ""}
                  onChange={manejoCambioInputEdicion}
                  required
                  /> 
              </Form.Group>
            </Col>

            <Col xs={12} md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Stock</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  name="stock"
                  value={productoEditar.stock || ""}
                  onChange={manejoCambioInputEdicion}
                  required
                  /> 
              </Form.Group>
            </Col>

            <Col xs={12} md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Imagen actual</Form.Label>
                {productoEditar.imagen_url ? (
                  <div className="mb-2">
                    <img
                      src={productoEditar.imagen_url}
                      alt="Producto actual"
                      style={{ maxWidth: "120px", maxHeight: "120px", objectFit: "cover", borderRadius: "6px" }}
                      />
                  </div>
                ) : (
                  <p className="text-muted">Sin imagen</p>
                )} 
              </Form.Group>
            </Col>

            <Col xs={12} md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Nueva imagen (Opcional)</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={manejoCambioArchivoActualizar}
                  /> 
                <Form.Text className="text-muted">
                  Si seleccionas una nueva imagen, reemplazará la actual
                </Form.Text>
              </Form.Group>
            </Col>


            <Col xs={12} md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="descripcion_producto"
                  value={productoEditar.descripcion_producto || ""}
                  onChange={manejoCambioInputEdicion}
                  placeholder="Descripción del producto (Opcional)"
                  /> 
              </Form.Group>
            </Col>

          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModalEdicion(false)}>
          Cancelar
        </Button>

        <Button variant="success" onClick={handActualizar} disabled={deshabilitado}>
          {deshabilitado ? "Actualizando..." : "Actualizar Producto"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionProducto;