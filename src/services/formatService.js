/**
 * Servicio encargado de centralizar el formateo de datos y estructuras de texto
 * para su presentación o uso en el sistema (ej. copiado al portapapeles).
 */
export const formatService = {
    /**
     * Genera el texto estructurado de una categoría para el portapapeles.
     * @param {Object} categoria - Objeto con los datos de la categoría.
     * @returns {string} Texto formateado.
     */
    categoriaParaPortapapeles: (categoria) => {
        if (!categoria) return '';

        return `ID: ${categoria.id_categoria}
Categoría: ${categoria.nombre_categoria}
Descripción: ${categoria.descripcion_categoria || 'Sin descripción'}`;
    },

    /**
     * Genera la cadena de datos serializada que será embebida dentro de un código QR.
     * Mantiene un diseño compacto para optimizar la densidad y legibilidad del QR.
     * @param {Object} categoria - Objeto con los datos de la categoría.
     * @returns {string} JSON stringificado con la información esencial.
     */
    categoriaParaQR: (categoria) => {
        if (!categoria || !categoria.id_categoria) return '';

        // Creamos un objeto con lo estrictamente necesario para no saturar el QR
        const datosEsenciales = {
            id: categoria.id_categoria,
            nombre: categoria.nombre_categoria?.trim(),
            descripcion: categoria.descripcion?.trim(),
        };

        // Retornamos en formato JSON para facilitar su posterior lectura e interpretación lógica
        return JSON.stringify(datosEsenciales);
    }
};