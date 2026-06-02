import { GoogleGenerativeAI } from '@google/generative-ai';

// Inicializamos la SDK de Google con la clave segura cargada desde las variables de entorno de Vite
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);

// Contexto relacional estricto del esquema de la base de datos de SmartVentas
const CONTEXTO_DB = `
  Sistema de ventas. 
  Tablas disponibles:
  - categorias (id_categoria, nombre_categoria, descripcion_categoria)
  - clientes (id_cliente, nombre, apellido, celular, email, fecha_registro)
  - productos (id_producto, nombre_producto, descripcion_producto, categoria_producto, precio_venta, imagen_url)
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
  // 1. Forzamos al modelo a responder ÚNICAMENTE en formato JSON estructural
  const modelo = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json"
    }
  });

  const prompt = `
    Eres un experto en PostgreSQL y analista de datos. Genera una consulta SQL válida basada en el esquema proporcionado.
    ${CONTEXTO_DB}

    Reglas estrictas de la estructura de retorno:
    - Comprende el lenguaje natural del usuario y corrige errores de redacción o gramática.
    - Solo devuelve consultas SELECT utilizando la sintaxis de PostgreSQL.
    - NO utilices punto y coma (;) al final de la sentencia SQL.
    - Usa alias claros y explícitos cuando realices operaciones de JOIN.
    - Debes construir obligatoriamente el siguiente esquema JSON exacto:

    {
      "explicacion": "Una descripción breve, natural y cortés de lo que calcula la consulta.",
      "consulta_sql": "SELECT ...",
      "columnas": ["columna1", "columna2"]
    }

    Consulta solicitada por el usuario: "${consultaUsuario}"
  `;

  // 2. Para ver exactamente qué está respondiendo Google en caso de fallas, añadimos un log preventivo
  try {
    const resultado = await modelo.generateContent(prompt);
    const textoRespuesta = resultado.response.text().trim();
    
    // Convertimos directamente el texto a objeto, ya que 'application/json' garantiza que venga limpio
    const objetoParseado = JSON.parse(textoRespuesta);

    return {
      explicacion: objetoParseado.explicacion,
      consulta_sql: objetoParseado.consulta_sql,
      columnas: objetoParseado.columnas
    };

  } catch (errorInterno) {
    console.error("Error crítico de parseo o respuesta de la API de Gemini:", errorInterno);
    throw new Error("La IA no pudo estructurar la respuesta en el formato esperado.");
  }
};