"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import {
  computeResults,
  DEFAULT_PARAMS,
  FIELD_GROUPS,
  fmt,
  type FieldDef,
  type HelipadParams,
} from "@/lib/helipad";
import Calculations from "./Calculations";
import type { HelipadCanvasHandle } from "./HelipadCanvas";

const HelipadCanvas = dynamic(() => import("./HelipadCanvas"), { ssr: false });
const Helipad3D = dynamic(() => import("./Helipad3D"), { ssr: false });

type View = "2d" | "3d" | "hitung";

export default function HelipadSimulator() {
  const [draft, setDraft] = useState<HelipadParams>(DEFAULT_PARAMS);
  const [applied, setApplied] = useState<HelipadParams>(DEFAULT_PARAMS);
  const [view, setView] = useState<View>("2d");
  const [busy, setBusy] = useState(false);

  const canvasRef = useRef<HelipadCanvasHandle>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => computeResults(applied), [applied]);

  const update = (field: FieldDef, raw: string) => {
    setDraft((prev) => ({
      ...prev,
      [field.key]: field.type === "number" ? (raw === "" ? 0 : Number(raw)) : raw,
    }));
  };

  const generate = () => setApplied(draft);
  const reset = () => {
    setDraft(DEFAULT_PARAMS);
    setApplied(DEFAULT_PARAMS);
  };

  const triggerDownload = (dataUrl: string, filename: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    a.click();
  };

  const downloadPNG = () => {
    const url = canvasRef.current?.toDataURL();
    if (url) triggerDownload(url, "helipad-diagram.png");
  };

  const downloadPDF = async () => {
    const url = canvasRef.current?.toDataURL();
    if (!url) return;
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    pdf.setFontSize(18);
    pdf.text("Laporan Simulasi Heliport", pageW / 2, 18, { align: "center" });

    const imgW = pageW - 30;
    pdf.addImage(url, "PNG", 15, 26, imgW, imgW);

    let y = 26 + imgW + 10;
    pdf.setFontSize(12);
    const lines = [
      `Total Area: ${fmt(applied.totalArea)} m  |  Luas Area: ${fmt(results.luasArea)} m2`,
      `Diameter Hijau (TLOF): ${fmt(applied.diameterTLOF)} m  |  Luas TLOF: ${fmt(results.luasTLOF)} m2`,
      `Diameter Kuning: ${fmt(results.diameterKuning)} m  |  Luas Ring: ${fmt(results.luasRing)} m2`,
      `Keliling Kuning: ${fmt(results.kelilingKuning)} m  |  Rasio TLOF: ${fmt(results.rasioTLOF)} %`,
      `Kotak Merah: ${fmt(applied.boxWidth)} x ${fmt(applied.boxHeight)} m  |  Luas: ${fmt(results.luasKotak)} m2`,
    ];
    lines.forEach((l) => {
      pdf.text(l, 15, y);
      y += 8;
    });
    pdf.save("laporan-helipad.pdf");
  };

  const downloadReport = async () => {
    if (!reportRef.current) return;
    setBusy(true);
    try {
      const { toPng } = await import("html-to-image");
      const url = await toPng(reportRef.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      triggerDownload(url, "laporan-helipad.png");
    } finally {
      setBusy(false);
    }
  };

  const summary = [
    { label: "Diameter Kuning", value: `${fmt(results.diameterKuning)} m` },
    { label: "Luas Area", value: `${fmt(results.luasArea)} m²` },
    { label: "Luas TLOF", value: `${fmt(results.luasTLOF)} m²` },
    { label: "Luas Ring Kuning", value: `${fmt(results.luasRing)} m²` },
    { label: "Keliling Kuning", value: `${fmt(results.kelilingKuning)} m` },
    { label: "Rasio TLOF", value: `${fmt(results.rasioTLOF)} %` },
  ];

  return (
    <div className="space-y-6">
      {/* ===== INPUT CARD ===== */}
      <section className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-800/70">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {FIELD_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand">
                {group.title}
              </h3>
              <div className="space-y-3">
                {group.fields.map((field) => (
                  <label key={field.key} className="block">
                    <span className="mb-1 block text-xs text-slate-500 dark:text-slate-400">
                      {field.label}
                      {field.unit ? ` (${field.unit})` : ""}
                    </span>
                    <input
                      type={field.type === "number" ? "number" : "text"}
                      step={field.step}
                      value={String(draft[field.key])}
                      onChange={(e) => update(field, e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={generate}
            className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-brand-dark"
          >
            Generate
          </button>
          <button
            onClick={downloadPNG}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-emerald-700"
          >
            Download PNG
          </button>
          <button
            onClick={downloadPDF}
            className="rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-rose-700"
          >
            Download PDF
          </button>
          <button
            onClick={downloadReport}
            disabled={busy}
            className="rounded-lg bg-slate-700 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-slate-800 disabled:opacity-60"
          >
            {busy ? "Memproses…" : "Download Laporan"}
          </button>
          <button
            onClick={reset}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Reset
          </button>
        </div>
      </section>

      {/* ===== VIEW TABS ===== */}
      <div className="flex gap-2">
        {(
          [
            ["2d", "Diagram 2D"],
            ["3d", "Tampilan 3D"],
            ["hitung", "Perhitungan"],
          ] as [View, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              view === key
                ? "bg-brand text-white shadow"
                : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ===== RESULT ===== */}
      <section
        ref={reportRef}
        className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-800/70"
      >
        <div className={view === "2d" ? "block" : "hidden"}>
          <HelipadCanvas ref={canvasRef} params={applied} results={results} />
        </div>
        <div className={view === "3d" ? "block" : "hidden"}>
          <Helipad3D params={applied} results={results} />
          <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
            Seret untuk memutar, scroll untuk zoom.
          </p>
        </div>
        <div className={view === "hitung" ? "block" : "hidden"}>
          <Calculations params={applied} results={results} />
        </div>

        {/* Quick summary always visible */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {summary.map((s) => (
            <div
              key={s.label}
              className="rounded-xl bg-slate-100 p-3 text-center dark:bg-slate-700/50"
            >
              <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {s.label}
              </div>
              <div className="mt-1 text-base font-bold text-slate-800 dark:text-slate-100">
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
