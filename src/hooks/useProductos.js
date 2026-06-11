import { useState, useEffect } from "react";
import { productoServicio } from "../services/productoServicio"

/**
 * Custom Hook para gestionar el estado reactivo, filtrado y operaciones CRUD de productos.
 * Delega la persistencia de datos directamente a la capa de servicios.
 * * @param {Function} notificar - Función callback para disparar alertas/Toasts en la UI (recibe: mensaje, tipo).
 * @returns {Object} Estados y manejadores de eventos listos para ser consumidos por la vista JSX.
 */
export const useProductos = (notificar) => {

  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);


  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    descripcion_producto: "",
    categoria_producto: "",
    precio_venta: "",
    stock: "",
    archivo: null,
  });

  const [productoEditar, setProductoEditar] = useState({
    id_producto: "",
    nombre: "",
    descripcion_producto: "",
    categoria_producto: "",
    precio_venta: "",
    stock: "",
    imagen_url: "",
    archivo: null,
  });

  const [productoAEliminar, setProductoAEliminar] = useState(null);


  const cargarProductos = async () => {
    setCargando(true);
    try {
      const datos = await productoServicio.obtenerTodos();
      setProductos(datos);
    } catch (err) {
      console.error("Error al cargar productos en el hook: ", err);
      if (notificar) notificar("No se pudieron cargar los productos", "error")
    } finally {
      setCargando(false);
    }
  };


  const agregarProducto = async (onSuccess) => {
    // Validación rápida de campos obligatorios
    if (!nuevoProducto.nombre || !nuevoProducto.precio_venta || !nuevoProducto.categoria_producto || !nuevoProducto.archivo) {
      if (notificar) notificar("Por favor completa todos los campos obligatorios.", "advertencia");
      return;
    }
    try {
      // 1. Subir la imagen al Storage
      const urlPublica = await productoServicio.subirImagen(nuevoProducto.archivo);
      // 2. Insertar el registro en la DB
      await productoServicio.crear(nuevoProducto, urlPublica);

      // 3. Sincronizar UI y limpiar
      await cargarProductos();
      setNuevoProducto({ nombre: "", descripcion_producto: "", categoria_producto: "", precio_venta: "", stock: "", archivo: null });

      if (onSuccess) onSuccess(); // Cierra el modal en la UI
      if (notificar) notificar("Producto agregado exitosamente.", "exito");
    } catch (err) {
      console.error(err);
      if (notificar) notificar("Error al agregar el producto. Intenta nuevamente.", "error");
    }
  };


  const actualizarProducto = async (onSuccess) => {
    if (!productoEditar.nombre || !productoEditar.categoria_producto || !productoEditar.precio_venta) {
      if (notificar) notificar("Completa los campos obligatorios.", "advertencia");
      return;
    }

    try {
      let datosActualizados = {
        nombre: productoEditar.nombre,
        descripcion_producto: productoEditar.descripcion_producto || null,
        categoria_producto: productoEditar.categoria_producto,
        precio_venta: parseFloat(productoEditar.precio_venta),
        stock: productoEditar.stock,
        imagen_url: productoEditar.imagen_url,
      };

      // Si el usuario eligió un nuevo archivo, reemplazamos la imagen
      if (productoEditar.archivo) {
        const nuevaUrl = await productoServicio.subirImagen(productoEditar.archivo);
        if (productoEditar.imagen_url) {
          await productoServicio.eliminarImagen(productoEditar.imagen_url);
        }
        datosActualizados.imagen_url = nuevaUrl;
      }

      await productoServicio.actualizar(productoEditar.id_producto, datosActualizados);
      await cargarProductos();

      if (onSuccess) onSuccess();
      if (notificar) notificar("Producto actualizado correctamente.", "exito");
    } catch (err) {
      console.error(err);
      if (notificar) notificar("Error al actualizar el producto.", "error");
    }
  };



  // ############################ EDITAR PRODUCTO ###############################



  const abrirModalEdicion = (producto) => {
    setProductoEditar(producto);     // 1. Guarda el producto clickeado en el estado
    setMostrarModalEdicion(true);    // 2. Abre el modal (cambia el booleano a true)
  };



  // ############################# ELIMINAR PRODUCTO #############################
  // Agrega esto en tu vista principal junto a tus otros métodos
  const abrirModalEliminacion = (producto) => {
    setProductoAEliminar(producto);     // Guarda el producto seleccionado temporalmente
    setMostrarModalEliminacion(true);   // Abre el modal de confirmación
  };

  const eliminarProducto = async (onSuccess) => {
    if (!productoAEliminar) return;

    try {
      // 1. Limpieza del Storage
      if (productoAEliminar.imagen_url) {
        await productoServicio.eliminarImagen(productoAEliminar.imagen_url);
      }
      // 2. Eliminación física en DB
      await productoServicio.eliminar(productoAEliminar.id_producto);

      await cargarProductos();
      if (onSuccess) onSuccess();
      if (notificar) notificar(`Producto "${productoAEliminar.nombre}" eliminado.`, "exito");
    } catch (err) {
      console.error(err);
      if (notificar) notificar("Error al eliminar el producto.", "error");
    }
  };


  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevoProducto((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const manejoCambioArchivo = (e) => {
    const archivo = e.target.files[0];
    if (archivo && archivo.type.startsWith("image/")) {
      setNuevoProducto((prev) => ({
        ...prev, archivo
      }));
    } else {
      alert("Selecciona una imagen válida (JPG, PNG etc.)");
    }
  };

  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;
    setProductoEditar((prev) => ({ ...prev, [name]: value }));
  };

  const manejoCambioArchivoActualizar = (e) => {
    const archivo = e.target.files[0];
    if (archivo && archivo.type.startsWith("image/")) {
      setProductoEditar((prev) => ({ ...prev, archivo }));
    } else {
      alert("Selecciona una imagen válida (JPG, PNG, etc.");
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    const termino = textoBusqueda.toLowerCase().trim();
    if (!termino) {
      setProductosFiltrados(productos);
      return;
    }

    setProductosFiltrados(
      productos.filter((prod) => {
        const nombre = prod.nombre?.toLowerCase() || "";
        const descripcion = prod.descripcion_producto?.toLowerCase() || "";
        const precio = prod.precio_venta?.toString() || "";
        return nombre.includes(termino) || descripcion.includes(termino) || precio.includes(termino);
      })
    );
  }, [textoBusqueda, productos]);

  return {
    productos,
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
    recargarProductos: cargarProductos
  };
};

export default useProductos;