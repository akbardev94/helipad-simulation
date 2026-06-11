// Domain model & calculations for the heliport / helipad simulator.
// All linear dimensions are expressed in meters (m).

export interface HelipadParams {
  // Ukuran Helipad
  totalArea: number; // sisi area persegi (m)
  diameterTLOF: number; // diameter lingkaran hijau / TLOF (m)
  ringKuning: number; // lebar ring kuning (m)

  // Huruf H
  hWidth: number; // lebar H (m)
  hHeight: number; // tinggi H (m)
  hStroke: number; // lebar garis H (m)

  // Huruf PPJ
  ppjText: string;
  ppjOffsetX: number; // offset X relatif pusat (m)
  ppjOffsetY: number; // offset Y relatif pusat (m), negatif = ke atas

  // Kotak merah angka
  boxWidth: number; // lebar kotak (m)
  boxHeight: number; // tinggi total kotak (m)
  boxTop: string; // angka / teks atas
  boxBottom: string; // angka / teks bawah
}

export const DEFAULT_PARAMS: HelipadParams = {
  totalArea: 22,
  diameterTLOF: 9,
  ringKuning: 0.5,
  hWidth: 1.8,
  hHeight: 3,
  hStroke: 0.6,
  ppjText: "PPJ",
  ppjOffsetX: 0,
  ppjOffsetY: -7.05,
  boxWidth: 2.67,
  boxHeight: 3.67,
  boxTop: "04t",
  boxBottom: "14",
};

export interface HelipadResults {
  /** diameter ring kuning terluar = diameter TLOF + 2 x lebar ring (m) */
  diameterKuning: number;
  /** jari-jari lingkaran hijau (m) */
  radiusHijau: number;
  /** jari-jari ring kuning terluar (m) */
  radiusKuning: number;
  /** luas area persegi (m^2) */
  luasArea: number;
  /** luas lingkaran hijau / TLOF (m^2) */
  luasTLOF: number;
  /** luas cincin/ring kuning (m^2) */
  luasRing: number;
  /** keliling lingkaran kuning terluar (m) */
  kelilingKuning: number;
  /** luas total marka (hijau + ring) (m^2) */
  luasMarka: number;
  /** rasio diameter TLOF terhadap sisi area (%) */
  rasioTLOF: number;
  /** luas satu kotak merah (m^2) */
  luasKotak: number;
}

const round = (value: number, digits = 2): number => {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
};

export function computeResults(p: HelipadParams): HelipadResults {
  const radiusHijau = p.diameterTLOF / 2;
  const diameterKuning = p.diameterTLOF + 2 * p.ringKuning;
  const radiusKuning = diameterKuning / 2;

  const luasArea = p.totalArea * p.totalArea;
  const luasTLOF = Math.PI * radiusHijau * radiusHijau;
  const luasKuningFull = Math.PI * radiusKuning * radiusKuning;
  const luasRing = luasKuningFull - luasTLOF;
  const kelilingKuning = 2 * Math.PI * radiusKuning;
  const luasMarka = luasKuningFull;
  const rasioTLOF = (p.diameterTLOF / p.totalArea) * 100;
  const luasKotak = p.boxWidth * p.boxHeight;

  return {
    diameterKuning: round(diameterKuning),
    radiusHijau: round(radiusHijau),
    radiusKuning: round(radiusKuning),
    luasArea: round(luasArea),
    luasTLOF: round(luasTLOF),
    luasRing: round(luasRing),
    kelilingKuning: round(kelilingKuning),
    luasMarka: round(luasMarka),
    rasioTLOF: round(rasioTLOF),
    luasKotak: round(luasKotak),
  };
}

/**
 * Format a number for display using Indonesian convention ("." thousands,
 * "," decimal). Implemented manually so output is deterministic across the
 * Node server and the browser (avoids SSR hydration mismatches that
 * `toLocaleString` can cause due to ICU differences).
 */
export function fmt(value: number, digits = 2): string {
  const rounded = round(value, digits);
  const negative = rounded < 0;
  const [intPart, decPart] = Math.abs(rounded).toString().split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const out = decPart ? `${grouped},${decPart}` : grouped;
  return negative ? `-${out}` : out;
}

export type FieldType = "number" | "text";

export interface FieldDef {
  key: keyof HelipadParams;
  label: string;
  type: FieldType;
  step?: number;
  unit?: string;
}

export interface FieldGroup {
  title: string;
  fields: FieldDef[];
}

export const FIELD_GROUPS: FieldGroup[] = [
  {
    title: "Ukuran Helipad",
    fields: [
      { key: "totalArea", label: "Total Area", type: "number", step: 0.1, unit: "m" },
      {
        key: "diameterTLOF",
        label: "Diameter TLOF (Lingkar Hijau)",
        type: "number",
        step: 0.1,
        unit: "m",
      },
      { key: "ringKuning", label: "Lebar Ring Kuning", type: "number", step: 0.1, unit: "m" },
    ],
  },
  {
    title: "Huruf H",
    fields: [
      { key: "hWidth", label: "Lebar H", type: "number", step: 0.1, unit: "m" },
      { key: "hHeight", label: "Tinggi H", type: "number", step: 0.1, unit: "m" },
      { key: "hStroke", label: "Lebar Garis H", type: "number", step: 0.1, unit: "m" },
    ],
  },
  {
    title: "Huruf PPJ",
    fields: [
      { key: "ppjText", label: "Teks PPJ", type: "text" },
      { key: "ppjOffsetX", label: "Offset X PPJ", type: "number", step: 0.1, unit: "m" },
      { key: "ppjOffsetY", label: "Offset Y PPJ", type: "number", step: 0.1, unit: "m" },
    ],
  },
  {
    title: "Kotak Merah Angka",
    fields: [
      { key: "boxWidth", label: "Lebar Kotak", type: "number", step: 0.01, unit: "m" },
      { key: "boxHeight", label: "Tinggi Kotak", type: "number", step: 0.01, unit: "m" },
      { key: "boxTop", label: "Angka Atas", type: "text" },
      { key: "boxBottom", label: "Angka Bawah", type: "text" },
    ],
  },
];
