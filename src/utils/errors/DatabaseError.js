/**
 * Clase personalizada para representar errores específicos de la base de datos (Supabase/PostgreSQL).
 * Extiende la clase nativa `Error` para mantener compatibilidad con bloques try/catch,
 * pero añade metadatos críticos para depuración y manejo de estados HTTP.
 * * @extends Error
 */
export class DatabaseError extends Error {
  /**
   * Crea una instancia de DatabaseError.
   * * @param {import('./supabaseErrorCode.js').ErrorInfo} info - Objeto con las traducciones y estado HTTP (proveniente del diccionario).
   * @param {Object|null} [originalError=null] - El objeto de error crudo original que arrojó el cliente de Supabase.
   * @param {string} [originalError.code] - Código de error de la base de datos (ej. '23505').
   * @param {string} [originalError.details] - Detalles técnicos específicos de PostgreSQL.
   */
  constructor(info, originalError = null) {
    // Invoca al constructor de Error pasándole el mensaje para el usuario
    super(info.message);
    
    /** @type {string} Nombre identificador del tipo de error */
    this.name = 'DatabaseError';
    
    /** @type {number} Código de estado HTTP (ej. 409, 404) */
    this.status = info.status;
    
    /** @type {string} Mensaje técnico detallado para el equipo de desarrollo */
    this.devMessage = info.devMessage;
    
    /** @type {string} Código de error original de Supabase o 'UNKNOWN' si no existe */
    this.code = originalError?.code || 'UNKNOWN';
    
    /** @type {string|null} Detalles específicos de la fila o restricción rota provistos por PostgreSQL */
    this.details = originalError?.details || null;
    
    /** @type {string} Estampa de tiempo en formato ISO que indica cuándo ocurrió el fallo */
    this.timestamp = new Date().toISOString();
  }
}