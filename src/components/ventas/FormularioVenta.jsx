import React, { useState } from "react";
import { Modal, Form, Button, Row, Col, Table, Card, Badge } from "react-bootstrap";

export const FormularioVenta = ({
    mostrar,
    setMostrar,
    clientes,
    empleados,
    productos,
    clienteSeleccionado,
    setClienteSeleccionado,
    empleadoSeleccionado,
    setEmpleadoSeleccionado,
    metodoPago,
    setMetodoPago,
    detalles,
    totalGeneral,
    agregarDetalle,
    eliminarDetalle,
    actualizarCantidad,
    guardarVenta,
    ventaAEditar,
    cerrarVenta, 
}) => {
    // Estados locales para el selector temporal de productos
    const [productoIdTemp, setProductoIdTemp] = useState("");
    const [cantidadTemp, setCantidadTemp] = useState(1);
    const [deshabilitado, setDeshabilitado] = useState(false);
    const [cerrandoRecord, setCerrandoRecord] = useState(false); // Spinner local para el botón de cerrar registro

    // Determinar si el documento actual ya está congelado en la base de datos
    const esSoloLectura = ventaAEditar?.estado === "Cerrada";

    // Formateador local de moneda (Córdobas)
    const formatearMoneda = (monto) => {
        return new Intl.NumberFormat("es-NI", {
            style: "currency",
            currency: "NIO",
        }).format(monto);
    };

    const handleAgregarProducto = (e) => {
        e.preventDefault();
        if (!productoIdTemp || esSoloLectura) return;

        const prod = productos.find((p) => p.id_producto === Number(productoIdTemp));
        if (prod) {
            agregarDetalle(prod, Number(cantidadTemp));
            // Resetear selectores temporales
            setProductoIdTemp("");
            setCantidadTemp(1);
        }
    };

    const handleEnviarFormulario = async (e) => {
        e.preventDefault();
        if (deshabilitado || esSoloLectura) return;

        setDeshabilitado(true);
        const exito = await guardarVenta();
        setDeshabilitado(false);
        
        // Si se guardó con éxito una nueva venta o edición, cerramos el modal
        if (exito) setMostrar(false);
    };

    // Manejador del botón manual para congelar la factura y procesar stock
    const handleCerrarRegistroDefinitivo = async () => {
        if (!ventaAEditar?.id_venta || cerrandoRecord) return;
        
        // Confirmación nativa de seguridad para evitar errores accidentales
        const seguro = window.confirm(
            `¿Está seguro que desea CERRAR la venta #${ventaAEditar.id_venta}? Una vez cerrada, se descontará el stock del inventario y no podrá volver a modificar sus datos ni sus artículos.`
        );
        
        if (!seguro) return;

        setCerrandoRecord(true);
        // Enviamos el ID y el estado actual de los detalles (carrito) para la RPC
        const exito = await cerrarVenta(ventaAEditar.id_venta, detalles);
        setCerrandoRecord(false);

        if (exito) {
            setMostrar(false); // Clausura el modal automáticamente al finalizar
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
                        <i className={`bi ${ventaAEditar ? "bi-pencil-square text-warning" : "bi-receipt text-primary"} me-2`}></i>
                        {ventaAEditar ? `Modificar Venta # ${ventaAEditar.id_venta}` : "Generar Nueva Factura de Venta"}
                    </div>
                    {/* Badge indicador del estado real en la cabecera */}
                    {ventaAEditar && (
                        <Badge bg={esSoloLectura ? "danger" : "success"} className="me-3 fs-6 px-3 py-2">
                            <i className={`bi ${esSoloLectura ? "bi-lock-fill" : "bi-unlock-fill"} me-1`}></i>
                            {ventaAEditar.estado || "Abierta"}
                        </Badge>
                    )}
                </Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleEnviarFormulario}>
                <Modal.Body>
                    {/* Alerta informativa si la factura es inmutable */}
                    {esSoloLectura && (
                        <div className="alert alert-danger d-flex align-items-center mb-3 shadow-sm" role="alert">
                            <i className="bi bi-exclamation-octagon-fill fs-4 me-2"></i>
                            <div>
                                <strong>Registro Protegido:</strong> Esta venta ha sido clasificada como <strong>Cerrada</strong>. No se permiten modificaciones en la cabecera ni en el desglose de productos.
                            </div>
                        </div>
                    )}

                    {/* SECCIÓN 1: DATOS MAESTROS (CABECERA) */}
                    <Card className="mb-3 bg-light border-0 shadow-sm">
                        <Card.Body>
                            <h6 className="text-uppercase text-secondary fw-bold mb-3 small"> Datos Generales </h6>
                            <Row>
                                {/* Selector de Cliente */}
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Cliente <span className="text-danger">*</span></Form.Label>
                                        <Form.Select
                                            value={clienteSeleccionado?.id_cliente || ""}
                                            onChange={(e) => {
                                                const cl = clientes.find((c) => c.id_cliente === Number(e.target.value));
                                                setClienteSeleccionado(cl || null);
                                            }}
                                            required
                                            disabled={!!ventaAEditar || esSoloLectura}
                                        >
                                            <option value="">-- Seleccionar Cliente --</option>
                                            {clientes.map((c) => (
                                                <option key={c.id_cliente} value={c.id_cliente}>
                                                    {c.nombre ? `${c.nombre} ${c.apellido || ""}` : `${c.nombre} ${c.apellido}`} ({c.celular || 'S/C'})
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                {/* Selector de Empleado */}
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Atendido por <span className="text-danger">*</span></Form.Label>
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
                                            <option value="tarjeta">Tarjeta de Crédito / Débito</option>
                                            <option value="transferencia">Transferencia Electrónica</option>
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
                                <h6 className="text-uppercase text-secondary fw-bold mb-3 small">Agregar Artículos</h6>
                                <Row className="align-items-end">
                                    <Col md={7}>
                                        <Form.Group className="mb-2 mb-md-0">
                                            <Form.Label>Buscar Producto</Form.Label>
                                            <Form.Select
                                                value={productoIdTemp}
                                                onChange={(e) => setProductoIdTemp(e.target.value)}
                                            >
                                                <option value="">-- Seleccione un artículo --</option>
                                                {productos.map((p) => (
                                                    <option key={p.id_producto} value={p.id_producto}>
                                                        {p.nombre} - {formatearMoneda(p.precio_venta)} (Stock: {p.stock})
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3} xs={8}>
                                        <Form.Group className="mb-2 mb-md-0">
                                            <Form.Label>Cantidad</Form.Label>
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
                        <span className="fs-6 text-uppercase text-secondary fw-bold">Cuerpo del Detalle</span>
                        <span className="fw-bold text-primary fs-4">Total: {formatearMoneda(totalGeneral)}</span>
                    </h5>

                    <div className="table-responsive border rounded bg-white shadow-sm" style={{ maxHeight: "250px" }}>
                        <Table striped hover size="sm" className="mb-0 align-middle">
                            <thead className="table-dark sticky-top">
                                <tr>
                                    <th>ID</th>
                                    <th>Descripción del Producto</th>
                                    <th className="text-end" style={{ width: "120px" }}>Precio</th>
                                    <th className="text-center" style={{ width: "130px" }}>Cantidad</th>
                                    <th className="text-end" style={{ width: "140px" }}>Subtotal</th>
                                    {!esSoloLectura && <th className="text-center" style={{ width: "60px" }}>Acción</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {detalles.length === 0 ? (
                                    <tr>
                                        <td colSpan={esSoloLectura ? "5" : "6"} className="text-center py-4 text-muted italic">
                                            <i className="bi bi-cart-x fs-4 d-block mb-2"></i>
                                            No hay artículos agregados a la orden todavía.
                                        </td>
                                    </tr>
                                ) : (
                                    detalles.map((item) => (
                                        <tr key={item.id_producto}>
                                            <td>{item.id_producto}</td>
                                            <td className="fw-semibold text-dark">{item.nombre}</td>
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
                                                    onChange={(e) => actualizarCantidad(item.id_producto, Number(e.target.value))}
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
                                                        onClick={() => eliminarDetalle(item.id_producto)}
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
                    {/* LADO IZQUIERDO DEL FOOTER: Botón exclusivo para realizar el cierre manual */}
                    <div>
                        {ventaAEditar && !esSoloLectura && (
                            <Button 
                                variant="danger" 
                                onClick={handleCerrarRegistroDefinitivo}
                                disabled={cerrandoRecord || deshabilitado || detalles.length === 0}
                            >
                                {cerrandoRecord ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Cerrando Factura...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-lock-fill me-1"></i> Cerrar Registro Definitivamente
                                    </>
                                )}
                            </Button>
                        )}
                    </div>

                    {/* LADO DERECHO DEL FOOTER: Botones clásicos de salida y guardado */}
                    <div>
                        <Button variant="secondary" className="me-2" onClick={() => setMostrar(false)}>
                            {esSoloLectura ? "Salir" : "Cancelar"}
                        </Button>
                        
                        {!esSoloLectura && (
                            <Button
                                type="submit"
                                variant={ventaAEditar ? "warning" : "primary"}
                                disabled={detalles.length === 0 || deshabilitado}
                            >
                                {deshabilitado ? "Guardando..." : ventaAEditar ? "Guardar Cambios" : "Procesar Factura"}
                            </Button>
                        )}
                    </div>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};