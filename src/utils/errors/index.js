/**
 * @fileoverview Punto de entrada único (Módulo Barril) para la gestión centralizada de errores.
 * Exporta las utilidades necesarias para interceptar, traducir y manejar errores de la base de datos.
 */

export { DatabaseError } from './DatabaseError.js';
export { handleSupabaseError } from './errorManager.js';