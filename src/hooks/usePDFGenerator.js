import { useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';

export const usePDFGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateDashboardPDF = async (elementId, filename = 'reporte.pdf') => {
    const element = document.getElementById(elementId);
    if (!element) {
      setError(`No se encontró el elemento con el ID: ${elementId}`);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // 1. Capturar el contenedor de los gráficos mediante html2canvas
      const canvas = await html2canvas(element, {
        scale: 2, // Incrementa la calidad/resolución del render del gráfico
        useCORS: true // Evita bloqueos si hay imágenes externas
      });

      const imgData = canvas.toDataURL('image/png');

      // 2. Inicializar jsPDF (Formato A4, unidades en milímetros)
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // Ancho de un A4 en mm
      const pageHeight = 295; // Alto de un A4 en mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // 3. Añadir la imagen al PDF (Manejo básico de multipágina si el gráfico es largo)
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // 4. Descargar el archivo
      pdf.save(filename);
    } catch (err) {
      console.error("Error generando PDF:", err);
      setError("No se pudo generar el PDF correctamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateReceiptPDF = async (venta, filename = null) => {
    console.log("Estos son los datos de la venta:" , venta)
    if (!venta) {
      setError("No se proporcionaron datos de la venta.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // 🌟 ELIMINAMOS: autoTable(jsPDF); <- Esto ya no va aquí.

      const pdf = new jsPDF('p', 'mm', 'a4');
      const nameFile = filename || `recibo_venta_${venta.id_venta || venta.id_compra}.pdf`;

      // --- ENCABEZADO CORPORATIVO ---
      pdf.setFillColor(40, 167, 69);
      pdf.rect(0, 0, 210, 40, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(22);
      pdf.text("COMPROBANTE DE VENTA", 14, 25);

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Folio ID: # ${venta.id_venta || 'N/A'}`, 150, 25);

      // --- DATOS GENERALES (METADATOS) ---
      pdf.setTextColor(33, 37, 41);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Información de la Transacción", 14, 55);

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      const fecha = venta.fecha_venta ? new Date(venta.fecha_venta).toLocaleString() : new Date().toLocaleString();

      pdf.text(`Fecha: ${fecha}`, 14, 65);
      pdf.text(`Método de Pago: ${venta.metodo_pago?.toUpperCase() || 'Efectivo'}`, 14, 72);

      const empleado = venta.empleados ? `${venta.empleados.nombre_empleado} ${venta.empleados.apellido_empleado}` : 'Sistema';
      pdf.text(`Atendido por: ${empleado}`, 14, 79);

      if (venta.cliente) {
        pdf.text(`Cliente: ${venta.cliente}`, 14, 86);
      }

      // --- TABLA DE DETALLES (PRODUCTOS) ---
      const detallesRaw = venta.detalles_ventas || venta.detalles_compras || [];

      const tableRows = detallesRaw.map((item, index) => [
        index + 1,
        item.nombre || item.productos?.nombre || `Producto ID: ${item.id_producto}`,
        item.cantidad,
        `$${parseFloat(item.precio_unitario || "No encontrado").toFixed(2)}`,
        `$${(item.cantidad * parseFloat(item.precio_unitario || "No encontrado")).toFixed(2)}`
      ]);

      // 🌟 CAMBIO AQUÍ: Llamamos a autoTable pasándole el 'pdf' vivo en la propiedad 'doc'
      autoTable(pdf, {
        startY: 95,
        head: [['#', 'Producto', 'Cant.', 'Precio Unit.', 'Subtotal']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [40, 167, 69] },
        styles: { font: "helvetica", fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 10 },
          2: { cellWidth: 15, halign: 'center' },
          3: { cellWidth: 30, halign: 'right' },
          4: { cellWidth: 30, halign: 'right' }
        }
      });

      // --- TOTAL GENERAL ---
      const finalY = pdf.lastAutoTable.finalY + 10;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text(`TOTAL GENERAL: $${parseFloat(venta.total || 0).toFixed(2)}`, 140, finalY);

      // --- PIE DE PÁGINA ---
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "italic");
      pdf.setTextColor(108, 117, 125);
      pdf.text("Gracias por su preferencia - SmartVentas", 14, 280);

      pdf.save(nameFile);

    } catch (err) {
      console.error("Error al generar recibo PDF:", err);
      setError("No se pudo construir el recibo PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateDashboardPDF, generateReceiptPDF, isGenerating, error };
};