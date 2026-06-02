// src/hooks/useCompras.js
import { useState, useEffect } from "react";
import { supabase } from "../database/supabaseconfig";
import { compraServicio } from "@/services";

export const useCompras = () => {
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });
  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Datos auxiliares para poblar los selectores del formulario de compras
  const [empleados, setEmpleados] = useState([]);
  const [productos, setProductos] = useState([]);

  // Cargar Empleados y Productos en paralelo
  const cargarDatosAuxiliares = async () => {
    try {
      const [e] = await Promise.all([
        supabase.from("empleados").select("*").order("nombre_empleado", { ascending: true })
      ]);

      setEmpleados(e.data || []);

      // Invocamos tu método seguro para los productos desde el servicio de compras
      const productosData = await compraServicio.obtenerProductosParaCompra();
      setProductos(productosData);
    } catch (err) {
      console.error("❌ Error cargando datos auxiliares en el Hook de Compras:", err);
    }
  };

  // Cargar historial de compras con la sub-tabla de detalles incluida
  const cargarCompras = async () => {
    try {
      setCargando(true);
      const data = await compraServicio.obtenerTodas();
      setCompras(data);
    } catch (err) {
      console.error("❌ Error al cargar compras desde el Hook:", err);
      setToast({ mostrar: true, mensaje: "Error al cargar las compras de la base de datos", tipo: "error" });
    } finally {
      setCargando(false);
    }
  };

  // Guardar o Actualizar Compra (Lógica transaccional unificada)
  const procesarGuardarCompra = async (compraAEditar, datosCompra, detalles) => {
    try {
      if (compraAEditar) {
        // === MODO: ACTUALIZAR COMPRA EXISTENTE ===
        const { error: errorCompra } = await supabase
          .from("compras")
          .update({
            proveedor: datosCompra.proveedor,
            id_empleado: Number(datosCompra.id_empleado),
            metodo_pago: datosCompra.metodo_pago,
            total: Number(datosCompra.total)
          })
          .eq("id_compra", compraAEditar.id_compra);

        if (errorCompra) throw errorCompra;

        // 1. Limpiar el detalle histórico para evitar duplicidad o desajustes de llaves primarias
        const { error: errorBorrado } = await supabase
          .from("detalles_compras")
          .delete()
          .eq("id_compra", compraAEditar.id_compra);

        if (errorBorrado) throw errorBorrado;

        // 2. Mapear e insertar el nuevo estado del carrito de abastecimiento
        const detallesInsert = detalles.map(d => ({
          id_compra: compraAEditar.id_compra,
          id_producto: Number(d.id_producto),
          cantidad: Number(d.cantidad),
          precio_costo: Number(d.precio_costo),
          subtotal: Number(d.cantidad * d.precio_costo)
        }));

        const { error: errorDetalles } = await supabase.from("detalles_compras").insert(detallesInsert);
        if (errorDetalles) throw errorDetalles;

        setToast({ mostrar: true, mensaje: "Compra modificada exitosamente", tipo: "exito" });
      } else {
        // === MODO: REGISTRAR NUEVA COMPRA ===
        const nicaNow = () => new Date().toLocaleString("sv", { timeZone: "America/Managua" }).replace(" ", "T");

        const { data: compraData, error: errorNuevaCompra } = await supabase
          .from("compras")
          .insert([{
            proveedor: datosCompra.proveedor,
            id_empleado: Number(datosCompra.id_empleado),
            fecha_compra: nicaNow(),
            metodo_pago: datosCompra.metodo_pago,
            total: Number(datosCompra.total)
          }])
          .select()
          .single();

        if (errorNuevaCompra) throw errorNuevaCompra;

        const detallesInsert = detalles.map(d => ({
          id_compra: compraData.id_compra,
          id_producto: Number(d.id_producto),
          cantidad: Number(d.cantidad),
          precio_costo: Number(d.precio_costo),
          subtotal: Number(d.cantidad * d.precio_costo)
        }));

        const { error: errorNuevosDetalles } = await supabase.from("detalles_compras").insert(detallesInsert);
        if (errorNuevosDetalles) throw errorNuevosDetalles;

        // 3. Incremento inmediato y automático del Stock en Bodega al asentar la compra
        if (detallesInsert.length > 0) {
          await compraServicio.incrementarInventario(detallesInsert);
        }

        setToast({ mostrar: true, mensaje: "Compra procesada e inventario reabastecido con éxito", tipo: "exito" });
      }

      await Promise.all([cargarCompras(), cargarDatosAuxiliares()]); // Recarga reactiva general
      return true;
    } catch (err) {
      console.error("❌ Falló la operación en Supabase:", err);
      setToast({ mostrar: true, mensaje: "Error crítico al guardar la operación de compra", tipo: "error" });
      return false;
    }
  };

  useEffect(() => {
    cargarCompras();
    cargarDatosAuxiliares();
  }, []);

  return {
    compras,
    cargando,
    empleados,
    productos,
    toast,
    setToast,
    procesarGuardarCompra
  };
};