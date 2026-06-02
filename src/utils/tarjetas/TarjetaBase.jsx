import React from "react";
import { Card, CardBody } from "react-bootstrap";

export const TarjetaBase = ({ id, esActivo, alHacerClick, children, acciones, ariaLabel }) => {
  return (
    <Card
      className="mb-3 border-0 rounded-3 shadow-sm w-100"
      tabIndex={0}
      onClick={alHacerClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          alHacerClick();
        }
      }}
      aria-label={ariaLabel}
    >
      <CardBody className={`p-2 ${esActivo ? "tarjeta-activo" : "tarjeta-inactivo"}`}>
        {children}
      </CardBody>

      {esActivo && (
        <div className="tarjeta-categoria-capa" onClick={(e) => e.stopPropagation()}>
          <div className="d-flex gap-2 tarjeta-categoria-botones-capa">
            {acciones}
          </div>
        </div>
      )}
    </Card>
  );
};