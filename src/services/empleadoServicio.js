import { supabase } from "../database/supabaseconfig";

/**
 * @typedef {Object} NuevoEmpleado
 * @property {string} nombre_empleado
 * @property {string} apellido_empleado
 * @property {string} email
 * @property {string} password
 * @property {string} celular
 * @property {string} pin
 * @property {string} tipo_empleado
 */

/**
 * @typedef {Object} EmpleadoEditar
 * @property {string|number} id_empleado
 * @property {string} nombre_empleado
 * @property {string} apellido_empleado
 * @property {string} celular
 * @property {string} pin
 * @property {string} tipo_empleado
 */

/**
 * Servicio encargado de la persistencia pura de los datos de la entidad Empleados.
 */
const empleadoServicio = {
  /**
   * Obtiene la lista completa de empleados ordenada por ID de forma ascendente.
   * @returns {Promise<Array<Object>>} Lista de empleados.
   * @throws {Error} Si ocurre un error en la consulta a Supabase.
   */
  async obtenerTodos() {
    const { data, error } = await supabase
      .from("empleados")
      .select("*")
      .order("id_empleado", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Registra un nuevo empleado creando sus credenciales en Supabase Auth
   * y posteriormente insertando sus datos en la tabla pública de "empleados".
   * @param {NuevoEmpleado} datosEmpleado - Datos del empleado a registrar.
   * @returns {Promise<void>}
   * @throws {Error} Si falla el registro en Auth o la inserción en la base de datos.
   */
  async crear(datosEmpleado) {
    // 1. Registro en Supabase Auth
    const { error: authError } = await supabase.auth.signUp({
      email: datosEmpleado.email,
      password: datosEmpleado.password,
      options: {
        data: {
          nombre: datosEmpleado.nombre_empleado,
          apellido: datosEmpleado.apellido_empleado,
        },
      },
    });

    if (authError) throw authError;

    // 2. Inserción en la tabla de la base de datos
    const { error: dbError } = await supabase.from("empleados").insert([
      {
        nombre_empleado: datosEmpleado.nombre_empleado,
        apellido_empleado: datosEmpleado.apellido_empleado,
        celular: datosEmpleado.celular,
        pin: datosEmpleado.pin,
        email: datosEmpleado.email,
        tipo_empleado: datosEmpleado.tipo_empleado,
      },
    ]);

    if (dbError) throw dbError;
  },

  /**
   * Actualiza los datos de un empleado existente mediante su identificador único.
   * @param {EmpleadoEditar} datosEmpleado - Datos actualizados del empleado.
   * @returns {Promise<void>}
   * @throws {Error} Si la actualización en Supabase falla.
   */
  async actualizar(datosEmpleado) {
    const { error } = await supabase
      .from("empleados")
      .update({
        nombre_empleado: datosEmpleado.nombre_empleado,
        apellido_empleado: datosEmpleado.apellido_empleado,
        celular: datosEmpleado.celular,
        pin: datosEmpleado.pin,
        tipo_empleado: datosEmpleado.tipo_empleado,
      })
      .eq("id_empleado", datosEmpleado.id_empleado);

    if (error) throw error;
  },
};

export default empleadoServicio;