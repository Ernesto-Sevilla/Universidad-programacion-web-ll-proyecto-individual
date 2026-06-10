// src/views/Ventas.jsx
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import { useVentas } from "@/hooks";

import NotificacionOperacion from "../components/NotificationOperation.jsx";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas.jsx";
import Paginacion from "../components/ordenamiento/Paginacion.jsx";
import { TablaVentas, TarjetaVenta, FormularioVenta } from "@/components/ventas";

const Ventas = () => {
  const {
    ventas,
    cargando,
    clientes,
    empleados,
    productos,
    toast,
    setToast,
    procesarGuardarVenta,
    cerrarVenta
  } = useVentas();

  // Estados locales de control de la UI
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [ventaAEditar, setVentaAEditar] = useState(null);

  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [detalles, setDetalles] = useState([]);
  const [totalGeneral, setTotalGeneral] = useState(0);

  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [ventasFiltradas, setVentasFiltradas] = useState([]);
  const [registrosPorPagina, establecerRegistrosPorPagina] = useState(8);
  const [paginaActual, establecerPaginaActual] = useState(1);

  // Calcular total automáticamente cuando cambien los items agregados
  useEffect(() => {
    const total = detalles.reduce((sum, det) => sum + det.cantidad * det.precio, 0);
    setTotalGeneral(total);
  }, [detalles]);

  // Motor de búsquedas reactivo (Sincronizado con las columnas reales de tu servicio)
  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setVentasFiltradas(ventas);
    } else {
      const textoLower = textoBusqueda.toLowerCase();
      const filtradas = ventas.filter(v => {
        // Sincronizado con las columnas reales: nombre y apellido
        const nombreCliente = `${v.clientes?.nombre || ""} ${v.clientes?.apellido || ""}`.toLowerCase();
        const nombreEmpleado = `${v.empleados?.nombre_empleado || ""} ${v.empleados?.apellido_empleado || ""}`.toLowerCase();

        return nombreCliente.includes(textoLower) || nombreEmpleado.includes(textoLower);
      });
      setVentasFiltradas(filtradas);
    }
  }, [textoBusqueda, ventas]);

  // Paginación de registros
  const ventasPaginadas = ventasFiltradas.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  const abrirNuevaVenta = () => {
    resetFormulario();
    setMostrarFormulario(true);
  };

  // Función de Edición robusta y sincronizada con el servicio unificado
  const abrirEdicion = (venta) => {
    setVentaAEditar(venta);

    const cliente = clientes.find(c => c.id_cliente === venta.id_cliente);
    const empleado = empleados.find(e => e.id_empleado === venta.id_empleado);

    setClienteSeleccionado(cliente || null);
    setEmpleadoSeleccionado(empleado || null);
    setMetodoPago(venta.metodo_pago || "efectivo");

    // Verificamos la existencia de la subtabla inyectada por la Opción 1
    if (venta.detalles_ventas && venta.detalles_ventas.length > 0) {
      setDetalles(venta.detalles_ventas.map(d => ({
        producto_id: d.producto_id,
        nombre: d.productos?.nombre || "Producto", // Lee correctamente el JOIN de productos
        precio: Number(d.precio_unitario),
        cantidad: Number(d.cantidad)
      })));
    } else {
      setDetalles([]);
    }
    setMostrarFormulario(true);
  };

  const resetFormulario = () => {
    setClienteSeleccionado(null);
    setEmpleadoSeleccionado(null);
    setMetodoPago("efectivo");
    setDetalles([]);
    setVentaAEditar(null);
  };

  // === FUNCIONES DEL CARRITO COMPLETADAS ===
  const agregarDetalle = (producto, cantidad) => {
    if (!producto || !cantidad) return;
    setDetalles(prev => {
      const existe = prev.find(d => d.producto_id === producto.producto_id);
      if (existe) {
        return prev.map(d =>
          d.producto_id === producto.producto_id ? { ...d, cantidad: d.cantidad + cantidad } : d
        );
      }
      return [...prev, {
        producto_id: producto.producto_id,
        nombre: producto.nombre,
        precio: producto.precio_venta,
        amount: cantidad, // Alias de soporte si se requiere
        cantidad: cantidad
      }];
    });
  };

  const eliminarDetalle = (idProducto) => {
    setDetalles(prev => prev.filter(d => d.producto_id !== idProducto));
  };

  const actualizarCantidad = (idProducto, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    setDetalles(prev => prev.map(d =>
      d.producto_id === idProducto ? { ...d, cantidad: nuevaCantidad } : d
    ));
  };

  const handleGuardarVenta = async () => {
    if (!clienteSeleccionado || !empleadoSeleccionado) return;

    const datosVenta = {
      id_cliente: clienteSeleccionado.id_cliente,
      id_empleado: empleadoSeleccionado.id_empleado,
      metodo_pago: metodoPago,
      total: totalGeneral
    };

    const exito = await procesarGuardarVenta(ventaAEditar, datosVenta, detalles);
    if (exito) {
      setMostrarFormulario(false);
      resetFormulario();
    }
  };

  return (
    <Container fluid className="py-4">
      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false })}
      />

      <Row className="mb-4 align-items-center">
        <Col>
          <h2 className="text-dark fw-bold mb-0">
            <i className="bi bi-cash-coin text-primary me-2"></i> Control de Ventas
          </h2>
        </Col>
        <Col className="text-end">
          <Button variant="primary" onClick={abrirNuevaVenta}>
            <i className="bi bi-plus-lg me-1"></i> Nueva Venta
          </Button>
        </Col>
      </Row>

      <CuadroBusquedas textoBusqueda={textoBusqueda}
        manejarCambioBusqueda={setTextoBusqueda} />

      {cargando ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted mt-2">Cargando registros de ventas...</p>
        </div>
      ) : (
        <>
          {/* Vista Escritorio */}
          <div className="d-none d-md-block">
            <TablaVentas
              ventas={ventasPaginadas}
              abrirModalEdicion={abrirEdicion}
              generarPDFVenta={() => { }}
            />
          </div>

          {/* Vista Móvil */}
          <div className="d-md-none">
            <TarjetaVenta
              ventas={ventasPaginadas}
              abrirModalEdicion={abrirEdicion}
              generarPDFVenta={() => { }}
            />
          </div>

          <Paginacion
            totalRegistros={ventasFiltradas.length}
            registrosPorPagina={registrosPorPagina}
            paginaActual={paginaActual}
            establecerPaginaActual={establecerPaginaActual}
          />
        </>
      )}

      {/* COMPONENTE INTERACTIVO MAESTRO */}
      <FormularioVenta
        mostrar={mostrarFormulario}
        setMostrar={setMostrarFormulario}
        clientes={clientes}
        empleados={empleados}
        productos={productos}
        clienteSeleccionado={clienteSeleccionado}
        setClienteSeleccionado={setClienteSeleccionado}
        empleadoSeleccionado={empleadoSeleccionado}
        setEmpleadoSeleccionado={setEmpleadoSeleccionado}
        metodoPago={metodoPago}
        setMetodoPago={setMetodoPago}
        detalles={detalles}
        totalGeneral={totalGeneral}
        agregarDetalle={agregarDetalle}
        eliminarDetalle={eliminarDetalle}
        actualizarCantidad={actualizarCantidad}
        guardarVenta={handleGuardarVenta}
        ventaAEditar={ventaAEditar}
        cerrarVenta={cerrarVenta}
      />
    </Container>
  );
};
export default Ventas;