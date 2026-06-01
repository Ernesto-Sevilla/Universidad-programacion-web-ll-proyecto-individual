import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card, Spinner, Form } from "react-bootstrap";
import { LineChard, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { supabase } from "../database/supabaseconfig"
import * as XLSX from 'xlsx';

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