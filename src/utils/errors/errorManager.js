import { SUPABASE_ERRORS, DEFAULT_ERROR } from './supabaseErrorCode.js';
import { DatabaseError } from './DatabaseError.js';

/**
 * Evalúa, filtra y traduce un error crudo proveniente de Supabase.
 * Transforma el código de error en una instancia estructurada de `DatabaseError`.
 * * @param {Object|null|undefined} error - El objeto de error crudo capturado de la respuesta de Supabase.
 * @param {string} [error.code] - El código de error de la base de datos.
 * @returns {DatabaseError|null} Una nueva instancia de `DatabaseError` con la información formateada, 
 * o `null` si el parámetro inicial era inválido o inexistente.
 */
export function handleSupabaseError(error) {
  if (!error) return null;

  // Buscamos el código en nuestro diccionario
  const errorInfo = SUPABASE_ERRORS[error.code] || DEFAULT_ERROR;

  // Retornamos nuestra instancia personalizada con toda la información
  return new DatabaseError(errorInfo, error);
}