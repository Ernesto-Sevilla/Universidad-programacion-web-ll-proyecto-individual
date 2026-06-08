import React, { useState } from "react";
import { Container, Row, Col, Button, Alert } from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Custom Hooks de control
import { useCategorias, useClipboard } from "@/hooks";

import { formatService } from "@/services";

// Componentes Reutilizables e Hijos
import ModalRegistroCategoria from "../components/categorias/ModalRegistroCategoria";
import ModalEdicionCategoria from "../components/categorias/ModalEdicionCategoria";
import ModalEliminacionCategoria from "../components/categorias/ModalEliminacionCategoria";
import NotificacionOperacion from "../components/NotificationOperation";
import TablaCategorias from "../components/categorias/TablaCategorias";
import TarjetaCategoria from "../components/categorias/TarjetaCategoria";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import Paginacion from "../components/ordenamiento/Paginacion";

/**
 * Función pura auxiliar para renderizar y exportar la ficha en PDF de la entidad.
 * @param {Object} categoria - La categoría elegida para exportación.
 */
const generarPDFCategoria = (categoria) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Reporte de Categoría", 14, 20);
  doc.line(14, 25, 195, 25);
  doc.setFontSize(12);

  autoTable(doc, {
    startY: 35,
    head: [["Campo", "Valor"]],
    body: [
      ["ID", categoria.id_categoria],
      ["Nombre", categoria.nombre_categoria],
      ["Descripción", categoria.descripcion_categoria],
    ],
  });

  doc.save(`categoria_${categoria.id_categoria}.pdf`);
};

const Categorias = () => {
  // Estado local único para las alertas toast (requerido por el controlador)
  const [toast, setToast] = useState({ mostrar: false, message: "", tipo: "" });

  // Desestructuración limpia de toda la lógica inyectada por el Custom Hook controlador
  const {
    categorias,
    categoriasFiltradas,
    categoriasPaginadas,
    cargando,
    textoBusqueda,
    manejarCambioBusqueda,
    mostrarModal,
    setMostrarModal,
    nuevaCategoria,
    manejoCambioInput,
    agregarCategoria,
    mostrarModalEdicion,
    setMostrarModalEdicion,
    categoriaEditar,
    manejoCambioInputEdicion,
    actualizarCategoria,
    abrirModalEdicion,
    mostrarModalEliminacion,
    setMostrarModalEliminacion,
    categoriaAEliminar,
    eliminarCategoria,
    abrirModalEliminacion,
    registrosPorPagina,
    establecerRegistrosPorPagina,
    paginaActual,
    establcerPaginaActual,
  } = useCategorias(setToast);

  /**
   * Manejador intermedio para procesar el copiado de una categoría.
   * Utiliza el formateador de servicios y despacha la acción técnica al portapapeles.
   * @param {Object} categoria - Objeto con los atributos de la fila seleccionada.
   */
  const manejarCopiarCategoria = (categoria) => {
    const textoEstructurado = formatService.categoriaParaPortapapeles(categoria);
    copiarAlPortapapeles(
      textoEstructurado,
      `Categoría "${categoria.nombre_categoria}" copiada al portapapeles`
    );
  };

  // Hook personalizado e independiente para la gestión del portapapeles global
  const {
    toast: toastClipboard,
    copiarAlPortapapeles,
    cerrarToast: cerrarToastClipboard
  } = useClipboard();

  return (
    <Container className="mt-3">
      {/* Título y Botón de creación superior */}
      <Row className="align-items-center mb-3">
        <Col xs={9} sm={7} md={7} lg={7} className="d-flex align-items-center">
          <h3 className="mb-0">
            <i className="bi-bookmark-plus-fill me-2"></i> Categorías
          </h3>
        </Col>
        <Col xs={3} sm={5} md={5} lg={5} className="text-end">
          <Button onClick={() => setMostrarModal(true)} size="md">
            <i className="bi-plus-lg"></i>
            <span className="d-none d-sm-inline ms-2">Nueva Categoría</span>
          </Button>
        </Col>
      </Row>

      <hr />

      {/* Control del Cuadro de Búsqueda */}
      <Row className="mb-4">
        <Col md={6} lg={5}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={manejarCambioBusqueda}
            placeholder="Buscar por nombre o descripción..."
          />
        </Col>
      </Row>

      {/* Alerta de no coincidencias filtradas */}
      {!cargando && textoBusqueda.trim() && categoriasFiltradas.length === 0 && (
        <Row className="mb-4">
          <Col>
            <Alert variant="info" className="text-center">
              <i className="bi bi-info-circle me-2"></i>
              No se encontraron categorías que coincidan con "{textoBusqueda}".
            </Alert>
          </Col>
        </Row>
      )}

      {/* Modales Modulares del Sistema */}
      <ModalRegistroCategoria
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevaCategoria={nuevaCategoria}
        manejoCambioInput={manejoCambioInput}
        agregarCategoria={agregarCategoria}
      />

      <ModalEdicionCategoria
        mostrarModalEdicion={mostrarModalEdicion}
        SetMostrarModalEdicion={setMostrarModalEdicion}
        categoriaEditar={categoriaEditar}
        manejoCambioInputEdicion={manejoCambioInputEdicion}
        actualizarCategoria={actualizarCategoria}
      />

      <ModalEliminacionCategoria
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        eliminarCategoria={eliminarCategoria}
        categoria={categoriaAEliminar}
      />

      {/* Contenedor en caso de tabla vacía sin registros en base de datos */}
      {!cargando && categorias.length === 0 && (
        <Row className="text-center my-5">
          <Col>
            <p className="text-muted fs-5">No hay categorías registradas todavía.</p>
          </Col>
        </Row>
      )}

      {/* Alertas dinámicas Toast */}
      <NotificacionOperacion
        mostrar={toast.mostrar}
        message={toast.message}
        tipo={toast.tipo}
        onClose={() => setToast({ ...toast, mostrar: false })}
      />

      <NotificacionOperacion
        mostrar={toastClipboard.mostrar}
        message={toastClipboard.mensaje}
        tipo={toastClipboard.tipo}
        onClose={cerrarToastClipboard}
      />

      {/* Sección de Datos y Tablas Renderizadas */}
      {!cargando && categoriasFiltradas.length > 0 && (
        <>
          <Row>
            {/* Responsivo: Tarjetas para Móviles / Tablets */}
            <Col xs={12} sm={12} md={12} className="d-lg-none">
              <TarjetaCategoria
                categorias={categoriasPaginadas}
                abrirModalEdicion={abrirModalEdicion}
                abrirModalEliminacion={abrirModalEliminacion}
                generarPDFCategoria={generarPDFCategoria}
              />
            </Col>
            {/* Responsivo: Tabla estructurada para pantallas grandes */}
            <Col lg={12} className="d-none d-lg-block">
              <TablaCategorias
                categorias={categoriasPaginadas}
                abrirModalEdicion={abrirModalEdicion}
                abrirModalEliminacion={abrirModalEliminacion}
                generarPDFCategoria={generarPDFCategoria}
                copiarCategoria={manejarCopiarCategoria}
              />
            </Col>
          </Row>

          {/* Componente de Navegación de Páginas */}
          <Paginacion
            registrosPorPagina={registrosPorPagina}
            totalRegistros={categoriasFiltradas.length}
            paginaActual={paginaActual}
            establcerPaginaActual={establcerPaginaActual}
            establecerRegistrosPorPagina={establecerRegistrosPorPagina}
          />
        </>
      )}
    </Container>
  );
};

export default Categorias;