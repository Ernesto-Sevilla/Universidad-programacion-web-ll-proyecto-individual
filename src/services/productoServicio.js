import { supabase } from "../database/supabaseconfig";

export const productoServicio = {

  /**
     * Obtiene la lista completa de productos ordenados de forma descendente.
     * Realiza un join con la tabla de categorías para incluir el nombre comercial de la categoría.
     * * @async
     * @throws {Error} Si ocurre un problema en la consulta con Supabase.
     * @returns {Promise<Array<Object>>} Una promesa que resuelve a un arreglo de objetos de productos.
    */
  async obtenerTodos() {
    const { data, error } = await supabase
      .from("productos")
      .select(`
        *,
        categorias (
          nombre_categoria
        )
      `)
      .order("id_producto", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
     * Sube un archivo de imagen al bucket de almacenamiento (Storage) de Supabase.
     * Genera un nombre único basado en la marca de tiempo actual para evitar colisiones.
     * * @async
     * @param {File} archivo - El objeto de archivo (imagen) seleccionado desde el cliente.
     * @throws {Error} Si la subida del archivo al Storage falla.
     * @returns {Promise<string|null>} La URL pública de la imagen subida, o null si no se proporcionó un archivo.
     */
  async subirImagen(archivo) {
    if (!archivo) return null;

    const nombreArchivo = `${Date.now()}_${archivo.name}`;

    const { error: uploadError } = await supabase.storage
      .from("imagenes_productos")
      .upload(nombreArchivo, archivo);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("imagenes_productos")
      .getPublicUrl(nombreArchivo);

    return data.publicUrl;
  },

  /**
     * Elimina un archivo de imagen del Storage de Supabase a partir de su URL pública.
     * Extrae dinámicamente el nombre del archivo para ejecutar la remoción.
     * * @async
     * @param {string} url - La URL pública completa de la imagen que se desea eliminar.
     * @returns {Promise<void>} No retorna ningún valor de datos.
     */
  async eliminarImagen(url) {
    if (!url) return;

    const urlPartes = url.split("/");
    const nombreArchivo = urlPartes[urlPartes.length - 1];

    const { error } = await supabase.storage
      .from("imagenes_productos")
      .remove([nombreArchivo]);

    if (error) {
      console.warn("No se pudo borrar la imagen del Storage, tal vez no existía:", error.message);
    }
  },

  /**
   * Crea un nuevo registro de producto en la base de datos.
   * @async
   * @param {Object} producto - Objeto con los datos del formulario de registro.
   * @param {string} producto.nombre - Nombre comercial del producto.
   * @param {string} [producto.descripcion_producto] - Descripción opcional.
   * @param {number|string} producto.categoria_producto - ID de la categoría asociada.
   * @param {number|string} producto.precio_venta - Precio en formato numérico o string.
   * @param {number|string} producto.stock - Almacenamiento disponible
   * @param {string} urlImagen - La URL pública de la imagen previamente subida al Storage.
   * @throws {Error} Si la inserción en la tabla "productos" falla.
   * @returns {Promise<void>} No retorna datos.
   */
  async crear(producto, urlImagen) {
    const { error } = await supabase.from("productos").insert([
      {
        nombre: producto.nombre,
        descripcion_producto: producto.descripcion_producto || null,
        categoria_producto: producto.categoria_producto,
        precio_venta: parseFloat(producto.precio_venta),
        stock: producto.stock,
        imagen_url: urlImagen,
      },
    ]);

    if (error) throw error;
  },

  /**
   * Actualiza los datos de un producto existente en la base de datos filtrando por su ID.
   * @async
   * @param {number|string} idProducto - El identificador único del producto a modificar.
   * @param {Object} datosActualizados - Objeto con los campos limpios listos para impactar la DB.
   * @throws {Error} Si el query de actualización en Supabase falla.
   * @returns {Promise<void>} No retorna datos.
   */
  async actualizar(idProducto, datosActualizados) {
    const { error } = await supabase
      .from("productos")
      .update(datosActualizados)
      .eq("id_producto", idProducto);

    if (error) throw error;
  },

  /**
   * Elimina físicamente un registro de producto de la base de datos.
   * Nota: Recuerda ejecutar primero la limpieza de su imagen en el Storage antes de borrar el registro.
   * @async
   * @param {number|string} idProducto - El identificador único del producto a eliminar.
   * @throws {Error} Si el query de eliminación en Supabase falla.
   * @returns {Promise<void>} No retorna datos.
   */
  async eliminar(idProducto) {
    const { error } = await supabase
      .from("productos")
      .delete()
      .eq("id_producto", idProducto);

    if (error) throw error;
  }
};