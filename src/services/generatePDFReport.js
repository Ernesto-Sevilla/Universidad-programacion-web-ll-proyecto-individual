import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDFReport = async (elements, fileName) => {
    try {
        // Inicializamos jsPDF en formato A4
        const pdf = new jsPDF("p", "mm", "a4");

        // Coordenadas vertical inicial en el PDF (En milímetros)
        let currentY = 15;
        const margin = 10;

        // Iteramos sobre cada elemento que se envia desde la interfaz.
        for (const element of elements) {
            if (!element) continue;

            const canvas = await html2canvas(element);
            const imgData = canvas.toDataURL("image/png");

            const pdfWidth = 180;

            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            // Inyectamos la imagen en las coordenadas actuales.
            pdf.addImage(imgData, "PNG", 15, currentY, pdfWidth, pdfHeight);

            currentY += pdfHeight + margin;
        }

        pdf.save(`${fileName}.pdf`);
    } catch (error) {
        console.error("Error en el servicio de PDF:", error);
        throw error;
    }
}