import { useState, useEffect, useMemo } from "react";
import { clienteServicio } from "../services/clienteServicio";

/**
 * Estructura inicial limpia para un cliente nuevo.
 */
const estructuraClienteInicial = {
  nombre: "",
  apellido: "",
  celular: "",
  email: "",
};

/**
 * Custom Hook Controlador que encapsula la lógica de negocio, control de UI y sincronización del módulo de clientes.
 * @param {Function} notificar - Callback unificado para despachar alertas/toasts al contenedor de la Vista.
 */
export const useClientes = (notificar) => {
  // Estados de datos primarios de la entidad
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [textoBusqueda, setTextoBusqueda] = useState("");

  // Estados para modales de visibilidad
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);

  // Estados de carga de formularios (entidades temporales)
  const [nuevoCliente, setNuevoCliente] = useState(estructuraClienteInicial);
  const [clienteEditar, setClienteEditar] = useState(estructuraClienteInicial);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);

  // Estados de Paginación local
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);

  /**
   * Efecto primario de inicialización del componente. Carga los registros de Supabase.
   */
  useEffect(() => {
    cargarClientes();
  }, []);

  /**
   * Petición asíncrona para refrescar la lista de clientes desde la capa de servicio.
   */
  const cargarClientes = async () => {
    try {
      setCargando(true);
      const data = await clienteServicio.obtenerTodos();
      setClientes(data);
    } catch (error) {
      notificar({ mostrar: true, message: `Error al cargar clientes: ${error.message}`, tipo: "error" });
    } finally {
      setCargando(false);
    }
  };

  /**
   * Manejador dinámico de tipeo para el formulario de inserción.
   */
  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevoCliente((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Manejador dinámico de tipeo para el formulario de edición.
   */
  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;
    setClienteEditar((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Manejador para la caja de texto del motor de búsqueda. Restablece la paginación a la primera página.
   */
  const manejarCambioBusqueda = (e) => {
    setTextoBusqueda(e.target.value);
    setPaginaActual(1);
  };

  /**
   * Operación de Negocio: Registra un cliente delegando la persistencia y actualiza el estado local.
   */
  const agregarCliente = async () => {
    try {
      await clienteServicio.crear(nuevoCliente);
      await cargarClientes();
      setMostrarModal(false);
      setNuevoCliente(estructuraClienteInicial);
      notificar({ mostrar: true, message: "Cliente registrado exitosamente.", tipo: "exito" });
    } catch (error) {
      notificar({ mostrar: true, message: `No se pudo registrar el cliente: ${error.message}`, tipo: "error" });
    }
  };

  /**
   * Operación de Negocio: Modifica un cliente existente, refresca datos y cierra el modal correspondiente.
   */
  const actualizarCliente = async () => {
    try {
      await clienteServicio.actualizar(clienteEditar);
      await cargarClientes();
      setMostrarModalEdicion(false);
      notificar({ mostrar: true, message: "Cliente actualizado correctamente.", tipo: "exito" });
    } catch (error) {
      notificar({ mostrar: true, message: `Error al actualizar cliente: ${error.message}`, tipo: "error" });
    }
  };

  /**
   * Operación de Negocio: Remueve el registro seleccionado de la base de datos por ID.
   */
  const eliminarCliente = async () => {
    if (!clienteAEliminar) return;
    try {
      await clienteServicio.eliminar(clienteAEliminar.id_cliente);
      await cargarClientes();
      setMostrarModalEliminacion(false);
      setClienteAEliminar(null);
      notificar({ mostrar: true, message: "Cliente eliminado del sistema de manera definitiva.", tipo: "exito" });
    } catch (error) {
      notificar({ mostrar: true, message: `Error al eliminar cliente: ${error.message}`, tipo: "error" });
    }
  };

  /**
   * Activador de Modal de Edición inyectando los datos de la fila seleccionada.
   * @param {Cliente} cliente - Objeto de cliente origen.
   */
  const abrirModalEdicion = (cliente) => {
    setClienteEditar({ ...cliente });
    setMostrarModalEdicion(true);
  };

  /**
   * Activador de Modal de Confirmación de Eliminación.
   * @param {Cliente} cliente - Objeto de cliente destino.
   */
  const abrirModalEliminacion = (cliente) => {
    setClienteAEliminar(cliente);
    setMostrarModalEliminacion(true);
  };

  /**
   * Motor de búsqueda reactivo en memoria filtrando por nombre, apellido o email (Case-Insensitive).
   */
  const clientesFiltrados = useMemo(() => {
    const termino = textoBusqueda.toLowerCase().trim();
    if (!termino) return clientes;
    return clientes.filter(
      (c) =>
        c.nombre.toLowerCase().includes(termino) ||
        c.apellido.toLowerCase().includes(termino) ||
        c.email.toLowerCase().includes(termino)
    );
  }, [textoBusqueda, clientes]);

  /**
   * Segmentación del array según índices de paginación para envío directo a tablas y componentes hijos.
   */
  const clientesPaginados = useMemo(() => {
    const indiceInicio = (paginaActual - 1) * registrosPorPagina;
    const indiceFin = indiceInicio + registrosPorPagina;
    return clientesFiltrados.slice(indiceInicio, indiceFin);
  }, [clientesFiltrados, paginaActual, registrosPorPagina]);

  return {
    clientes,
    clientesFiltrados,
    clientesPaginados,
    cargando,
    textoBusqueda,
    manejarCambioBusqueda,
    mostrarModal,
    setMostrarModal,
    nuevoCliente,
    manejoCambioInput,
    agregarCliente,
    mostrarModalEdicion,
    setMostrarModalEdicion,
    clienteEditar,
    manejoCambioInputEdicion,
    actualizarCliente,
    abrirModalEdicion,
    mostrarModalEliminacion,
    setMostrarModalEliminacion,
    clienteAEliminar,
    eliminarCliente,
    abrirModalEliminacion,
    registrosPorPagina,
    setRegistrosPorPagina,
    paginaActual,
    setPaginaActual,
  };
};