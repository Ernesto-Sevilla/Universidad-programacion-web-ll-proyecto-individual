import { GoogleGenerativeAI } from '@google/generative-ai';

// Inicializamos la SDK de Google con la clave segura cargada desde las variables de entorno de Vite
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Contexto relacional estricto del esquema de la base de datos de SmartVentas
const CONTEXTO_DB = `
  Sistema de ventas. 
  Tablas disponibles:
  - categorias (id_categoria, nombre_categoria, descripcion_categoria)
  - clientes (id_cliente, nombre_cliente, apellido_cliente, celular)
  - productos (id_producto, nombre_producto, descripcion_producto, categoria_producto, precio_venta, url_imagen)
  - ventas (id_venta, id_cliente, id_empleado, fecha_venta, metodo_pago, total)
  - detalles_ventas (id_detalle, id_venta, id_producto, cantidad, precio_unitario, subtotal)
  - empleados (id_empleado, nombre_empleado, apellido_empleado, email, celular, tipo_empleado)
`;

/**
 * Traduce una consulta en lenguaje natural del usuario en una estructura JSON estructurada
 * que contiene una consulta SQL válida para PostgreSQL mediante el modelo gemini-2.5-flash.
 * * @async
 * @function generarConsultaSQL
 * @param {string} consultaUsuario - Texto de consulta ingresado por el usuario.
 * @returns {Promise<{explicacion: string, consulta_sql: string, columnas: string[]}>} Estructura parseada de la IA.
 */
export const generarConsultaSQL = async (consultaUsuario) => {
  const modelo = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    Eres un experto en PostgreSQL. Genera una consulta SQL válida.
    ${CONTEXTO_DB}

    Reglas estrictas:
    - Comprende el lenguaje natural del usuario y corrige errores de redacción o gramática.
    - Solo devuelve consultas SELECT.
    - NO uses punto y coma (;) al final.
    - NO uses markdown, ni sql, ni explicaciones fuera del JSON.
    - Usa alias claros cuando hagas JOIN.
    - Devuelve SOLO el siguiente JSON, nada más:

    {
      "explicacion": "Explicación breve y clara",
      "consulta_sql": "SELECT ...",
      "columnas": ["columna1", "columna2"]
    }

    Consulta del usuario: "${consultaUsuario}"
  `;

  const resultado = await modelo.generateContent(prompt);
  let texto = resultado.response.text().trim();
};