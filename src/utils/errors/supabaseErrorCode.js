/**
 * @typedef {Object} ErrorInfo
 * @property {string} message - Mensaje amigable y seguro para mostrarle al usuario en la interfaz.
 * @property {string} devMessage - Explicación técnica detallada para el desarrollador/equipo.
 * @property {number} status - Código de estado HTTP correspondiente al error (ej. 400, 404, 409, 500).
 */

/**
 * Diccionario de errores conocidos de PostgREST y PostgreSQL para Supabase.
 * Mapea códigos de error crípticos a mensajes legibles y estructuras ordenadas.
 * * @type {Object<string, ErrorInfo>}
 */
export const SUPABASE_ERRORS = {
  '23505': {
    message: 'El registro ya existe (Llave duplicada).',
    devMessage: 'Violación de restricción única (Unique constraint). Revisa si el campo único ya existe en la base de datos.',
    status: 409
  },
  '23503': {
    message: 'No se puede realizar la acción porque este registro está relacionado con otro.',
    devMessage: 'Violación de llave foránea (Foreign key constraint). El ID proveído no existe en la tabla relacional.',
    status: 400
  },
  '42P01': {
    message: 'Error interno del sistema al acceder a los datos.',
    devMessage: 'La tabla especificada no existe en la base de datos. Revisa si escribiste bien el nombre o si corriste las migraciones.',
    status: 500
  },
  'PGRST116': {
    message: 'No se encontró el registro solicitado.',
    devMessage: 'La consulta esperaba exactamente 1 fila (.single()) pero recibió 0 filas.',
    status: 404
  },
  '42703': {
    message: 'Error interno en la estructura de la consulta.',
    devMessage: 'Una o más columnas especificadas en el .select() o .order() no existen en la tabla. Revisa si hay errores de dedo (typos).',
    status: 400
  }
};

/**
 * Estructura de error por defecto utilizada cuando Supabase devuelve un código
 * que no se encuentra registrado en el diccionario global.
 * * @type {ErrorInfo}
 */
export const DEFAULT_ERROR = {
  message: 'Ocurrió un error inesperado en la base de datos.',
  devMessage: 'Error no mapeado en el diccionario de Supabase.',
  status: 500
};