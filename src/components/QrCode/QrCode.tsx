import { create } from "qrcode";

interface QrCodeProps {
  value: string;
  className?: string;
}

/** A QR code as SVG, dark on white so it scans in dark mode too */
export const QrCode = ({ value, className }: QrCodeProps) => {
  const { modules } = create(value, { errorCorrectionLevel: "M" });
  let path = "";
  for (let row = 0; row < modules.size; row++) {
    for (let col = 0; col < modules.size; col++) {
      if (modules.data[row * modules.size + col]) {
        path += `M${col} ${row}h1v1h-1z`;
      }
    }
  }
  // The quiet zone around the code helps scanners find it
  const margin = 2;
  const total = modules.size + margin * 2;

  return (
    <svg
      viewBox={`${-margin} ${-margin} ${total} ${total}`}
      className={className}
      shapeRendering="crispEdges"
      role="img"
      aria-label={`QR code for ${value}`}
    >
      <rect
        x={-margin}
        y={-margin}
        width={total}
        height={total}
        fill="#ffffff"
      />
      <path d={path} fill="#000000" />
    </svg>
  );
};
