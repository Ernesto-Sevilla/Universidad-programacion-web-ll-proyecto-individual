import { supabase } from "../database/supabaseconfig";

/**
 * @typedef {Object} Categoria
 * @property {number|string} [id_categoria] - Identificador único de la categoría.
 * @property {string} nombre_categoria - Nombre descriptivo de la categoría.
 * @property {string} descripcion_categoria - Descripción detallada de la categoría.
 */

/**
 * Servicio encargado de la persistencia y comunicación directa con la tabla "categorias" en Supabase.
 */
export const categoriaServicio = {
  /**
   * Obtiene todas las categorías ordenadas por ID de forma ascendente.
   * @returns {Promise<Categoria[]>} Lista de categorías.
   * @throws {Error} Si ocurre un error en la consulta a la base de datos.
   */
  async obtenerTodas() {
    const { data, error } = await supabase
      .from("categorias")
      .select("*")
      .order("id_categoria", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Registra una nueva categoría en la base de datos.
   * @param {Omit<Categoria, 'id_categoria'>} nuevaCategoria - Datos de la categoría a insertar.
   * @returns {Promise<void>}
   * @throws {Error} Si falla la inserción en Supabase.
   */
  async crear(nuevaCategoria) {
    const { error } = await supabase
      .from("categorias")
      .insert([
        {
          nombre_categoria: nuevaCategoria.nombre_categoria,
          descripcion_categoria: nuevaCategoria.descripcion_categoria,
        },
      ]);

    if (error) throw error;
  },

  /**
   * Actualiza una categoría existente filtrando por su ID.
   * @param {Categoria} categoriaEditar - Objeto de la categoría con sus cambios y su ID.
   * @returns {Promise<void>}
   * @throws {Error} Si falla la actualización en Supabase.
   */
  async actualizar(categoriaEditar) {
    const { error } = await supabase
      .from("categorias")
      .update({
        nombre_categoria: categoriaEditar.nombre_categoria,
        descripcion_categoria: categoriaEditar.descripcion_categoria,
      })
      .eq("id_categoria", categoriaEditar.id_categoria);

    if (error) throw error;
  },

  /**
   * Elimina una categoría de la base de datos por su ID.
   * @param {number|string} id_categoria - ID de la categoría a eliminar.
   * @returns {Promise<void>}
   * @throws {Error} Si falla la eliminación en Supabase.
   */
  async eliminar(id_categoria) {
    const { error } = await supabase
      .from("categorias")
      .delete()
      .eq("id_categoria", id_categoria);

    if (error) throw error;
  },
};