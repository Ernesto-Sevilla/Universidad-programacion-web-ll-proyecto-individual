import { useState, useEffect } from "react";
import empleadoServicio from "../services/empleadoServicio";

/**
 * @callback NotificarCallback
 * @param {string} mensaje - Mensaje a mostrar en la notificación.
 * @param {'exito'|'error'|'advertencia'} tipo - Tipo o severidad de la alerta.
 */

/**
 * Custom Hook controlador que encapsula el estado reactivo y la lógica CRUD de Empleados.
 * @param {NotificarCallback} notificar - Callback para emitir notificaciones a la interfaz de usuario.
 */
export const useEmpleados = (notificar) => {
  const [empleados, setEmpleados] = useState([]);
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);

  const [nuevoEmpleado, setNuevoEmpleado] = useState({
    nombre_empleado: "",
    apellido_empleado: "",
    celular: "",
    pin: "",
    email: "",
    password: "",
    tipo_empleado: "",
  });

  const [empleadoEditar, setEmpleadoEditar] = useState({
    id_empleado: "",
    nombre_empleado: "",
    apellido_empleado: "",
    celular: "",
    pin: "",
    email: "",
    tipo_empleado: "",
  });

  /**
   * Orquesta la lectura de empleados invocando al servicio.
   */
  const cargarEmpleados = async () => {
    try {
      setCargando(true);
      const data = await empleadoServicio.obtenerTodos();
      setEmpleados(data);
      setEmpleadosFiltrados(data);
    } catch (err) {
      console.error(err);
      notificar("Error al cargar empleados", "error");
    } finally {
      setCargando(false);
    }
  };

  // Ciclo de vida inicial
  useEffect(() => {
    cargarEmpleados();
  }, []);

  // Motor de búsqueda reactivo en cliente
  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setEmpleadosFiltrados(empleados);
    } else {
      const texto = textoBusqueda.toLowerCase().trim();
      const filtrados = empleados.filter((emp) =>
        `${emp.nombre_empleado} ${emp.apellido_empleado} ${emp.email || ""} ${emp.tipo_empleado || ""}`
          .toLowerCase()
          .includes(texto)
      );
      setEmpleadosFiltrados(filtrados);
    }
  }, [textoBusqueda, empleados]);

  /**
   * Valida y procesa la creación de un nuevo empleado.
   */
  const agregarEmpleado = async () => {
    if (
      !nuevoEmpleado.nombre_empleado ||
      !nuevoEmpleado.apellido_empleado ||
      !nuevoEmpleado.email ||
      !nuevoEmpleado.password ||
      !nuevoEmpleado.tipo_empleado
    ) {
      notificar(
        "Los campos Nombre, Apellido, Email, Contraseña y Rol son obligatorios",
        "advertencia"
      );
      return;
    }

    try {
      setMostrarModal(false);
      await empleadoServicio.crear(nuevoEmpleado);
      
      await cargarEmpleados();
      
      notificar(
        `Empleado ${nuevoEmpleado.nombre_empleado} registrado correctamente`,
        "exito"
      );
      
      // Reseteo del formulario
      setNuevoEmpleado({
        nombre_empleado: "",
        apellido_empleado: "",
        celular: "",
        pin: "",
        email: "",
        password: "",
        tipo_empleado: "",
      });
    } catch (err) {
      console.error(err);
      notificar(err.message || "Error al registrar empleado", "error");
    }
  };

  /**
   * Valida y procesa la modificación de un empleado.
   */
  const actualizarEmpleado = async () => {
    if (
      !empleadoEditar.nombre_empleado ||
      !empleadoEditar.apellido_empleado ||
      !empleadoEditar.tipo_empleado
    ) {
      notificar("Nombre, Apellido y Rol son obligatorios", "advertencia");
      return;
    }

    try {
      setMostrarModalEdicion(false);
      await empleadoServicio.actualizar(empleadoEditar);
      
      await cargarEmpleados();
      
      notificar(`Empleado ${empleadoEditar.nombre_empleado} actualizado`, "exito");
    } catch (err) {
      console.error(err);
      notificar("Error al actualizar empleado", "error");
    }
  };

  /**
   * Prepara el estado de edición e interactúa abriendo el modal correspondiente.
   * @param {Object} empleado - Datos nativos del empleado seleccionado de la lista.
   */
  const abrirModalEdicion = (empleado) => {
    setEmpleadoEditar({
      id_empleado: empleado.id_empleado,
      nombre_empleado: empleado.nombre_empleado,
      apellido_empleado: empleado.apellido_empleado,
      celular: empleado.celular || "",
      pin: empleado.pin || "",
      email: empleado.email || "",
      tipo_empleado: empleado.tipo_empleado,
    });
    setMostrarModalEdicion(true);
  };

  return {
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
  };
};