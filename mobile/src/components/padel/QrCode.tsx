import { create } from "qrcode";
import { useMemo } from "react";
import Svg, { Path, Rect } from "react-native-svg";

/** A QR code, dark on white so it scans in dark mode too */
export function QrCode({ value, size }: { value: string; size: number }) {
  const { path, count } = useMemo(() => {
    const { modules } = create(value, { errorCorrectionLevel: "M" });
    let d = "";
    for (let row = 0; row < modules.size; row++) {
      for (let col = 0; col < modules.size; col++) {
        if (modules.data[row * modules.size + col]) {
          d += `M${col} ${row}h1v1h-1z`;
        }
      }
    }
    return { path: d, count: modules.size };
  }, [value]);
  // The quiet zone around the code helps scanners find it
  const margin = 2;
  const total = count + margin * 2;

  return (
    <Svg
      width={size}
      height={size}
      viewBox={`${-margin} ${-margin} ${total} ${total}`}
      accessibilityLabel={`QR code for ${value}`}
    >
      <Rect x={-margin} y={-margin} width={total} height={total} fill="#ffffff" />
      <Path d={path} fill="#000000" />
    </Svg>
  );
}
