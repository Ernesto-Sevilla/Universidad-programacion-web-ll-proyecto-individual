import { useState, useEffect } from "react";
import { categoriaServicio } from "../../services/categoriaServicio";

/**
 * @typedef {Object} NotificacionParams
 * @property {boolean} mostrar - Estado de visibilidad.
 * @property {string} message - Mensaje a mostrar.
 * @property {string} tipo - Tipo de alerta ('exito' | 'advertencia' | 'error').
 */

/**
 * Custom hook que actúa como el controlador reactivo de la gestión de categorías.
 * * @param {function(NotificacionParams): void} notificar - Callback para actualizar el estado de las alertas (toast).
 * @returns {Object} Estados y manejadores listos para ser consumidos por la interfaz visual.
 */
export const useCategorias = (notificar) => {
  // Estados de la colección principal
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados de formularios y entidades seleccionadas
  const [nuevaCategoria, setNuevaCategoria] = useState({ nombre_categoria: "", descripcion_categoria: "" });
  const [categoriaEditar, setCategoriaEditar] = useState({ id_categoria: "", nombre_categoria: "", descripcion_categoria: "" });
  const [categoriaAEliminar, setCategoriaAEliminar] = useState({ id_categoria: "", nombre_categoria: "" });

  // Estados de Modales
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);

  // Búsqueda y Filtrado
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);

  // Paginación
  const [registrosPorPagina, establecerRegistrosPorPagina] = useState(5);
  const [paginaActual, establcerPaginaActual] = useState(1);

  // Carga inicial de datos
  const cargarCategorias = async () => {
    try {
      setCargando(true);
      const data = await categoriaServicio.obtenerTodas();
      setCategorias(data);
    } catch (err) {
      console.error("Error al cargar categorías:", err.message);
      notificar({ mostrar: true, message: "Error al cargar el listado de categorías.", tipo: "error" });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  // Efecto encargado del motor de búsquedas cliente
  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setCategoriasFiltradas(categorias);
    } else {
      const textoLower = textoBusqueda.toLowerCase().trim();
      const filtradas = categorias.filter(
        (cat) =>
          cat.nombre_categoria.toLowerCase().includes(textoLower) ||
          (cat.descripcion_categoria && cat.descripcion_categoria.toLowerCase().includes(textoLower))
      );
      setCategoriasFiltradas(filtradas);
    }
    establcerPaginaActual(1); // Reiniciar a la primera página ante una nueva búsqueda
  }, [textoBusqueda, categorias]);

  // Manejadores de entrada en formularios
  const manejarCambioBusqueda = (e) => setTextoBusqueda(e.target.value);

  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevaCategoria((prev) => ({ ...prev, [name]: value }));
  };

  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;
    setCategoriaEditar((prev) => ({ ...prev, [name]: value }));
  };

  // Apertura y control de ventanas modales
  const abrirModalEdicion = (categoria) => {
    setCategoriaEditar({
      id_categoria: categoria.id_categoria,
      nombre_categoria: categoria.nombre_categoria,
      descripcion_categoria: categoria.descripcion_categoria,
    });
    setMostrarModalEdicion(true);
  };

  const abrirModalEliminacion = (categoria) => {
    setCategoriaAEliminar(categoria);
    setMostrarModalEliminacion(true);
  };

  // Operaciones CRUD delegando en el servicio
  const agregarCategoria = async () => {
    if (!nuevaCategoria.nombre_categoria.trim() || !nuevaCategoria.descripcion_categoria.trim()) {
      notificar({ mostrar: true, message: "Debe llenar todos los campos.", tipo: "advertencia" });
      return;
    }

    try {
      await categoriaServicio.crear(nuevaCategoria);
      notificar({
        mostrar: true,
        message: `Categoría "${nuevaCategoria.nombre_categoria}" registrada exitosamente.`,
        tipo: "exito",
      });
      setNuevaCategoria({ nombre_categoria: "", descripcion_categoria: "" });
      setMostrarModal(false);
      await cargarCategorias();
    } catch (err) {
      console.error("Excepción al agregar categoría:", err.message);
      notificar({ mostrar: true, message: "Error inesperado al registrar categoría.", tipo: "error" });
    }
  };

  const actualizarCategoria = async () => {
    if (!categoriaEditar.nombre_categoria.trim() || !categoriaEditar.descripcion_categoria.trim()) {
      notificar({ mostrar: true, message: "Se debe de rellenar todos los campos.", tipo: "advertencia" });
      return;
    }

    try {
      await categoriaServicio.actualizar(categoriaEditar);
      setMostrarModalEdicion(false);
      await cargarCategorias();
      notificar({
        mostrar: true,
        message: `La categoría ${categoriaEditar.nombre_categoria} actualizada exitosamente.`,
        tipo: "exito",
      });
    } catch (err) {
      console.error("Excepción al actualizar categoría:", err.message);
      notificar({ mostrar: true, message: "Error inesperado al actualizar la categoría.", tipo: "error" });
    }
  };

  const eliminarCategoria = async () => {
    if (!categoriaAEliminar?.id_categoria) return;

    try {
      await categoriaServicio.eliminar(categoriaAEliminar.id_categoria);
      setMostrarModalEliminacion(false);
      await cargarCategorias();
      notificar({
        mostrar: true,
        message: `Categoría ${categoriaAEliminar.nombre_categoria} eliminada exitosamente.`,
        tipo: "exito",
      });
    } catch (err) {
      console.error("Excepción al eliminar categoría:", err.message);
      notificar({ mostrar: true, message: "Error inesperado al eliminar categoría.", tipo: "error" });
    }
  };

  // Cálculo de segmentos para la paginación activa
  const categoriasPaginadas = categoriasFiltradas.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  return {
    // Colecciones y carga
    categorias,
    categoriasFiltradas,
    categoriasPaginadas,
    cargando,
    
    // Búsqueda
    textoBusqueda,
    manejarCambioBusqueda,
    
    // Variables de formulario y modales
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

    // Paginación expuesta
    registrosPorPagina,
    establecerRegistrosPorPagina,
    paginaActual,
    establcerPaginaActual,
  };
};