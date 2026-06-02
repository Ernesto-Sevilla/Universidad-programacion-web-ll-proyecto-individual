/**
 * @fileoverview Punto de entrada único (Módulo Barril) del directorio actual.
 * Centraliza y re-exporta los servicios, hooks y componentes para simplificar
 * las rutas de importación en toda la aplicación utilizando alias.
 */

/** * Componente contenedor reutilizable (Card) para la interfaz gráfica.
 * @exports TarjetaBase 
 */
export { TarjetaBase } from './TarjetaBase.jsx'

/** * Hook de soporte para gestionar la selección, focos o estados de las tarjetas visuales.
 * @exports useSeleccionTarjeta 
 */
export { useSeleccionTarjeta } from './useSeleccionTarjeta.js'