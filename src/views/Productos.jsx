import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Alert } from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Custom Hooks Controladores (Consumo e Inyección de dependencias)
import { useProductos } from "../components/hooks/useProductos.js";
import { useCategorias } from "../components/hooks/useCategorias.js"; // ¡Reutilización directa de lógica!

// Componentes Reutilizables de la Capa de Ventanas Modales
import ModalRegistroProducto from "../components/productos/ModalRegistroProducto";
import ModalEdicionProducto from "../components/productos/ModalEdicionProducto.jsx";
import ModalEliminacionProducto from "../components/productos/ModalEliminacionProducto";
import ModalRegistroCategoria from "../components/categorias/ModalRegistroCategoria";
import NotificacionOperacion from "../components/NotificationOperation";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import TablaProductos from "../components/productos/TablaProductos";
import TarjetasProductos from "../components/productos/TarjetasProductos";
import Paginacion from "../components/ordenamiento/Paginacion";

// ==========================================================================
// GENERADOR DE REPORTES PDF (Función pura fuera del renderizado)
// ==========================================================================
const getBase64ImageFromURL = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = (error) => reject(error);
    img.src = url;
  });
};

const generarPDFProducto = async (producto) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.text("REPORTE DETALLADO DE PRODUCTO", 14, 20);
  doc.line(14, 25, 195, 25);

  let imageData = null;
  if (producto.imagen_url) {
    try { imageData = await getBase64ImageFromURL(producto.imagen_url); } 
    catch (e) { console.error("No se pudo cargar la imagen para el PDF", e); }
  }

  autoTable(doc, {
    startY: 35,
    theme: 'striped',
    head: [["Campo", "Información"]],
    body: [
      ["ID del Sistema", producto.id_producto],
      ["Nombre Comercial", producto.nombre_producto],
      ["Categoría", producto.categorias?.nombre_categoria || "Sin categoría"],
      ["Precio de Venta", `$${parseFloat(producto.precio_venta).toFixed(2)}`],
      ["Descripción", producto.descripcion_producto || "Sin descripción"],
    ],
    headStyles: { fillColor: [41, 128, 185] },
  });

  if (imageData) {
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text("Imagen de referencia:", 14, finalY);
    doc.addImage(imageData, "PNG", 14, finalY + 5, 50, 50);
  }

  doc.setFontSize(10);
  doc.text(`Reporte generado el: ${new Date().toLocaleDateString()}`, 14, 285);
  doc.save(`Ficha_${producto.nombre_producto.replace(/\s+/g, '_')}.pdf`);
};

// ==========================================================================
// VISTA PRINCIPAL: PRODUCTO
// ==========================================================================
const Producto = () => {
  // Estado único local para Toasts de la vista de Productos
  const [toast, setToast] = useState({ mostrar: false, message: "", tipo: "" });

  const notificarAlUsuario = (message, tipo) => {
    setToast({ mostrar: true, message, tipo });
  };

  // 1. Hook de Control de Productos
  const {
    productosFiltrados,
    textoBusqueda,
    setTextoBusqueda,
    cargando,
    nuevoProducto,
    setNuevoProducto,
    productoEditar,
    setProductoEditar,
    productoAEliminar,
    setProductoAEliminar,
    manejoCambioInput,
    manejoCambioArchivo,
    manejoCambioInputEdicion,
    manejoCambioArchivoActualizar,
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
  } = useProductos(notificarAlUsuario);

  // 2. REUTILIZACIÓN ESTRATÉGICA: Hook de Categorías sin duplicar código
  const {
    categorias, // Lista completa sincronizada con Supabase
    mostrarModal: mostrarModalCategoria,
    setMostrarModal: setMostrarModalCategoria,
    nuevaCategoria,
    manejoCambioInput: manejoCambioInputCategoria,
    agregarCategoria,
  } = useCategorias(setToast);

  // Estados locales específicos de los Modales de Producto
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);

  // Paginación local de productos
  const [registrosPorPagina, establecerRegistrosPorPagina] = useState(5);
  const [paginaActual, establcerPaginaActual] = useState(1);

  const productosPaginadas = productosFiltrados.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  // Manejadores de Modales
  const abrirModalEdicion = (producto) => {
    setProductoEditar(producto);
    setMostrarModalEdicion(true);
  };

  const abrirModalEliminacion = (producto) => {
    setProductoAEliminar(producto);
    setMostrarModalEliminacion(true);
  };

  const manejarBusqueda = (e) => {
    setTextoBusqueda(e.target.value);
  };

  /**
   * Ejecuta el registro de la categoría delegando en el hook nativo,
   * y vincula dinámicamente la nueva categoría creada al producto actual.
   */
  const ejecutarCreacionCategoriaExpress = async () => {
    await agregarCategoria();
    
    // Buscar la última categoría agregada para seleccionarla automáticamente en el selector
    if (categorias.length > 0) {
      const ultimaCategoria = categorias[categorias.length - 1];
      setNuevoProducto(prev => ({
        ...prev,
        categoria_producto: ultimaCategoria.id_categoria
      }));
    }
  };

  return (
    <Container className="mt-3">
      {/* Cabecera y Botón Nuevo Producto */}
      <Row className="align-items-center mb-3">
        <Col className="d-flex align-center mb-3">
          <h3 className="mb-0">
            <i className="bi-bag-heart me-2"></i> Productos
          </h3>
        </Col>
        <Col xs={6} sm={5} md={5} lg={5} className="text-end">
          <Button onClick={() => setMostrarModal(true)} size="md">
            <i className="bi bi-plus-circle me-2"></i>
            <span className="d-none d-sm-inline">Nuevo Producto</span>
          </Button>
        </Col>
      </Row>

      <hr />

      {/* Barra de Búsquedas */}
      <Row className="mb-4">
        <Col md={6} lg={5}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={manejarBusqueda}
            placeholder="Buscar por nombre, descripción o precio..."
          />
        </Col>
      </Row>

      {/* Alerta de Búsqueda sin Resultados */}
      {!cargando && textoBusqueda.trim() && productosFiltrados.length === 0 && (
        <Row className="mb-4">
          <Col>
            <Alert variant="info" className="text-center">
              <i className="bi bi-info-circle me-2"></i>
              No se encontraron productos que coincidan con "{textoBusqueda}".
            </Alert>
          </Col>
        </Row>
      )}

      {/* ==================== CAPA DE VENTANAS MODALES ==================== */}
      <ModalRegistroProducto
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoProducto={nuevoProducto}
        manejoCambioinput={manejoCambioInput}
        manejoCambioArcvhivo={manejoCambioArchivo}
        agregarProducto={() => agregarProducto(() => setMostrarModal(false))}
        categorias={categorias} // Pasa las categorías leídas del hook reutilizado
        setMostrarModalCategoria={setMostrarModalCategoria} // Abre el modal de categorías express
      />

      {/* Reutilización del Modal usando directamente las funciones del hook de categorías */}
      <ModalRegistroCategoria
        mostrarModal={mostrarModalCategoria}
        setMostrarModal={setMostrarModalCategoria}
        nuevaCategoria={nuevaCategoria}
        manejoCambioInput={manejoCambioInputCategoria}
        agregarCategoria={ejecutarCreacionCategoriaExpress}
      />

      <ModalEdicionProducto
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        productoEditar={productoEditar}
        manejoCambioInputEdicion={manejoCambioInputEdicion}
        manejoCambioArchivoActualizar={manejoCambioArchivoActualizar}
        actualizarProducto={() => actualizarProducto(() => setMostrarModalEdicion(false))}
        categorias={categorias}
      />

      <ModalEliminacionProducto
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        eliminarProducto={() => eliminarProducto(() => setMostrarModalEliminacion(false))}
        producto={productoAEliminar}
      />

      <NotificacionOperacion
        mostrar={toast.mostrar}
        message={toast.message}
        tipo={toast.tipo}
        onClose={() => setToast({ ...toast, mostrar: false })}
      />

      {/* Base de datos vacía */}
      {!cargando && productosFiltrados.length === 0 && !textoBusqueda && (
        <Row className="text-center my-5">
          <Col>
            <p className="text-muted fs-5">No hay productos registrados todavía.</p>
          </Col>
        </Row>
      )}

      {/* ==================== RENDERIZADO ADAPTATIVO ==================== */}
      {!cargando && productosFiltrados.length > 0 && (
        <>
          <Row>
            <Col xs={12} className="d-lg-none">
              <TarjetasProductos
                productos={productosPaginadas}
                abrirModalEdicion={abrirModalEdicion}
                abrirModalEliminacion={abrirModalEliminacion}
                generarPDFProducto={generarPDFProducto}
              />
            </Col>
            <Col lg={12} className="d-none d-lg-block">
              <TablaProductos
                productos={productosPaginadas}
                abrirModalEdicion={abrirModalEdicion}
                abrirModalEliminacion={abrirModalEliminacion}
                generarPDFProducto={generarPDFProducto}
              />
            </Col>
          </Row>

          <Paginacion
            registrosPorPagina={registrosPorPagina}
            totalRegistros={productosFiltrados.length}
            paginaActual={paginaActual}
            establcerPaginaActual={establcerPaginaActual}
            establecerRegistrosPorPagina={establecerRegistrosPorPagina}
          />
        </>
      )}
    </Container>
  );
};

export default Producto;