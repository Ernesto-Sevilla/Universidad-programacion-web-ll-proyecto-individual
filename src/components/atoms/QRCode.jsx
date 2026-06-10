import QRCode from "react-qr-code";

/**
 * Átomo QRCode: Se encarga exclusivamente de la representación visual del código.
 * @param {string} value - El string generado por el formatService.
 * @param {number} size - Tamaño en píxeles (opcional).
 */
const QRCodeAtom = ({ value, size = 128 }) => {
  return (
    <div style={{ background: 'white', padding: '16px', borderRadius: '8px', display: 'inline-block' }}>
      <QRCode 
        value={value} 
        size={size} 
        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
        viewBox={`0 0 256 256`}
      />
    </div>
  );
};

export default QRCodeAtom;