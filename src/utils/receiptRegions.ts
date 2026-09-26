// Positions of scanned fields on the receipt image, stored so the mobile app
// can highlight them. Rectangles are relative to the image size (0-1).

export interface RegionRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ReceiptRegions {
  merchantName?: RegionRect;
  date?: RegionRect;
  total?: RegionRect;
}

export interface ItemGroupRegion {
  kind: "item" | "supplement";
  line?: RegionRect;
  description?: RegionRect;
  price?: RegionRect;
}

interface PageSize {
  width: number;
  height: number;
}

interface FieldWithRegions {
  boundingRegions?: {
    pageNumber: number;
    polygon?: { x: number; y: number }[];
  }[];
}

const round = (value: number) => Math.round(value * 10000) / 10000;

/** Bounding rectangle of a field on the first page, or undefined */
export const toRegionRect = (
  field: unknown,
  page: PageSize | undefined,
): RegionRect | undefined => {
  const polygon = (field as FieldWithRegions | undefined)?.boundingRegions?.find(
    (region) => region.pageNumber === 1,
  )?.polygon;

  if (!page || !polygon || polygon.length === 0 || !page.width || !page.height) {
    return undefined;
  }

  const xs = polygon.map((point) => point.x);
  const ys = polygon.map((point) => point.y);
  const minX = Math.max(0, Math.min(...xs));
  const minY = Math.max(0, Math.min(...ys));
  const maxX = Math.min(page.width, Math.max(...xs));
  const maxY = Math.min(page.height, Math.max(...ys));

  return {
    x: round(minX / page.width),
    y: round(minY / page.height),
    w: round((maxX - minX) / page.width),
    h: round((maxY - minY) / page.height),
  };
};
