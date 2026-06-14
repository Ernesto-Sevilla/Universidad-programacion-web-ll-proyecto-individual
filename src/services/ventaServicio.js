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
        empleados(
          nombre_empleado,
          apellido_empleado
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
      // 1. Sanitizar y extraer los identificadores de los productos a procesar
      const operaciones = detalles.map(d => {
        const id = Number(d.id_producto || d.producto_id);
        const cant = Number(d.cantidad);
        
        if (isNaN(id) || isNaN(cant)) {
          throw new Error(`Datos inválidos para operación de inventario. ID: ${id}, Cantidad: ${cant}`);
        }
        return { id, cant };
      });

      // 2. Procesar de forma secuencial o paralela la actualización directa en la tabla 'productos'
      // Nota: Usamos una consulta directa de actualización relativa basada en el stock actual
      const promesas = operaciones.map(async (op) => {
        
        // Primero obtenemos el stock actual del producto en la base de datos
        const { data: producto, error: errorLectura } = await supabase
          .from("productos")
          .select("stock")
          // Cambiar a "producto_id" si tu columna llave usa ese nombre exacto en Postgres
          .eq("id_producto", op.id) 
          .single();

        if (errorLectura) throw errorLectura;
        if (!producto) throw new Error(`El producto con ID ${op.id} no fue encontrado en la tabla productos.`);

        const nuevoStock = Number(producto.stock) - op.cant;

        if (nuevoStock < 0) {
          throw new Error(`Operación rechazada: Stock insuficiente para el ID ${op.id}. Stock actual: ${producto.stock}, Solicitado: ${op.cant}`);
        }

        // Ejecutamos la persistencia del nuevo stock de forma directa
        const { error: errorUpdate } = await supabase
          .from("productos")
          .update({ stock: nuevoStock })
          .eq("id_producto", op.id); // Ajustar el nombre de la columna llave aquí también si es necesario

        if (errorUpdate) throw errorUpdate;
      });

      // Ejecutar todas las actualizaciones en paralelo
      await Promise.all(promesas);

    } catch (error) {
      const dbError = handleSupabaseError(error);
      console.error(`[ventaServicio][descontarInventario] ❌ Falló la actualización directa:`, dbError.devMessage);
      throw dbError;
    }
  }
};