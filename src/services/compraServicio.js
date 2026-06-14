import { supabase } from "../database/supabaseconfig";
import { handleSupabaseError } from "@/utils/errors";

/**
 * @typedef {Object} DetalleCompra
 * @property {number} [id_detalle_compra] - ID único del detalle autogenerado.
 * @property {number} id_compra - ID de la compra asociada.
 * @property {number} id_producto - ID del producto adquirido.
 * @property {number} cantidad - Cantidad comprada.
 * @property {number} precio_costo - Precio de costo unitario al momento de la compra.
 * @property {number} subtotal - Subtotal de la línea (cantidad * precio_compra).
 */

/**
 * @typedef {Object} Compra
 * @property {number} [id_compra] - Identificador único autogenerado.
 * @property {string} proveedor - Nombre o Razón Social del proveedor.
 * @property {number} id_empleado - ID del empleado que registra la compra.
 * @property {string} fecha_compra - Fecha y hora del registro de la transacción.
 * @property {string} metodo_pago - Método de pago ('efectivo', 'transferencia', etc).
 * @property {number} total - Monto total acumulado de la compra.
 */

export const compraServicio = {
  /**
   * Obtiene todas las compras incluyendo el desglose de sus respectivos artículos y detalles
   * @returns {Promise<Array>} Lista de compras formateadas con subtablas mapeadas
   */
  async obtenerTodas() {
    const { data, error } = await supabase
      .from("compras")
      .select(`
        id_compra,
        proveedor,
        id_empleado,
        fecha_compra,
        metodo_pago,
        total,
        empleados (
          nombre_empleado,
          apellido_empleado
        ),
        detalles_compras (
          id_detalle_compra,
          id_producto,
          cantidad,
          precio_costo,
          subtotal,
          productos (
            nombre,
            precio_compra,
            stock
          )
        )
      `)
      .order("id_compra", { ascending: false });

    if (error) {
      const dbError = handleSupabaseError(error);
      console.error(`[compraServicio][obtenerTodas] ❌:`, dbError.devMessage);
      throw dbError;
    }
    return data || [];
  },

  /**
   * Registra una nueva transacción de compra en el sistema
   * @param {Compra} nuevaCompra - Objeto con los datos maestros de la compra
   */
  async crear(nuevaCompra) {
    const { error } = await supabase
      .from("compras")
      .insert([
        {
          proveedor: nuevaCompra.proveedor ? nuevaCompra.proveedor.trim() : "Proveedor General",
          id_empleado: nuevaCompra.id_empleado,
          metodo_pago: nuevaCompra.metodo_pago ? nuevaCompra.metodo_pago.trim() : "efectivo",
          total: Number(nuevaCompra.total),
        },
      ]);

    if (error) {
      const dbError = handleSupabaseError(error);
      console.error(`[compraServicio][crear] ❌ Falló el registro:`, dbError.devMessage, { dataInput: nuevaCompra });
      throw dbError;
    }
  },

  /**
   * Actualiza los datos de la cabecera de una compra existente
   * @param {Compra} compraEditar - Objeto con los datos modificados de la compra
   */
  async actualizar(compraEditar) {
    const { error } = await supabase
      .from("compras")
      .update({
        proveedor: compraEditar.proveedor ? compraEditar.proveedor.trim() : "Proveedor General",
        id_empleado: compraEditar.id_empleado,
        metodo_pago: compraEditar.metodo_pago ? compraEditar.metodo_pago.trim() : "efectivo",
        total: Number(compraEditar.total),
      })
      .eq("id_compra", compraEditar.id_compra);

    if (error) {
      const dbError = handleSupabaseError(error);
      console.error(`[compraServicio][actualizar] ❌ Error en ID ${compraEditar.id_compra}:`, dbError.devMessage);
      throw dbError;
    }
  },

  /**
   * Elimina un registro de compra por su identificador primario (Dispara ON DELETE CASCADE en los detalles)
   * @param {number} id_compra - Identificador único de la compra
   */
  async eliminar(id_compra) {
    const { error } = await supabase
      .from("compras")
      .delete()
      .eq("id_compra", id_compra);

    if (error) {
      const dbError = handleSupabaseError(error);
      console.error(`[compraServicio][eliminar] ❌ No se pudo borrar el ID ${id_compra}:`, dbError.devMessage);
      throw dbError;
    }
  },

  /**
   * Obtiene la lista completa de productos para la sección de abastecimiento.
   * Incluye un mecanismo de respaldo (fallback) idéntico al de ventas para asegurar continuidad del desarrollo.
   * @returns {Promise<Array>} Lista de productos disponibles para comprar.
   */
  async obtenerProductosParaCompra() {
    const { data, error } = await supabase
      .from("productos")
      .select("id_producto, nombre, precio_compra, stock")
      .order("nombre", { ascending: true });

    if (error) {
      const dbError = handleSupabaseError(error);
      console.warn(`⚠️ [compraServicio][obtenerProductosParaCompra]: ${dbError.devMessage}. Usando fallback local.`);

      return [
        { id_producto: 1, nombre: "Producto Demo A (Abastecimiento)", precio_compra: 15.50, stock: 100 },
        { id_producto: 2, nombre: "Producto Demo B (Abastecimiento)", precio_compra: 45.00, stock: 50 },
        { id_producto: 3, nombre: "Producto Demo C (Abastecimiento)", precio_compra: 120.00, stock: 25 }
      ];
    }

    return data || [];
  },

  /**
   * Incrementa de forma masiva el stock en el inventario al procesar los artículos comprados.
   * @param {Array<DetalleCompra>} detalles - Arreglo de líneas de detalles con los artículos adquiridos
   */
  async incrementarInventario(detalles) {
    try {
      // Mapeamos los detalles para disparar la función RPC inversa de incremento de stock
      const promesas = detalles.map(d =>
        supabase.rpc('procesar_incremento_stock', {
          p_producto_id: d.id_producto,
          p_cantidad: d.cantidad
        })
      );

      const resultados = await Promise.all(promesas);

      // Verificación defensiva de errores internos en el lote
      for (const res of resultados) {
        if (res.error) throw res.error;
      }
    } catch (error) {
      const dbError = handleSupabaseError(error);
      console.error(`[compraServicio][incrementarInventario] ❌:`, dbError.devMessage);
      throw dbError;
    }
  }
};