import { useState } from 'react';

export const useClipboard = () => {
  const [toast, setToast] = useState({ mostrar: false, mensaje: '', tipo: 'exito' });

  const copiarAlPortapapeles = async (texto, mensajeExito = "Copiado al portapapeles") => {
    try {
      await navigator.clipboard.writeText(texto);
      setToast({
        mostrar: true,
        mensaje: mensajeExito,
        tipo: "exito",
      });
    } catch (err) {
      console.error("Error al copiar:", err);
      setToast({
        mostrar: true,
        mensaje: "No se pudo copiar al portapapeles",
        tipo: "error",
      });
    }
  };

  const cerrarToast = () => setToast({ ...toast, mostrar: false });

  return { toast, copiarAlPortapapeles, cerrarToast };
};