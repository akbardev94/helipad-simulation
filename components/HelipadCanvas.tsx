"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import type { Canvas as FabricCanvas } from "fabric";
import { CANVAS_H, CANVAS_W, drawHelipad } from "@/lib/render2d";
import type { HelipadParams, HelipadResults } from "@/lib/helipad";

export interface HelipadCanvasHandle {
  /** Returns a high-resolution PNG data URL of the diagram. */
  toDataURL: () => string | null;
}

interface Props {
  params: HelipadParams;
  results: HelipadResults;
}

const HelipadCanvas = forwardRef<HelipadCanvasHandle, Props>(function HelipadCanvas(
  { params, results },
  ref,
) {
  const elRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
  const fabricModRef = useRef<typeof import("fabric") | null>(null);

  useImperativeHandle(ref, () => ({
    toDataURL: () => {
      const c = fabricRef.current;
      if (!c) return null;
      return c.toDataURL({ format: "png", multiplier: 2 });
    },
  }));

  // Initialize fabric canvas once (client only).
  useEffect(() => {
    let disposed = false;
    (async () => {
      const fabric = await import("fabric");
      if (disposed || !elRef.current) return;
      fabricModRef.current = fabric;
      const canvas = new fabric.Canvas(elRef.current, {
        width: CANVAS_W,
        height: CANVAS_H,
        selection: false,
        backgroundColor: "#ffffff",
      });
      fabricRef.current = canvas;
      drawHelipad(fabric, canvas, params, results);
    })();

    return () => {
      disposed = true;
      fabricRef.current?.dispose();
      fabricRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redraw on parameter changes.
  useEffect(() => {
    const fabric = fabricModRef.current;
    const canvas = fabricRef.current;
    if (fabric && canvas) {
      drawHelipad(fabric, canvas, params, results);
    }
  }, [params, results]);

  return (
    <div className="w-full overflow-auto rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-700">
      <canvas
        ref={elRef}
        className="mx-auto block h-auto max-w-full"
        style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
      />
    </div>
  );
});

export default HelipadCanvas;
