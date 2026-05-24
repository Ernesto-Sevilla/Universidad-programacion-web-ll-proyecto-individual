import React, { use, useEffect, useState } from "react";
import { Container, Row, Col, Button, Alert } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { useProductos } from "../components/hooks/useProductos.js"

import ModalRegistroProducto from "../components/productos/ModalRegistroProducto";
import NotificacionOperacion from "../components/NotificationOperation";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import TablaProductos from "../components/productos/TablaProductos";
import ModalRegistroCategoria from "../components/categorias/ModalRegistroCategoria";
import ModalEliminacionProducto from "../components/productos/ModalEliminacionProducto";
import ModalEdicionProducto from "../components/productos/ModalEdicionProducto.jsx"
import Paginacion from "../components/ordenamiento/Paginacion";
import TarjetasProductos from "../components/productos/TarjetasProductos";

const Producto = () => {

  const [toast, setToast] = useState({ mostrar: false, message: "", tipo: "" });

  /**
   * Función puente para que el hook dispare las alertas visuales de esta vista
   */
  const notificarAlUsuario = (message, tipo) => {
    setToast({ mostrar: true, message, tipo });
  };


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

  const [categorias, setCategorias] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalCategoria, setMostrarModalCategoria] = useState(false);

  const [nuevaCategoria, setNuevaCategoria] = useState({
    nombre_categoria: "",
    descripcion_categoria: "",
  });

  // 4. Lógica de Paginación local de la vista
  const [registrosPorPagina, establecerRegistrosPorPagina] = useState(5);
  const [paginaActual, establcerPaginaActual] = useState(1);

  const productosPaginadas = productosFiltrados.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

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


  const cargarCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from("categorias")
        .select("*")
        .order("id_categoria", { ascending: true });
      if (error) throw error;
      setCategorias(data || []);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    }
  };

  const manejoCambioInputCategoria = (e) => {
    const { name, value } = e.target;
    setNuevaCategoria((prev) => ({ ...prev, [name]: value }));
  };

  const agregarCategoriaDesdeProductos = async () => {
    if (!nuevaCategoria.nombre_categoria.trim()) {
      notificarAlUsuario("El nombre de la categoría es obligatorio", "advertencia");
      return;
    }
    try {
      const { data, error } = await supabase
        .from("categorias")
        .insert([{
          nombre_categoria: nuevaCategoria.nombre_categoria,
          descripcion_categoria: nuevaCategoria.descripcion_categoria,
        }])
        .select();

      if (error) throw error;

      const categoriaCreada = data[0];
      await cargarCategorias();

      // Vincula la nueva categoría directo al formulario del producto actual
      setNuevoProducto(prev => ({
        ...prev,
        categoria_producto: categoriaCreada.id_categoria
      }));

      setNuevaCategoria({ nombre_categoria: "", descripcion_categoria: "" });
      setMostrarModalCategoria(false);
      notificarAlUsuario("Categoría creada y seleccionada", "exito");
    } catch (err) {
      console.error(err);
      notificarAlUsuario("Error al crear la categoría", "error");
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  // ==========================================================================
  // GENERADOR DE REPORTES PDF
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
        const dataURL = canvas.toDataURL("image/png");
        resolve(dataURL);
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

    doc.setLineWidth(0.5);
    doc.line(14, 25, 195, 25);

    let imageData = null;
    if (producto.imagen_url) {
      try {
        imageData = await getBase64ImageFromURL(producto.imagen_url);
      } catch (e) {
        console.error("No se pudo cargar la imagen para el PDF", e);
      }
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

    const fecha = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Reporte generado el: ${fecha}`, 14, 285);
    doc.save(`Ficha_${producto.nombre_producto.replace(/\s+/g, '_')}.pdf`);
  };

  // ==========================================================================
  // RENDERIZADO INTERFAZ DE USUARIO
  // ==========================================================================
  return (
    <Container className="mt-3">
      <Row className="align-items-center mb-3">
        <Col className="d-flex align-center mb-3">
          <h3 className="mb-0">
            <i className="bi-bag-heart me-2"></i>
            Productos
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

      <Row className="mb-4">
        <Col md={6} lg={5}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            conversorFiltro={manejarBusqueda}
            placeholder="Buscar por nombre, descripción o precio..."
          />
        </Col>
      </Row>

      {/* Mensaje de no coincidencias en la búsqueda */}
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
        categorias={categorias}
        setMostrarModalCategoria={setMostrarModalCategoria}
      />

      <ModalRegistroCategoria
        mostrarModal={mostrarModalCategoria}
        setMostrarModal={setMostrarModalCategoria}
        nuevaCategoria={nuevaCategoria}
        manejoCambioInput={manejoCambioInputCategoria}
        agregarCategoria={agregarCategoriaDesdeProductos}
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

      {/* Mensaje de base de datos vacía */}
      {!cargando && productosFiltrados.length === 0 && !textoBusqueda && (
        <Row className="text-center my-5">
          <Col>
            <p className="text-muted fs-5">No hay productos registrados todavía.</p>
          </Col>
        </Row>
      )}

      {/* RENDERIZADO ADAPTATIVO (Tablas o Tarjetas móviles) */}
      {!cargando && productosFiltrados.length > 0 && (
        <>
          <Row>
            {/* Vista Móvil y Tablets */}
            <Col xs={12} className="d-lg-none">
              <TarjetasProductos
                productos={productosPaginadas}
                abrirModalEdicion={abrirModalEdicion}
                abrirModalEliminacion={abrirModalEliminacion}
                generarPDFProducto={generarPDFProducto}
              />
            </Col>
            {/* Vista Escritorio Lg en adelante */}
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