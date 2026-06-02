import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Table } from 'react-bootstrap';
import { supabase } from '../../database/supabaseconfig'; // Mantenemos la ruta de tu config de base de datos
import { generarConsultaSQL } from '@/services'; // <-- Inyección limpia por Alias

/**
 * Componente Modal ChatIA.
 * Ofrece una interfaz de chat inteligente que ejecuta consultas SQL automáticas
 * en base a peticiones de lenguaje natural.
 * * @component
 */
const ChatIA = ({ mostrar, onCerrar }) => {
  const [mensajes, setMensajes] = useState([]);
  const [entrada, setEntrada] = useState('');
  const [cargando, setCargando] = useState(false);
  const finChatRef = useRef(null);

  /**
   * Procesa la entrada del usuario, interactúa con el servicio de Gemini y
   * ejecuta el query resultante de forma segura en la función RPC de Supabase.
   */
  const enviarConsulta = async () => {
    if (!entrada.trim()) return;

    const mensajeUsuario = { tipo: 'usuario', contenido: entrada };
    setMensajes(prev => [...prev, mensajeUsuario]);
    
    const consultaActual = entrada;
    setEntrada('');
    setCargando(true);

    try {
      // 1. Llamar al servicio aislado para obtener la estructura SQL desde la IA
      const respuestaIA = await generarConsultaSQL(consultaActual);

      let sqlLimpio = respuestaIA.consulta_sql.trim();

      // Limpieza preventiva de caracteres de ruptura SQL comunes
      sqlLimpio = sqlLimpio.replace(/;\s*$/, '');
      sqlLimpio = sqlLimpio.replace(/\)\s*\)/g, ')');
      sqlLimpio = sqlLimpio.replace(/,\s*\)/g, ')');

      // 2. Ejecutar la función RPC segura en el motor PostgreSQL de Supabase
      const { data, error } = await supabase.rpc('ejecutar_consulta_segura', {
        query_sql: sqlLimpio
      });

      if (error) {
        console.error("Error de ejecución en Supabase:", error);
        throw new Error(`Error en SQL: ${error.message}`);
      }

      const datosExtraidos = data ? data.map(item => item.datos) : [];

      const mensajeRespuesta = {
        tipo: 'ia',
        explicacion: respuestaIA.explicacion || "Consulta ejecutada correctamente",
        columnas: respuestaIA.columnas || (datosExtraidos.length > 0 ? Object.keys(datosExtraidos[0]) : []),
        datos: datosExtraidos
      };

      setMensajes(prev => [...prev, mensajeRespuesta]);

    } catch (error) {
      console.error("Error completo en flujo IA-SQL:", error);
      setMensajes(prev => [...prev, {
        tipo: 'ia',
        explicacion: "No entendí bien tu consulta o no tengo permisos para procesar esa información. Por favor, reformúlala de forma clara.",
        error: true
      }]);
    } finally {
      setCargando(false);
    }
  };

  // Auto-scroll del chat con cada mensaje nuevo
  useEffect(() => {
    finChatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  return (
    <Modal show={mostrar} onHide={onCerrar} size="xl" centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title><i className="bi bi-cpu-fill me-2 text-primary"></i>Consultas Inteligentes con Gemini</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ height: "68vh", overflowY: "auto" }}>
        <div className="d-flex flex-column h-100">
          
          {/* Zona de renderizado de mensajes */}
          <div className="flex-grow-1 overflow-auto mb-3 pe-2">
            {mensajes.length === 0 && (
              <div className="text-center text-muted mt-5">
                <h5>¿Qué información necesitas sobre SmartVentas?</h5>
                <p className="mt-2">Ejemplos de comandos admitidos:</p>
                <div className="d-inline-block text-start">
                  <ul>
                    <li>Ventas totales de este mes</li>
                    <li>Los 10 productos más vendidos</li>
                    <li>Clientes que más han comprado</li>
                    <li>Ventas por empleado</li>
                  </ul>
                </div>
              </div>
            )}

            {mensajes.map((msg, index) => (
              <div key={index} className={`mb-4 ${msg.tipo === 'usuario' ? 'text-end' : ''}`}>
                <div className={`d-inline-block p-3 rounded-3 ${msg.tipo === 'usuario' ? 'bg-primary text-white' : 'bg-light border'}`}
                  style={{ maxWidth: '90%' }}>
                  <strong>{msg.tipo === 'usuario' ? 'Tú:' : 'Asistente IA:'}</strong><br />
                  
                  <p className="mb-0">{msg.tipo === 'usuario' ? msg.contenido : msg.explicacion}</p>

                  {/* Renderizado dinámico de la tabla de datos si la consulta retorna filas */}
                  {msg.datos && msg.datos.length > 0 && (
                    <Table striped bordered hover size="sm" responsive className="mt-3 table-dark-profile">
                      <thead>
                        <tr>
                          {msg.columnas.map((col, i) => (
                            <th key={i} className="text-capitalize">{col.replace(/_/g, ' ')}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {msg.datos.map((fila, i) => (
                          <tr key={i}>
                            {msg.columnas.map((col, j) => (
                              <td key={j}>{fila[col] !== null ? String(fila[col]) : '-'}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </div>
              </div>
            ))}

            {cargando && (
              <div className="text-center py-3 text-muted">
                <Spinner animation="border" size="sm" className="me-2" /> Procesando consulta analítica con Gemini...
              </div>
            )}
            <div ref={finChatRef} />
          </div>

          {/* Formulario de entrada */}
          <Form onSubmit={(e) => { e.preventDefault(); enviarConsulta(); }}>
            <div className="d-flex gap-2">
              <Form.Control
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                placeholder="Escribe tu consulta en lenguaje natural (ej. 'cuánto se vendió en efectivo')..."
                disabled={cargando}
              />
              <Button variant="primary" type="submit" disabled={cargando || !entrada.trim()}>
                Enviar
              </Button>
            </div>
          </Form>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ChatIA;