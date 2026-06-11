import { supabase } from "../database/supabaseconfig";
import { handleSupabaseError } from "@/utils/errors";

/**
 * @typedef {Object} DetalleVenta
 * @property {number} [id_detalle] - ID único del detalle autogenerado.
 * @property {number} id_venta - ID de la venta asociada.
 * @property {number} id_producto - ID del producto vendido.
 * @property {number} cantidad - Cantidad vendida.
 * @property {number} precio_unitario - Precio al momento de la venta.
 * @property {number} subtotal - Subtotal (cantidad * precio_unitario).
 */

/**
 * @typedef {Object} Venta
 * @property {number} [id_venta] - Identificador único autogenerado.
 * @property {number} id_cliente - ID del cliente asociado.
 * @property {number} id_empleado - ID del empleado que realiza la venta.
 * @property {string} fecha_venta - Fecha y hora de la transacción.
 * @property {string} metodo_pago - Método de pago utilizado ('efectivo', etc).
 * @property {number} total - Monto total de la venta.
 */

export const ventaServicio = {
  /**
   * Obtiene todas las ventas incluyendo clientes y sus respectivos detalles de artículos
   * @returns {Promise<Array>} Lista de ventas formateadas con subtablas
   */
  async obtenerTodas() {
    const { data, error } = await supabase
      .from("ventas")
      .select(`
        id_venta,
        id_cliente,
        id_empleado,
        fecha_venta,
        metodo_pago,
        total,
        estado,
        clientes (
          nombre,
          apellido,
          celular
        ),
        detalles_ventas (
          id_detalle,
          id_producto,
          cantidad,
          precio_unitario,
          subtotal,
          productos (
            nombre
          )
        )
      `)
      .order("id_venta", { ascending: false });

    if (error) {
      const dbError = handleSupabaseError(error);
      console.error(`[ventaServicio][obtenerTodas] ❌:`, dbError.devMessage);
      throw dbError;
    }
    return data || [];
  },

  /**
   * Registra una nueva venta en el sistema
   * @param {Venta} nuevaVenta - Objeto con los datos de la venta a registrar
   */
  async crear(nuevaVenta) {
    const { error } = await supabase
      .from("ventas")
      .insert([
        {
          id_cliente: nuevaVenta.id_cliente,
          id_empleado: nuevaVenta.id_empleado,
          metodo_pago: nuevaVenta.metodo_pago ? nuevaVenta.metodo_pago.trim() : "efectivo",
          total: Number(nuevaVenta.total),
        },
      ]);

    if (error) {
      const dbError = handleSupabaseError(error);
      console.error(`[ventaServicio][crear] ❌ Falló el registro:`, dbError.devMessage, { dataInput: nuevaVenta });
      throw dbError;
    }
  },

  /**
   * Actualiza los datos generales de una venta existente
   * @param {Venta} ventaEditar - Objeto con los datos modificados de la venta
   */
  async actualizar(ventaEditar) {
    const { error } = await supabase
      .from("ventas")
      .update({
        id_cliente: ventaEditar.id_cliente,
        id_empleado: ventaEditar.id_empleado,
        metodo_pago: ventaEditar.metodo_pago ? ventaEditar.metodo_pago.trim() : "efectivo",
        total: Number(ventaEditar.total),
      })
      .eq("id_venta", ventaEditar.id_venta);

    if (error) {
      const dbError = handleSupabaseError(error);
      console.error(`[ventaServicio][actualizar] ❌ Error en ID ${ventaEditar.id_venta}:`, dbError.devMessage);
      throw dbError;
    }
  },

  /**
   * Elimina un registro de venta por su identificador primario
   * @param {number} id_venta - Identificador de la venta
   */
  async eliminar(id_venta) {
    const { error } = await supabase
      .from("ventas")
      .delete()
      .eq("id_venta", id_venta);

    if (error) {
      const dbError = handleSupabaseError(error);
      console.error(`[ventaServicio][eliminar] ❌ No se pudo borrar el ID ${id_venta}:`, dbError.devMessage);
      throw dbError;
    }
  },

  /**
   * TEMPORAL: Obtiene la lista de productos para desbloquear el desarrollo de Ventas

   * Obtiene la lista completa de productos disponibles para la venta.
   * Cuenta con un mecanismo de respaldo (fallback) que devuelve datos simulados
   * en caso de que ocurra un error de conexión o de estructura en la base de datos.
   * @returns {Promise<Array<{id_producto: number, nombre: string, precio_venta: number, stock: number}>>} Lista de productos.
   */
  async obtenerProductosParaVenta() {
    const { data, error } = await supabase
      .from("productos")
      .select("id_producto, nombre, precio_venta, stock")
      .order("nombre", { ascending: true });

    if (error) {
      const dbError = handleSupabaseError(error);
      console.warn(`⚠️ [ventaServicio][obtenerProductosParaVenta]: ${dbError.devMessage}. Usando fallback local.`);

      // Datos de prueba locales para no bloquear el desarrollo del flujo de caja
      return [
        { id_producto: 1, nombre: "Producto Demo A", precio_venta: 15.50, stock: 100 },
        { id_producto: 2, nombre: "Producto Demo B", precio_venta: 45.00, stock: 50 },
        { id_producto: 3, nombre: "Producto Demo C", precio_venta: 120.00, stock: 12 }
      ];
    }

    return data || [];
  },

  /**
   * Actualiza EXCLUSIVAMENTE el estado del flujo de una venta (Abierta / Cerrada)
   * @param {number} id_venta - Identificador único de la venta
   * @param {'Abierta'|'Cerrada'} nuevoEstado - El estado al que se desea cambiar
   */
  async cambiarEstado(id_venta, nuevoEstado) {
    const { error } = await supabase
      .from("ventas")
      .update({ estado: nuevoEstado })
      .eq("id_venta", id_venta);

    if (error) {
      const dbError = handleSupabaseError(error);
      console.error(`[ventaServicio][cambiarEstado] ❌ No se pudo cambiar el estado a ${nuevoEstado} en la venta ID ${id_venta}:`, dbError.devMessage);
      throw dbError;
    }
  },
  async descontarInventario(detalles) {
    try {
      const promesas = detalles.map(d =>
        supabase.rpc('procesar_descuento_stock', {
          p_id_producto: d.id_producto,
          p_cantidad: d.cantidad
        })
      );

      const resultados = await Promise.all(promesas);

      // Verificar si alguna petición falló
      for (const res of resultados) {
        if (res.error) throw res.error;
      }
    } catch (error) {
      const dbError = handleSupabaseError(error);
      console.error(`[ventaServicio][descontarInventario] ❌:`, dbError.devMessage);
      throw dbError;
    }
  }
};