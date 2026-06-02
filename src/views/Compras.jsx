// src/views/Compras.jsx
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import { useCompras } from "@/hooks";

import NotificacionOperacion from "../components/NotificationOperation";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import Paginacion from "../components/ordenamiento/Paginacion.jsx";
import { TablaCompras, TarjetaCompra, FormularioCompra } from "@/components/compras";

const Compras = () => {
  const {
    compras,
    cargando,
    empleados,
    productos,
    toast,
    setToast,
    procesarGuardarCompra,
    concluirCompra
  } = useCompras();

  // Estados locales de control de la UI
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [compraAEditar, setCompraAEditar] = useState(null);

  const [proveedor, setProveedor] = useState("");
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [detalles, setDetalles] = useState([]);
  const [totalGeneral, setTotalGeneral] = useState(0);

  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [comprasFiltradas, setComprasFiltradas] = useState([]);
  const [registrosPorPagina, establecerRegistrosPorPagina] = useState(8);
  const [paginaActual, establecerPaginaActual] = useState(1);

  // Calcular costo total automáticamente cuando cambien los items del detalle
  useEffect(() => {
    const total = detalles.reduce((sum, det) => sum + det.cantidad * det.precio, 0);
    setTotalGeneral(total);
  }, [detalles]);

  // Motor de búsquedas reactivo adaptado al módulo de compras
  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setComprasFiltradas(compras);
    } else {
      const textoLower = textoBusqueda.toLowerCase();
      const filtradas = compras.filter(c => {
        const nombreProveedor = (c.proveedor || "").toLowerCase();
        const nombreEmpleado = `${c.empleados?.nombre_empleado || ""} ${c.empleados?.apellido_empleado || ""}`.toLowerCase();
        
        return nombreProveedor.includes(textoLower) || nombreEmpleado.includes(textoLower);
      });
      setComprasFiltradas(filtradas);
    }
  }, [textoBusqueda, compras]);

  // Paginación de registros
  const comprasPaginadas = comprasFiltradas.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  const abrirNuevaCompra = () => {
    resetFormulario();
    setMostrarFormulario(true);
  };

  // Función de edición sincronizada con la estructura de la base de datos de compras
  const abrirEdicion = (compra) => {
    setCompraAEditar(compra);
    
    const empleado = empleados.find(e => e.id_empleado === compra.id_empleado);

    setProveedor(compra.proveedor || "");
    setEmpleadoSeleccionado(empleado || null);
    setMetodoPago(compra.metodo_pago || "efectivo");

    // Sincronización del desglose inyectado por la relación maestro-detalle
    if (compra.detalles_compras && compra.detalles_compras.length > 0) {
      setDetalles(compra.detalles_compras.map(d => ({
        producto_id: d.producto_id,
        nombre: d.productos?.nombre || "Producto", // Resuelve JOIN relacional
        precio: Number(d.precio_costo),
        cantidad: Number(d.cantidad)
      })));
    } else {
      setDetalles([]);
    }
    setMostrarFormulario(true);
  };

  const resetFormulario = () => {
    setProveedor("");
    setEmpleadoSeleccionado(null);
    setMetodoPago("efectivo");
    setDetalles([]);
    setCompraAEditar(null);
  };

  // === GESTIÓN LOGÍSTICA DEL CARRITO DE COMPRAS ===
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
        precio: producto.precio_compra, // Captura el costo real de adquisición
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

  const handleGuardarCompra = async () => {
    if (!proveedor.trim() || !empleadoSeleccionado) return;

    const datosCompra = {
      proveedor: proveedor.trim(),
      id_empleado: empleadoSeleccionado.id_empleado,
      metodo_pago: metodoPago,
      total: totalGeneral
    };

    const exito = await procesarGuardarCompra(compraAEditar, datosCompra, detalles);
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
            <i className="bi bi-box-seam text-success me-2"></i> Control de Abastecimiento
          </h2>
        </Col>
        <Col className="text-end">
          <Button variant="success" onClick={abrirNuevaCompra}>
            <i className="bi bi-plus-lg me-1"></i> Registrar Compra
          </Button>
        </Col>
      </Row>

      <CuadroBusquedas 
        textoBusqueda={textoBusqueda} 
        manejarCambioBusqueda={setTextoBusqueda} 
      />

      {cargando ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="success" />
          <p className="text-muted mt-2">Consultando órdenes de compra en el servidor...</p>
        </div>
      ) : (
        <>
          {/* Vista Escritorio */}
          <div className="d-none d-md-block">
            <TablaCompras 
              compras={comprasPaginadas} 
              abrirModalEdicion={abrirEdicion} 
            />
          </div>

          {/* Vista Dispositivos Móviles */}
          <div className="d-md-none">
            <TarjetaCompra 
              compras={comprasPaginadas} 
              abrirModalEdicion={abrirEdicion} 
            />
          </div>

          <Paginacion 
            totalRegistros={comprasFiltradas.length} 
            registrosPorPagina={registrosPorPagina} 
            paginaActual={paginaActual} 
            establecerPaginaActual={establecerPaginaActual} 
          />
        </>
      )}

      {/* MODAL DEL FORMULARIO CON INTERCONEXIÓN DE PROPS */}
      <FormularioCompra
        mostrar={mostrarFormulario}
        setMostrar={setMostrarFormulario}
        empleados={empleados}
        productos={productos}
        proveedor={proveedor}
        setProveedor={setProveedor}
        empleadoSeleccionado={empleadoSeleccionado}
        setEmpleadoSeleccionado={setEmpleadoSeleccionado}
        metodoPago={metodoPago}
        setMetodoPago={setMetodoPago}
        detalles={detalles}
        totalGeneral={totalGeneral}
        agregarDetalle={agregarDetalle}
        eliminarDetalle={eliminarDetalle}
        actualizarCantidad={actualizarCantidad}
        guardarCompra={handleGuardarCompra}
        compraAEditar={compraAEditar}
        concluirCompra={concluirCompra}      
      />
    </Container>
  );
};

export default Compras;