import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card, Spinner, Form } from "react-bootstrap";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// Importamos el servicio modular que acabamos de crear
import { 
  fetchVentasPorRango, 
  fetchDetallesDeVentas, 
  procesarEstadisticas,
  generarReporteExcel
} from "@/services";

/**
 * @constant {string[]} COLORES
 * Paleta de colores en formato Hexadecimal para las secciones de las gráficas (PieChart y LineChart).
 */
const COLORES = ["#5e26b2", "#39ff95", "#ff6bc6", "#8b46ff", "#00d4ff", "#ffd93d"];

/**
 * Componente Principal de la Pantalla de Inicio (Dashboard).
 * Muestra el resumen del negocio mediante métricas clave, gráficos interactivos
 * y permite la exportación de reportes a formatos de hoja de cálculo.
 * * @component
 * @returns {JSX.Element} El componente de la pantalla de inicio estructurado.
 */
const Inicio = () => {

  // --- Estados de Control y Filtros ---
  const [cargando, setCargando] = useState(true);
  const [fechaDesde, setFechaDesde] = useState(new Date().toLocaleDateString("en-CA", { timeZone: "America/Managua" }));
  const [fechaHasta, setFechaHasta] = useState(new Date().toLocaleDateString("en-CA", { timeZone: "America/Managua" }));
  
  // --- Estado Centralizado de Métricas y Analítica ---
  const [estadisticas, setEstadisticas] = useState({
    totalVentas: 0,
    ventasEfectivo: 0,
    ventasTarjeta: 0,
    productosVendidos: 0,
    montoProductos: 0,
    cantidadVentas: 0,
    ventasPorHora: [],
    ventasPorCategoria: []
  });

  /**
   * Controlador para coordinar la carga asíncrona de datos de Supabase y
   * disparar el procesamiento analítico de las métricas del dashboard.
   * * @async
   * @function cargarDatos
   * @param {string} desde - Fecha inicial del filtro (YYYY-MM-DD).
   * @param {string} hasta - Fecha final del filtro (YYYY-MM-DD).
   * @returns {Promise<void>}
   */
  const cargarDatos = async (desde, hasta) => {
    try {
      setCargando(true);
      
      const inicioRango = `${desde} 00:00:00`;
      const finRango = `${hasta} 23:59:59`;

      // 1. Obtener ventas del rango
      const ventas = await fetchVentasPorRango(inicioRango, finRango);
      const idsVentas = ventas.map(v => v.id_venta);

      // 2. Obtener detalles si existen ventas
      const detalles = idsVentas.length > 0 ? await fetchDetallesDeVentas(idsVentas) : [];

      // 3. Procesar las estadísticas a través del servicio analítico
      const resultadoMetricas = procesarEstadisticas(ventas, detalles);

      // 4. Guardar resultados en el estado local
      setEstadisticas(resultadoMetricas);

    } catch (err) {
      console.error("Error al coordinar la carga de estadísticas:", err);
    } finally {
      setCargando(false);
    }
  };

  // --- Efecto Reactivo para Escuchar Cambios en los Filtros de Fecha ---
  useEffect(() => {
    cargarDatos(fechaDesde, fechaHasta);
  }, [fechaDesde, fechaHasta]);

  /**
   * Manejador de eventos para disparar la descarga del reporte en Excel
   * aislando la lógica de generación en el servicio analítico.
   * * @async
   * @function descargarExcel
   * @returns {Promise<void>}
   */
  const descargarExcel = async () => {
    try {
      setCargando(true);
      await generarReporteExcel(fechaDesde, fechaHasta);
    } catch (err) {
      console.error("Error generando Excel:", err);
      alert("Error al generar el Excel. Revisa la consola.");
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" size="lg" />
        <p className="mt-3">Cargando estadísticas...</p>
      </Container>
    );
  }
  
  return (
    <Container className="mt-3">
      <Row className="align-items-center">
        <Col>
          <h2><i className="bi-house-fill me-2"></i> Inicio</h2>
        </Col>
      </Row>
    </Container>
  );
};

export default Inicio;