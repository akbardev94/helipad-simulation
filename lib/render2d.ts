// Fabric.js based 2D renderer for the helipad diagram.
// Imported dynamically on the client to avoid SSR issues.

import type { Canvas as FabricCanvas } from "fabric";
import { fmt, type HelipadParams, type HelipadResults } from "./helipad";

export const CANVAS_W = 900;
export const CANVAS_H = 900;
const MARGIN = 120; // ruang untuk garis dimensi & label
const AREA = Math.min(CANVAS_W, CANVAS_H) - 2 * MARGIN;

const COLORS = {
  frame: "#cfd4db",
  area: "#5d646e",
  yellow: "#f4e000",
  green: "#6fae1f",
  white: "#ffffff",
  red: "#e2231a",
  dim: "#111111",
  dimText: "#0f172a",
};

interface Ctx {
  fabric: typeof import("fabric");
  canvas: FabricCanvas;
  add: (o: object) => void;
}

// Map a length in meters to pixels.
function pxPerM(p: HelipadParams) {
  return AREA / p.totalArea;
}

function makeText(
  fabric: typeof import("fabric"),
  text: string,
  x: number,
  y: number,
  opts: Record<string, unknown> = {},
) {
  return new fabric.FabricText(text, {
    left: x,
    top: y,
    fontFamily: "Arial, sans-serif",
    fill: COLORS.dimText,
    fontSize: 15,
    selectable: false,
    evented: false,
    originX: "center",
    originY: "center",
    ...opts,
  });
}

function arrowhead(
  fabric: typeof import("fabric"),
  x: number,
  y: number,
  angleDeg: number,
) {
  // small filled triangle pointing along angleDeg
  const tri = new fabric.Triangle({
    left: x,
    top: y,
    width: 10,
    height: 12,
    fill: COLORS.dim,
    originX: "center",
    originY: "center",
    angle: angleDeg,
    selectable: false,
    evented: false,
  });
  return tri;
}

// Horizontal dimension line with arrowheads on both ends + label.
function dimH(ctx: Ctx, x1: number, x2: number, y: number, label: string, labelAbove = true) {
  const { fabric, add } = ctx;
  add(
    new fabric.Line([x1, y, x2, y], {
      stroke: COLORS.dim,
      strokeWidth: 1.5,
      selectable: false,
      evented: false,
    }),
  );
  add(arrowhead(fabric, x1, y, -90)); // pointing left
  add(arrowhead(fabric, x2, y, 90)); // pointing right
  add(
    makeText(fabric, label, (x1 + x2) / 2, y + (labelAbove ? -14 : 16), {
      fontSize: 15,
      fontWeight: "bold",
    }),
  );
}

// Vertical dimension line with arrowheads on both ends + label.
function dimV(ctx: Ctx, y1: number, y2: number, x: number, label: string, labelLeft = true) {
  const { fabric, add } = ctx;
  add(
    new fabric.Line([x, y1, x, y2], {
      stroke: COLORS.dim,
      strokeWidth: 1.5,
      selectable: false,
      evented: false,
    }),
  );
  add(arrowhead(fabric, x, y1, 0)); // pointing up
  add(arrowhead(fabric, x, y2, 180)); // pointing down
  add(
    makeText(fabric, label, x + (labelLeft ? -16 : 16), (y1 + y2) / 2, {
      fontSize: 15,
      fontWeight: "bold",
      angle: -90,
    }),
  );
}

/**
 * Draw the full helipad scene into a Fabric canvas.
 */
export function drawHelipad(
  fabric: typeof import("fabric"),
  canvas: FabricCanvas,
  p: HelipadParams,
  r: HelipadResults,
) {
  canvas.backgroundColor = "#ffffff";
  canvas.clear();
  canvas.backgroundColor = "#ffffff";

  const add = (o: object) => canvas.add(o as never);
  const ctx: Ctx = { fabric, canvas, add };

  const scale = pxPerM(p);
  const areaLeft = MARGIN;
  const areaTop = MARGIN;
  const areaSize = AREA;
  const cx = areaLeft + areaSize / 2;
  const cy = areaTop + areaSize / 2;

  // --- Light frame behind the grey area ---
  add(
    new fabric.Rect({
      left: areaLeft - 14,
      top: areaTop - 14,
      width: areaSize + 28,
      height: areaSize + 28,
      fill: COLORS.frame,
      selectable: false,
      evented: false,
    }),
  );

  // --- Grey landing area ---
  add(
    new fabric.Rect({
      left: areaLeft,
      top: areaTop,
      width: areaSize,
      height: areaSize,
      fill: COLORS.area,
      selectable: false,
      evented: false,
    }),
  );

  // --- Yellow ring (outer circle) ---
  const rKuningPx = r.radiusKuning * scale;
  add(
    new fabric.Circle({
      left: cx,
      top: cy,
      radius: rKuningPx,
      fill: COLORS.yellow,
      originX: "center",
      originY: "center",
      selectable: false,
      evented: false,
    }),
  );

  // --- Green TLOF circle ---
  const rHijauPx = r.radiusHijau * scale;
  add(
    new fabric.Circle({
      left: cx,
      top: cy,
      radius: rHijauPx,
      fill: COLORS.green,
      originX: "center",
      originY: "center",
      selectable: false,
      evented: false,
    }),
  );

  // --- PPJ text ---
  if (p.ppjText) {
    add(
      makeText(fabric, p.ppjText, cx + p.ppjOffsetX * scale, cy + p.ppjOffsetY * scale, {
        fill: COLORS.white,
        fontSize: Math.max(28, scale * 1.7),
        fontWeight: "bold",
        fontFamily: "Arial, sans-serif",
      }),
    );
  }

  // --- White letter "H" built from three bars ---
  const hW = p.hWidth * scale;
  const hH = p.hHeight * scale;
  const hS = p.hStroke * scale;
  const hCommon = {
    fill: COLORS.white,
    selectable: false,
    evented: false,
    originX: "center" as const,
    originY: "center" as const,
  };
  // left vertical bar
  add(new fabric.Rect({ ...hCommon, left: cx - hW / 2 + hS / 2, top: cy, width: hS, height: hH }));
  // right vertical bar
  add(new fabric.Rect({ ...hCommon, left: cx + hW / 2 - hS / 2, top: cy, width: hS, height: hH }));
  // crossbar
  add(new fabric.Rect({ ...hCommon, left: cx, top: cy, width: hW, height: hS }));

  // --- Red number boxes (two stacked) on the lower-left, straddling the edge ---
  const boxW = p.boxWidth * scale;
  const boxH = p.boxHeight * scale;
  const halfH = boxH / 2;
  const boxLeft = areaLeft - boxW * 0.45; // straddle the left edge
  const boxTopY = cy + areaSize * 0.12; // a bit below center
  const drawRedCell = (top: number, label: string) => {
    add(
      new fabric.Rect({
        left: boxLeft,
        top,
        width: boxW,
        height: halfH,
        fill: COLORS.white,
        stroke: COLORS.red,
        strokeWidth: 4,
        selectable: false,
        evented: false,
      }),
    );
    add(
      makeText(fabric, label, boxLeft + boxW / 2, top + halfH / 2, {
        fill: "#111111",
        fontSize: Math.max(18, halfH * 0.5),
        fontWeight: "bold",
      }),
    );
  };
  drawRedCell(boxTopY, p.boxTop);
  drawRedCell(boxTopY + halfH, p.boxBottom);

  // ===== DIMENSION ANNOTATIONS =====

  // Top: total width of area
  dimH(ctx, areaLeft, areaLeft + areaSize, areaTop - 40, `${fmt(p.totalArea)} m (Lebar Area)`);

  // Right: total height of area
  dimV(
    ctx,
    areaTop,
    areaTop + areaSize,
    areaLeft + areaSize + 45,
    `${fmt(p.totalArea)} m (Tinggi Area)`,
    false,
  );

  // Diameter kuning (across yellow circle), placed in upper region
  const yKuning = cy - rKuningPx * 0.55;
  dimH(ctx, cx - rKuningPx, cx + rKuningPx, yKuning, `${fmt(r.diameterKuning)} m (Diameter Kuning)`);

  // Diameter hijau (across green circle), placed in lower region
  const yHijau = cy + rHijauPx * 0.72;
  dimH(ctx, cx - rHijauPx, cx + rHijauPx, yHijau, `${fmt(p.diameterTLOF)} m (Diameter Hijau)`, false);

  // Lebar H (above the H)
  dimH(ctx, cx - hW / 2, cx + hW / 2, cy - hH / 2 - 18, `${fmt(p.hWidth)} m (Lebar H)`);

  // Tinggi H (right of the H)
  dimV(ctx, cy - hH / 2, cy + hH / 2, cx + hW / 2 + 22, `${fmt(p.hHeight)} m (Tinggi H)`, false);

  // Lebar kotak (above red boxes)
  dimH(ctx, boxLeft, boxLeft + boxW, boxTopY - 16, `${fmt(p.boxWidth)} m (Lebar Kotak)`);

  // Tinggi kotak (left of red boxes)
  dimV(
    ctx,
    boxTopY,
    boxTopY + boxH,
    boxLeft - 18,
    `${fmt(p.boxHeight)} m (Tinggi Kotak)`,
    true,
  );

  canvas.renderAll();
}
