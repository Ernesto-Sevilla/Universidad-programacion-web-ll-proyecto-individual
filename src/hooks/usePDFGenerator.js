import { useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';

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

  return { generateDashboardPDF, isGenerating, error };
};