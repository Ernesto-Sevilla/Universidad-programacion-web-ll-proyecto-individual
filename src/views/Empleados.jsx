import React, { useState } from "react";
import { Container, Row, Col, Button, Alert, Spinner } from "react-bootstrap";
import { useEmpleados } from "@/hooks";

import ModalRegistroEmpleado from "../components/empleados/ModalRegistroEmpleado";
import ModalEdicionEmpleado from "../components/empleados/ModalEdicionEmpleado";
import TablaEmpleados from "../components/empleados/TablaEmpleados";
import TarjetaEmpleado from "../components/empleados/TarjetaEmpleados";
import NotificacionOperacion from "../components/NotificationOperation";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";

/**
 * Componente de Vista principal para la gestión de la interfaz de Empleados.
 */
const Empleados = () => {
  // Estado local exclusivo para el comportamiento visual de la notificación (Toast)
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });

  /**
   * Inyecta de manera segura el estado del toast desde el controlador reactivo.
   * @param {string} mensaje 
   * @param {string} tipo 
   */
  const manejarNotificaciones = (mensaje, tipo) => {
    setToast({ mostrar: true, mensaje, tipo });
  };

  // Consumo del Hook Controlador pasándole el puente de notificaciones
  const {
    empleadosFiltrados,
    textoBusqueda,
    setTextoBusqueda,
    cargando,
    mostrarModal,
    setMostrarModal,
    mostrarModalEdicion,
    setMostrarModalEdicion,
    nuevoEmpleado,
    setNuevoEmpleado,
    empleadoEditar,
    setEmpleadoEditar,
    agregarEmpleado,
    actualizarEmpleado,
    abrirModalEdicion,
  } = useEmpleados(manejarNotificaciones);

  return (
    <Container className="mt-3">
      <Row className="align-items-center mb-3">
        <Col>
          <h3>
            <i className="bi-person-badge-fill me-2"></i>Empleados
          </h3>
        </Col>
        <Col className="text-end">
          <Button onClick={() => setMostrarModal(true)}>
            <i className="bi-plus-lg me-1"></i>Nuevo Empleado
          </Button>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={(e) => setTextoBusqueda(e.target.value)}
          />
        </Col>
      </Row>

      {cargando && (
        <Row className="text-center my-5">
          <Col>
            <Spinner animation="border" size="lg" variant="success" />
            <p className="mt-3 text-muted">Cargando empleados...</p>
          </Col>
        </Row>
      )}

      {!cargando && textoBusqueda.trim() && empleadosFiltrados.length === 0 && (
        <Row className="mb-4">
          <Col>
            <Alert className="text-center" variant="info">
              <i className="bi bi-info-circle me-2"></i>
              No se encontraron empleados que coincidan con "{textoBusqueda}".
            </Alert>
          </Col>
        </Row>
      )}

      {!cargando && empleadosFiltrados.length > 0 && (
        <Row>
          <Col className="d-lg-none" xs={12}>
            <TarjetaEmpleado
              empleados={empleadosFiltrados}
              abrirModalEdicion={abrirModalEdicion}
            />
          </Col>
          <Col className="d-none d-lg-block" lg={12}>
            <TablaEmpleados
              empleados={empleadosFiltrados}
              abrirModalEdicion={abrirModalEdicion}
            />
          </Col>
        </Row>
      )}

      {/* Componentes modales de formularios */}
      <ModalRegistroEmpleado
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoEmpleado={nuevoEmpleado}
        setNuevoEmpleado={setNuevoEmpleado}
        agregarEmpleado={agregarEmpleado}
      />

      <ModalEdicionEmpleado
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        empleadoEditar={empleadoEditar}
        setEmpleadoEditar={setEmpleadoEditar}
        actualizarEmpleado={actualizarEmpleado}
      />

      {/* Feedback flotante al operador */}
      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false })}
      />
    </Container>
  );
};

export default Empleados;