import { useState, useEffect, useCallback } from "react";

export const useSeleccionTarjeta = () => {
  const [idActivo, setIdActivo] = useState(null);

  const alternarActivo = (id) => {
    setIdActivo((prev) => (prev === id ? null : id));
  };

  const cerrar = () => setIdActivo(null);

  const manejarEscape = useCallback((e) => {
    if (e.key === "Escape") cerrar();
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", manejarEscape);
    return () => window.removeEventListener("keydown", manejarEscape);
  }, [manejarEscape]);

  return { idActivo, alternarActivo, cerrar };
};
