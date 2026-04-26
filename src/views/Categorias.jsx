import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";

import ModalRegistroCategoria from "../components/categorias/ModalRegistroCategoria";
import ModalEdicionCategoria from "../components/categorias/ModalEdicionCategoria";
import NotificacionOperacion from "../components/NotificationOperation";
import TablaCategorias from "../components/categorias/TablaCategorias";

const Categorias = () => {

  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);

  const [categoriaEditar, setCategoriaEditar] = useState({
    nombre_categoria: "",
    descripcion_categoria: ""
  });

  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });
  const [mostrarModal, setMostrarModal] = useState(false);

  const [nuevaCategoria, setNuevaCategoria] = useState({
    nombre_categoria: "",
    descripcion_categoria: "",
  });

  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevaCategoria((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const abrirModalEdicion = (categoria) => {
    setCategoriaEditar({
      id_categoria: categoria.id_categoria, // Asegúrate que coincida con el nombre en DB
      nombre_categoria: categoria.nombre_categoria,
      descripcion_categoria: categoria.descripcion_categoria,
    });
    setMostrarModalEdicion(true); // Ahora sí abrimos el modal
  };

  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;
    setCategoriaEditar((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 2. Función para traer los datos
  const cargarCategorias = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("categorias")
        .select("*")
        .order("id_categoria", { ascending: true }); // Usando el nombre correcto

      if (error) throw error;
      setCategorias(data || []);
    } catch (err) {
      console.error("Error:", err.message);
    } finally {
      setCargando(false); // ¡Esto hace que la tabla aparezca!
    }
  };

  const actualizarCategoria = async () => {
    try {
      if (
        !categoriaEditar.nombre_categoria.trim() ||
        !categoriaEditar.descripcion_categoria.trim()
      ) {
        setToast({
          mostrar: true,
          mensaje: "Se debe de rellenar todos los campos.",
          tipo: "advertencia",
        });
        return;
      }

      setMostrarModalEdicion(false);

      const { error } = await supabase
        .from("categorias")
        .update({
          nombre_categoria: categoriaEditar.nombre_categoria,
          descripcion_categoria: categoriaEditar.descripcion_categoria,
        })
        .eq("id_categoria", categoriaEditar.id_categoria);

      if (error) {
        console.error("Error al actualizar categorías: ", error.message);
        setToast({
          mostrar: true,
          mensaje: `Error al actualizar la categoría: ${categoriaEditar.nombre_categoria}.`,
          tipo: "error",
        });
        return;
      }

      await cargarCategorias();
      setToast({
        mostrar: true,
        mensaje: `La categoría ${categoriaEditar.nombre_categoria} actualizada exitosamente.`,
        tipo: "exito",
      });
    } catch (err) {
      setToast({
        mostrar: true,
        mensaje: "Error inesperado al actualizar la categoría.",
        tipo: "error",
      });
      console.error("Excepción al actualizar la categoría: ", err.message);
    }
  };

  // 3. Ejecutar al cargar la página
  useEffect(() => {
    cargarCategorias();
  }, []);

  const agregarCategoria = async () => {
    try {
      if (
        !nuevaCategoria.nombre_categoria.trim() ||
        !nuevaCategoria.descripcion_categoria.trim()
      ) {
        setToast({
          mostrar: true,
          mensaje: "Debe llenar todos los campos.",
          tipo: "advertencia",
        });
        return;
      }

      const { error } = await supabase.from("categorias").insert([
        {
          nombre_categoria: nuevaCategoria.nombre_categoria,
          descripcion_categoria: nuevaCategoria.descripcion_categoria,
        },
      ]);

      if (error) {
        console.error("Error al agregar categoría:", error.message);
        setToast({
          mostrar: true,
          mensaje: "Error al registrar categoría.",
          tipo: "error",
        });
        return;
      }

      // Éxito
      setToast({
        mostrar: true,
        mensaje: `Categoria "${nuevaCategoria.nombre_categoria}" registrada exitosamente.`,
        tipo: "exito",
      });

      // Limpiar formulario y cerrar modal
      await cargarCategorias(); // Recargar categorías para mostrar la nueva
      setNuevaCategoria({ nombre_categoria: "", descripcion_categoria: "" });
      setMostrarModal(false);

    } catch (err) {
      console.error("Excepción al agregar categoría:", err.message);
      setToast({
        mostrar: true,
        mensaje: "Error inesperado al registrar categoría.",
        tipo: "error",
      });
    }
  };

  return (
    <Container className="mt-3">

      {/* Título y botón Nueva Categoría */}
      <Row className="align-items-center mb-3">
        <Col xs={9} sm={7} md={7} lg={7} className="d-flex align-items-center">
          <h3 className="mb-0">
            <i className="bi-bookmark-plus-fill me-2"></i> Categorías
          </h3>
        </Col>
        <Col xs={3} sm={5} md={5} lg={5} className="text-end">
          <Button
            onClick={() => setMostrarModal(true)}
            size="md"
          >
            <i className="bi-plus-lg"></i>
            <span className="d-none d-sm-inline ms-2">Nueva Categoría</span>
          </Button>
        </Col>
      </Row>

      <hr />

      {/* Modal de Registro */}
      <ModalRegistroCategoria
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevaCategoria={nuevaCategoria}
        manejoCambioInput={manejoCambioInput}
        agregarCategoria={agregarCategoria}
      />

      {/* Modal de edición de categoría */}
      <ModalEdicionCategoria
        mostrarModalEdicion={mostrarModalEdicion}
        SetMostrarModalEdicion={setMostrarModalEdicion}
        categoriaEditar={categoriaEditar}
        manejoCambioInputEdicion={manejoCambioInputEdicion}
        actualizarCategoria={actualizarCategoria}
      />

      {/* Tabla */}
      {!cargando && categorias.length > 0 && (
        <Row>
          <Col lg={12}>
            <TablaCategorias
              categorias={categorias}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={() => alert("Modal Eliminación - Pendiente crear")}
            />
          </Col>
        </Row>
      )}

      {/* Sin registros */}
      {!cargando && categorias.length === 0 && (
        <Row className="text-center my-5">
          <Col>
            <p className="text-muted fs-5">No hay categorías registradas todavía.</p>
          </Col>
        </Row>
      )}

      {/* Notificación */}
      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false })}
      />
    </Container>
  );
};
export default Categorias;