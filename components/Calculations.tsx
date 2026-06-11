"use client";

import { MathJax } from "better-react-mathjax";
import { fmt, type HelipadParams, type HelipadResults } from "@/lib/helipad";

interface Props {
  params: HelipadParams;
  results: HelipadResults;
}

interface Row {
  title: string;
  formula: string;
  note?: string;
}

export default function Calculations({ params: p, results: r }: Props) {
  const rows: Row[] = [
    {
      title: "Diameter Ring Kuning",
      formula: `\\[ D_{kuning} = D_{hijau} + 2 \\cdot l_{ring} = ${fmt(
        p.diameterTLOF,
      )} + 2 \\cdot ${fmt(p.ringKuning)} = ${fmt(r.diameterKuning)}\\ \\text{m} \\]`,
    },
    {
      title: "Luas Area Pendaratan",
      formula: `\\[ L_{area} = s^2 = ${fmt(p.totalArea)}^2 = ${fmt(
        r.luasArea,
      )}\\ \\text{m}^2 \\]`,
    },
    {
      title: "Luas TLOF (Lingkaran Hijau)",
      formula: `\\[ L_{TLOF} = \\pi r^2 = \\pi \\cdot ${fmt(
        r.radiusHijau,
      )}^2 = ${fmt(r.luasTLOF)}\\ \\text{m}^2 \\]`,
    },
    {
      title: "Luas Ring Kuning",
      formula: `\\[ L_{ring} = \\pi (R^2 - r^2) = \\pi(${fmt(r.radiusKuning)}^2 - ${fmt(
        r.radiusHijau,
      )}^2) = ${fmt(r.luasRing)}\\ \\text{m}^2 \\]`,
    },
    {
      title: "Keliling Lingkaran Kuning",
      formula: `\\[ K = 2 \\pi R = 2 \\pi \\cdot ${fmt(r.radiusKuning)} = ${fmt(
        r.kelilingKuning,
      )}\\ \\text{m} \\]`,
    },
    {
      title: "Rasio TLOF terhadap Area",
      formula: `\\[ \\text{Rasio} = \\frac{D_{hijau}}{s} \\times 100\\% = \\frac{${fmt(
        p.diameterTLOF,
      )}}{${fmt(p.totalArea)}} \\times 100\\% = ${fmt(r.rasioTLOF)}\\% \\]`,
    },
    {
      title: "Luas Satu Kotak Merah",
      formula: `\\[ L_{kotak} = p \\cdot l = ${fmt(p.boxWidth)} \\cdot ${fmt(
        p.boxHeight,
      )} = ${fmt(r.luasKotak)}\\ \\text{m}^2 \\]`,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {rows.map((row) => (
        <div
          key={row.title}
          className="rounded-xl border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-800/60"
        >
          <h4 className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
            {row.title}
          </h4>
          <div className="overflow-x-auto text-slate-800 dark:text-slate-100">
            <MathJax dynamic>{row.formula}</MathJax>
          </div>
        </div>
      ))}
    </div>
  );
}
