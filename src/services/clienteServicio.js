import { supabase } from "../database/supabaseconfig";

/**
 * @typedef {Object} Cliente
 * @property {number} [id_cliente] - Identificador único autogenerado del cliente.
 * @property {string} nombre - Nombre(s) del cliente.
 * @property {string} apellido - Apellido(s) del cliente.
 * @property {string} [celular] - Número telefónico o celular de contacto.
 * @property {string} email - Correo electrónico único del cliente.
 * @property {string} [fecha_registro] - Fecha y hora de registro (ISO String).
 */

/**
 * Servicio de persistencia puro encapsulado para la gestión de la tabla "clientes" en Supabase.
 * No contiene lógica de presentación ni estados de UI.
 */
export const clienteServicio = {
  /**
   * Obtiene todos los clientes de la base de datos ordenados cronológicamente de forma descendente.
   * @returns {Promise<Cliente[]>} Array con los objetos de clientes obtenidos.
   * @throws {Error} Si Supabase retorna un error en la consulta.
   */
  async obtenerTodos() {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("id_cliente", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Inserta un nuevo cliente en la base de datos.
   * @param {Omit<Cliente, 'id_cliente'|'fecha_registro'>} nuevoCliente - Objeto con la información básica.
   * @returns {Promise<void>}
   * @throws {Error} Si ocurre una violación de restricciones (ej. email duplicado).
   */
  async crear(nuevoCliente) {
    const { error } = await supabase
      .from("clientes")
      .insert([
        {
          nombre: nuevoCliente.nombre.trim(),
          apellido: nuevoCliente.apellido.trim(),
          celular: nuevoCliente.celular ? nuevoCliente.celular.trim() : null,
          email: nuevoCliente.email.trim().toLowerCase(),
        },
      ]);

    if (error) throw error;
  },

  /**
   * Actualiza los datos de un cliente existente buscando por su clave primaria.
   * @param {Cliente} clienteEditar - Objeto del cliente completo modificado.
   * @returns {Promise<void>}
   * @throws {Error} Si falla la petición de actualización en Supabase.
   */
  async actualizar(clienteEditar) {
    const { error } = await supabase
      .from("clientes")
      .update({
        nombre: clienteEditar.nombre.trim(),
        apellido: clienteEditar.apellido.trim(),
        celular: clienteEditar.celular ? clienteEditar.celular.trim() : null,
        email: clienteEditar.email.trim().toLowerCase(),
      })
      .eq("id_cliente", clienteEditar.id_cliente);

    if (error) throw error;
  },

  /**
   * Elimina permanentemente un cliente mediante su identificador único.
   * @param {number|string} id_cliente - Clave primaria del cliente a remover.
   * @returns {Promise<void>}
   * @throws {Error} Si el registro posee restricciones de llave foránea activas o falla la red.
   */
  async eliminar(id_cliente) {
    const { error } = await supabase
      .from("clientes")
      .delete()
      .eq("id_cliente", id_cliente);

    if (error) throw error;
  },
};
