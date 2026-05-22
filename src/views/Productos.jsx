import React, { use, useEffect, useState } from "react";
import { Container, Row, Col, Button, Alert, Spinner } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

  const [productos, setProductos] = useState([]);

  const [productosFiltrados, setProductosFiltrados] = useState([]);

  const [categorias, setCategorias] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [abrirModalEliminacion, setAbrirModalEliminacion] = useState(false);
  const [abrirModalEdicion, setAbirModalEdicion] = useState(false);

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre_producto: "",
    descripcion_producto: "",
    categoria_producto: "",
    precio_venta: "",
    archivo: null,
  });

  const [productoEditar, setProductoEditar] = useState({
    id_producto: "",
    nombre_producto: "",
    descripcion_producto: "",
    categoria_producto: "",
    precio_venta: "",
    imagen_url: "",
    archivo: null,
  });

  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [toast, setToast] = useState({ mostrar: false, message: "", tipo: "" });


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

  // ####################### REGISTRO DE CATEGORÍAS ###########################
  const [mostrarModalCategoria, setMostrarModalCategoria] = useState(false);

  const [nuevaCategoria, setNuevaCategoria] = useState({
    nombre_categoria: "",
    descripcion_categoria: "",
  });

  // En Producto.jsx, debajo de manejoCambioInput del producto
  const manejoCambioInputCategoria = (e) => {
    const { name, value } = e.target;
    setNuevaCategoria((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const agregarCategoriaDesdeProductos = async () => {
    try {
      // Validaciones...
      const { data, error } = await supabase
        .from("categorias")
        .insert([{
          nombre_categoria: nuevaCategoria.nombre_categoria,
          descripcion_categoria: nuevaCategoria.descripcion_categoria,
        }])
        .select(); // Obtenemos el registro creado

      if (error) throw error;

      const categoriaCreada = data[0];

      // 1. Refrescamos la lista de categorías del selector
      await cargarCategorias();

      // 2. 🪄 MAGIA: Marcamos la nueva categoría en el estado del producto
      setNuevoProducto(prev => ({
        ...prev,
        categoria_producto: categoriaCreada.id_categoria
      }));

      // 3. Limpiamos y cerramos
      setNuevaCategoria({ nombre_categoria: "", descripcion_categoria: "" });
      setMostrarModalCategoria(false);

      setToast({ mostrar: true, message: "Categoría creada y seleccionada", tipo: "exito" });

    } catch (err) {
      console.error(err);
    }
  };

  // ##################CARGA DE PRODUCTOS EN TABLA###########################
  const cargarProductos = async () => {
    setCargando(true);

    try {
      const { data, error } = await supabase
        .from("productos")
        .select(
          `*,
          categorias (
            nombre_categoria
          )
        `)
        .order("id_producto", { ascending: false });

      if (error) throw error;
      setProductos(data || []);
      setProductosFiltrados(data || []);
    } catch (err) {
      console.error("Error al cargar productos: ", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // ###############################################

  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setProductosFiltrados(productos);
    } else {
      const textoLower = textoBusqueda.toLowerCase();
      const filtrados = productos.filter((prod) => {
        const nombre = prod.nombre_producto?.toLowerCase() || "";
        const descripcion = prod.descripcion_producto?.toLowerCase() || "";
        const precio = prod.precio_venta?.toString() || "";

        return (
          nombre.includes(textoLower) ||
          descripcion.includes(textoLower) ||
          precio.includes(textoLower)
        );
      });
      setProductosFiltrados(filtrados);
    }
  }, [textoBusqueda, productos]);

  useEffect(() => {
    cargarCategorias();
  }, []);


  /* ****************************************************************************** */
  const agregarProducto = async () => {
    try {
      if (
        !nuevoProducto.nombre_producto.trim() ||
        !nuevoProducto.precio_venta ||
        !nuevoProducto.categoria_producto ||
        !nuevoProducto.archivo
      ) {
        setToast({
          mostrar: true,
          message: "Por favor completa todos los campos son obligatorios.",
          tipo: "advertencia",
        });
        return;
      }

      setMostrarModal(false);

      const nombreArchivo = `${Date.now()}_${nuevoProducto.archivo.name}`;

      const { error: uploadError } = await supabase.storage
        .from("imagenes_productos")
        .upload(nombreArchivo, nuevoProducto.archivo);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("imagenes_productos")
        .getPublicUrl(nombreArchivo);
      const urlPublica = urlData.publicUrl;

      const { error } = await supabase.from("productos").insert([
        {
          nombre_producto: nuevoProducto.nombre_producto,
          descripcion_producto: nuevoProducto.descripcion_producto || null,
          categoria_producto: nuevoProducto.categoria_producto,
          precio_venta: parseFloat(nuevoProducto.precio_venta),
          imagen_url: urlPublica,
        },
      ]);

      if (error) throw error;

      await cargarProductos();
      setMostrarModal(false);

      setNuevoProducto({
        nombre_producto: "",
        descripcion_producto: "",
        categoria_producto: "",
        precio_venta: "",
        archivo: null,
      });

      setToast({
        mostrar: true,
        message: "Producto agregado exitosamente.",
        tipo: "exito",
      });

    } catch (err) {
      console.error("Error al agregar producto:", err);
      setToast({
        mostrar: true,
        message: "Error al agregar el producto. Intenta nuevamente.",
        tipo: "error",
      });
    }
  };

  // ############################ EDITAR PRODUCTO ###############################
  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;
    setProductoEditar((prev) => ({ ...prev, [name]: value }));
  };

  const manejoCambioArcvhivoActualizar = (e) => {
    const archivo = e.target.files[0];
    if (archivo && archivo.type.startsWith("image/")) {
      setProductoEditar((prev) => ({ ...prev, archivo }));
    } else {
      alert("Selecciona una imagen válida (JPG, PNG, etc.");
    }
  };

  const actualizarProducto = async () => {
    try {

      if (
        !productoEditar.nombre_producto.trim() ||
        !productoEditar.categoria_producto ||
        !productoEditar.precio_venta
      ) {
        setToast({
          mostrar: true,
          message: "Completa los campos obligatorios",
          tipo: "advertencia",
        });
        return;
      }

      let datosActualizados = {
        nombre_producto: productoEditar.nombre_producto,
        descripcion_producto: productoEditar.descripcion_producto || null,
        categoria_producto: productoEditar.categoria_producto,
        precio_venta: parseFloat(productoEditar.precio_venta),
        imagen_url: productoEditar.imagen_url,
      };

      if (productoEditar.archivo) {

        const nombreArchivo = `${Date.now()}_${productoEditar.archivo.name}`;

        const { error: uploadError } = await supabase.storage
          .from("imagenes_productos")
          .upload(nombreArchivo, productoEditar.archivo);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("imagenes_productos")
          .getPublicUrl(nombreArchivo);
        datosActualizados.imagen_url = urlData.publicUrl;

        if (productoEditar.imagen_url) {
          const nombreAnterior = productoEditar.imagen_url.split("/").pop().split("?")[0];
          await supabase.storage.from("imagenes_productos").remove([nombreAnterior]).catch((e) => {
            console.warn("No se pudo borrar la imagen anterior, quizas ya no existía", err);
          });
        }
      }

      const { error } = await supabase
        .from("productos")
        .update(datosActualizados)
        .eq("id_producto", productoEditar.id_producto);

      if (error) throw error;

      await cargarProductos();

      setProductoEditar({
        id_producto: "",
        nombre_producto: "",
        descripcion_producto: "",
        categoria_producto: "",
        precio_venta: "",
        imagen_url: "",
        archivo: null,
      });

      setToast({ mostrar: true, message: "Producto actualizado correctamente", tipo: "exito" });

      setMostrarModalEdicion(false);

    } catch (err) {
      console.error("Error al actualizar: ", err);
      setToast({ mostrar: true, message: "Error al actualizar producto", tipo: "error" })
    }

  };

  // ############################# ELIMINAR PRODUCTO #############################
  const eliminarProducto = async () => {
    if (!productoAEliminar) return;

    try {
      setMostrarModalEliminacion(false);

      // 1. Opcional pero recomendado: Borrar la imagen del Storage
      if (productoAEliminar.imagen_url) {
        // Extraemos el nombre del archivo de la URL pública
        const urlPartes = productoAEliminar.imagen_url.split("/");
        const nombreArchivo = urlPartes[urlPartes.length - 1];

        await supabase.storage
          .from("imagenes_productos")
          .remove([nombreArchivo]);
      }

      // 2. Borrar el registro de la base de datos
      const { error } = await supabase
        .from("productos")
        .delete()
        .eq("id_producto", productoAEliminar.id_producto);

      if (error) throw error;

      // 3. Notificar y recargar
      await cargarProductos();
      setToast({
        mostrar: true,
        message: `Producto "${productoAEliminar.nombre_producto}" eliminado.`,
        tipo: "exito",
      });

    } catch (err) {
      console.error("Error al eliminar:", err.message);
      setToast({
        mostrar: true,
        message: "Error al eliminar el producto.",
        tipo: "error",
      });
    }
  };


  // ############################Paginación###################
  const [registrosPorPagina, establecerRegistrosPorPagina] = useState(5);
  const [paginaActual, establcerPaginaActual] = useState(1);

  const productosPaginadas = productosFiltrados.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  //############################Generar PDF de producto########################

// Función auxiliar para convertir URL a Base64
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

// Versión mejorada con imagen incluida
const generarPDFProducto = async (producto) => {
  const doc = new jsPDF();

  // Título
  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.text("REPORTE DETALLADO DE PRODUCTO", 14, 20);

  // Línea decorativa
  doc.setLineWidth(0.5);
  doc.line(14, 25, 195, 25);

  // Intentamos cargar la imagen si existe
  let imageData = null;
  if (producto.imagen_url) {
    try {
      imageData = await getBase64ImageFromURL(producto.imagen_url);
    } catch (e) {
      console.error("No se pudo cargar la imagen para el PDF", e);
    }
  }

  // Información del producto en tabla
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
    headStyles: { fillColor: [41, 128, 185] }, // Un azul profesional
  });

  // Si hay imagen, la añadimos después de la tabla
  if (imageData) {
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text("Imagen de referencia:", 14, finalY);
    // addImage(datos, formato, x, y, ancho, alto)
    doc.addImage(imageData, "PNG", 14, finalY + 5, 50, 50);
  }

  // Pie de página con fecha
  const fecha = new Date().toLocaleDateString();
  doc.setFontSize(10);
  doc.text(`Reporte generado el: ${fecha}`, 14, 285);

  // Descargar
  doc.save(`Ficha_${producto.nombre_producto.replace(/\s+/g, '_')}.pdf`);
};

  //###########################################################


  return (
    <Container className="mt-3">

      <Row className="align-items-center mb-3">
        <Col className="d-flex align-center mb-3">
          <h3 className="mb-0">
            <i className="bi-bag-heart me-2"></i>
            Productos
          </h3>
        </Col>

        <Col xs={3} sm={5} md={5} lg={5} className="text-end">
          <Button onClick={() => setMostrarModal(true)} size="md">
            <span className="d-none d-sm-inline ms-2">Nuevo Producto</span>
          </Button>
        </Col>
      </Row>

      <hr />

      <Row className="mb-4">
        <Col md={6} lg={5}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={manejarBusqueda}
            placeholder="Buscar por nombre, descripción o precio..."
          />
        </Col>
      </Row>

      {/* Mensaje de no coincidencias solo cuando hay búsqueda y no hay resultados */}
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


      { /* Modales */}

      <ModalRegistroProducto
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoProducto={nuevoProducto}
        manejoCambioinput={manejoCambioInput}
        manejoCambioArcvhivo={manejoCambioArchivo}
        agregarProducto={agregarProducto}
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
        productoEditar={productoEditar}
        manejoCambioInputEdicion={manejoCambioInputEdicion}
        manejoCambioArchivoActualizar={manejoCambioArcvhivoActualizar}
        actualizarProducto={actualizarProducto}
        categorias={categorias}
      />

      <ModalEliminacionProducto
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        eliminarProducto={eliminarProducto}
        producto={productoAEliminar}
      />

      <NotificacionOperacion
        mostrar={toast.mostrar}
        message={toast.message}
        tipo={toast.tipo}
        onClose={() => setToast({ ...toast, mostrar: false })}
      />


      {/* Sin registros */}
      {!cargando && productos.length === 0 && (
        <Row className="text-center my-5">
          <Col>
            <p className="text-muted fs-5">No hay productos registrados todavía.</p>
          </Col>
        </Row>
      )}


      {/* Lista de categorías filtratarjetas-categorias */}
      {!cargando && productosFiltrados.length > 0 && (
        <>
          <Row>
            <Col xs={12} sm={12} md={12} className="d-lg-none">
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