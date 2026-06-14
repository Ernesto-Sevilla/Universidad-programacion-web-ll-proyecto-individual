import React from "react";
import { Form, InputGroup } from "react-bootstrap";

const CuadroBusquedas = ({ textoBusqueda, manejarCambioBusqueda }) => {
  
  const handleOnChange = (e) => {
    if (!manejarCambioBusqueda) return;
    try {
      manejarCambioBusqueda(e.target.value);
    } catch (error) {
      manejarCambioBusqueda(e);
    }
  };
  
  return (
    <InputGroup style={{ width: "100%", borderRadius: "0.375rem" }} className="shadow-sm">
      <InputGroup.Text>
        <i className="bi bi-search"></i>
      </InputGroup.Text>
      <Form.Control
        type="text"
        placeholder="Buscar..."
        value={textoBusqueda}
        onChange={handleOnChange}
      />
    </InputGroup>
  );
};

export default CuadroBusquedas;