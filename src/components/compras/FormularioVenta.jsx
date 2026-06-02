import React, { useState } from "react";
import { Modal, Form, Button, Row, Col, Table, Card, Badge } from "react-bootstrap";

export const FormularioCompra = ({
  mostrar,
  setMostrar,
  empleados,
  productos,
  proveedor,
  setProveedor,
  empleadoSeleccionado,
  setEmpleadoSeleccionado,
  metodoPago,
  setMetodoPago,
  detalles,
  totalGeneral,
  agregarDetalle,
  eliminarDetalle,
  actualizarCantidad,
  guardarCompra,
  compraAEditar,
  concluirCompra,
}) => {
  // Estados locales para el selector temporal de productos
  const [productoIdTemp, setProductoIdTemp] = useState("");
  const [cantidadTemp, setCantidadTemp] = useState(1);
  const [deshabilitado, setDeshabilitado] = useState(false);
  const [cerrandoRecord, setCerrandoRecord] = useState(false); // Spinner local para consolidar stock

  // Determinar si la compra ya fue consolidada en el inventario
  const esSoloLectura = compraAEditar?.estado === "Completada";

  // Formateador de moneda regional (Córdobas - NIO)
  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat("es-NI", {
      style: "currency",
      currency: "NIO",
    }).format(monto);
  };

  const handleAgregarProducto = (e) => {
    e.preventDefault();
    if (!productoIdTemp || esSoloLectura) return;

    const prod = productos.find((p) => p.producto_id === Number(productoIdTemp));
    if (prod) {
      // Pasamos el producto y usamos su precio_compra (costo) para el detalle de la orden
      agregarDetalle(prod, Number(cantidadTemp));
      setProductoIdTemp("");
      setCantidadTemp(1);
    }
  };

  const handleEnviarFormulario = async (e) => {
    e.preventDefault();
    if (deshabilitado || esSoloLectura) return;

    setDeshabilitado(true);
    const exito = await guardarCompra();
    setDeshabilitado(false);

    if (exito) setMostrar(false);
  };

  // Manejador para congelar la compra y sumar las unidades al stock real
  const handleConsolidarInventarioDefinitivo = async () => {
    if (!compraAEditar?.id_compra || cerrandoRecord) return;

    const seguro = window.confirm(
      `¿Está seguro que desea COMPLETAR la compra #${compraAEditar.id_compra}? Una vez completada, se sumará el stock al inventario y el registro quedará protegido contra modificaciones.`
    );

    if (!seguro) return;

    setCerrandoRecord(true);
    const exito = await concluirCompra(compraAEditar.id_compra, detalles);
    setCerrandoRecord(false);

    if (exito) {
      setMostrar(false);
    }
  };

  return (
    <Modal
      show={mostrar}
      onHide={() => setMostrar(false)}
      backdrop="static"
      keyboard={false}
      fullscreen="lg-down"
      size="xl"
    >
      <Modal.Header closeButton>
        <Modal.Title className="w-100 d-flex justify-content-between align-items-center">
          <div>
            <i className={`bi ${compraAEditar ? "bi-pencil-square text-warning" : "bi-box-seam text-success"} me-2`}></i>
            {compraAEditar ? `Modificar Orden de Compra # ${compraAEditar.id_compra}` : "Registrar Nueva Compra de Suministros"}
          </div>
          {compraAEditar && (
            <Badge bg={esSoloLectura ? "success" : "warning"} className="me-3 fs-6 px-3 py-2">
              <i className={`bi ${esSoloLectura ? "bi-lock-fill" : "bi-unlock-fill"} me-1`}></i>
              {compraAEditar.estado || "Borrador"}
            </Badge>
          )}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleEnviarFormulario}>
        <Modal.Body>
          {/* Alerta informativa si la compra ya asentó stock */}
          {esSoloLectura && (
            <div className="alert alert-success d-flex align-items-center mb-3 shadow-sm" role="alert">
              <i className="bi bi-check-circle-fill fs-4 me-2"></i>
              <div>
                <strong>Registro Consolidado:</strong> Esta compra ha sido marcada como <strong>Completada</strong>. El stock ya fue cargado al inventario y el documento es de solo lectura.
              </div>
            </div>
          )}

          {/* SECCIÓN 1: DATOS MAESTROS (CABECERA) */}
          <Card className="mb-3 bg-light border-0 shadow-sm">
            <Card.Body>
              <h6 className="text-uppercase text-secondary fw-bold mb-3 small"> Datos del Abastecimiento </h6>
              <Row>
                {/* Campo Proveedor */}
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Proveedor <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nombre de la empresa o proveedor"
                      value={proveedor}
                      onChange={(e) => setProveedor(e.target.value)}
                      required
                      disabled={esSoloLectura}
                    />
                  </Form.Group>
                </Col>

                {/* Selector de Empleado Comprador */}
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Comprador Autorizado <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      value={empleadoSeleccionado?.id_empleado || ""}
                      onChange={(e) => {
                        const emp = empleados.find((em) => em.id_empleado === Number(e.target.value));
                        setEmpleadoSeleccionado(emp || null);
                      }}
                      required
                      disabled={esSoloLectura}
                    >
                      <option value="">-- Seleccionar Empleado --</option>
                      {empleados.map((e) => (
                        <option key={e.id_empleado} value={e.id_empleado}>
                          {`${e.nombre_empleado} ${e.apellido_empleado}`}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                {/* Método de Pago */}
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Método de Pago <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      value={metodoPago}
                      onChange={(e) => setMetodoPago(e.target.value)}
                      required
                      disabled={esSoloLectura}
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="transferencia">Transferencia Bancaria</option>
                      <option value="tarjeta">Tarjeta Corporativa</option>
                      <option value="credito">Crédito Proveedor</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* SECCIÓN 2: AGREGAR PRODUCTOS AL DETALLE */}
          {!esSoloLectura && (
            <Card className="mb-3 border-secondary-subtle shadow-sm">
              <Card.Body>
                <h6 className="text-uppercase text-secondary fw-bold mb-3 small">Cargar Lote de Artículos</h6>
                <Row className="align-items-end">
                  <Col md={7}>
                    <Form.Group className="mb-2 mb-md-0">
                      <Form.Label>Seleccionar Artículo</Form.Label>
                      <Form.Select
                        value={productoIdTemp}
                        onChange={(e) => setProductoIdTemp(e.target.value)}
                      >
                        <option value="">-- Seleccione un artículo --</option>
                        {productos.map((p) => (
                          <option key={p.producto_id} value={p.producto_id}>
                            {p.nombre} - Costo: {formatearMoneda(p.precio_compra)} (Stock actual: {p.stock})
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3} xs={8}>
                    <Form.Group className="mb-2 mb-md-0">
                      <Form.Label>Cantidad Entrante</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        value={cantidadTemp}
                        onChange={(e) => setCantidadTemp(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2} xs={4} className="text-end">
                    <Button
                      variant="success"
                      className="w-100"
                      onClick={handleAgregarProducto}
                      disabled={!productoIdTemp}
                    >
                      <i className="bi bi-plus-circle me-1"></i> Añadir
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* SECCIÓN 3: TABLA DE ITEMS SELECCIONADOS */}
          <h5 className="mb-2 mt-4 text-dark d-flex justify-content-between align-items-center">
            <span className="fs-6 text-uppercase text-secondary fw-bold">Artículos en la Orden</span>
            <span className="fw-bold text-success fs-4">Total Costo: {formatearMoneda(totalGeneral)}</span>
          </h5>

          <div className="table-responsive border rounded bg-white shadow-sm" style={{ maxHeight: "250px" }}>
            <Table striped hover size="sm" className="mb-0 align-middle">
              <thead className="table-dark sticky-top">
                <tr>
                  <th>ID</th>
                  <th>Descripción del Producto</th>
                  <th className="text-end" style={{ width: "120px" }}>Costo U.</th>
                  <th className="text-center" style={{ width: "130px" }}>Cantidad</th>
                  <th className="text-end" style={{ width: "140px" }}>Subtotal</th>
                  {!esSoloLectura && <th className="text-center" style={{ width: "60px" }}>Acción</th>}
                </tr>
              </thead>
              <tbody>
                {detalles.length === 0 ? (
                  <tr>
                    <td colSpan={esSoloLectura ? "5" : "6"} className="text-center py-4 text-muted italic">
                      <i className="bi bi-box me-2 fs-4 d-block mb-2"></i>
                      No se han listado artículos para este reabastecimiento.
                    </td>
                  </tr>
                ) : (
                  detalles.map((item) => (
                    <tr key={item.producto_id}>
                      <td>{item.producto_id}</td>
                      <td className="fw-semibold text-dark">{item.nombre}</td>
                      {/* Renderizamos utilizando el precio de costo de compra asignado */}
                      <td className="text-end">{formatearMoneda(item.precio)}</td>
                      <td className="text-center">
                        <Form.Control
                          type="number"
                          size="sm"
                          className="text-center mx-auto"
                          style={{ maxWidth: "80px" }}
                          min="1"
                          disabled={esSoloLectura}
                          value={item.cantidad}
                          onChange={(e) => actualizarCantidad(item.producto_id, Number(e.target.value))}
                        />
                      </td>
                      <td className="text-end fw-bold text-secondary">
                        {formatearMoneda(item.cantidad * item.precio)}
                      </td>
                      {!esSoloLectura && (
                        <td className="text-center">
                          <Button
                            variant="link"
                            className="text-danger p-0"
                            onClick={() => eliminarDetalle(item.producto_id)}
                          >
                            <i className="bi bi-trash-fill fs-5"></i>
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Modal.Body>

        <Modal.Footer className="bg-light d-flex justify-content-between">
          {/* LADO IZQUIERDO: Consolidar Inventario definitivamente */}
          <div>
            {compraAEditar && !esSoloLectura && (
              <Button
                variant="success"
                onClick={handleConsolidarInventarioDefinitivo}
                disabled={cerrandoRecord || deshabilitado || detalles.length === 0}
              >
                {cerrandoRecord ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Cargando Inventario...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-all me-1"></i> Completar y Asentar Stock
                  </>
                )}
              </Button>
            )}
          </div>

          {/* LADO DERECHO: Botones clásicos de control */}
          <div>
            <Button variant="secondary" className="me-2" onClick={() => setMostrar(false)}>
              {esSoloLectura ? "Salir" : "Cancelar"}
            </Button>

            {!esSoloLectura && (
              <Button
                type="submit"
                variant={compraAEditar ? "warning" : "primary"}
                disabled={detalles.length === 0 || deshabilitado}
              >
                {deshabilitado ? "Guardando..." : compraAEditar ? "Guardar Cambios" : "Procesar Compra"}
              </Button>
            )}
          </div>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};