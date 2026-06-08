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
};