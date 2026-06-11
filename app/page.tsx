import HelipadSimulator from "@/components/HelipadSimulator";
import ThemeToggle from "@/components/ThemeToggle";

export default function Page() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/70 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-700 font-black text-white">
              H
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-slate-800 dark:text-slate-100">
                Simulasi Heliport
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                TLOF • Ring Kuning • Huruf H • PPJ
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-600">
            Belajar
          </p>
          <h1 className="mt-1 text-3xl font-extrabold text-slate-800 dark:text-slate-100">
            Simulasi Heliport
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            Atur ukuran helipad, huruf H, teks PPJ, dan kotak angka. Diagram digambar
            otomatis dengan Fabric.js, divisualisasikan dalam 3D dengan Three.js, dan
            perhitungannya ditampilkan dengan MathJax.
          </p>
        </div>

        <HelipadSimulator />
      </main>

      <footer className="mt-12 border-t border-slate-200/70 py-8 text-center text-xs text-slate-500 dark:border-slate-700/70 dark:text-slate-400">
        <p className="mt-1">© {new Date().getFullYear()} Helipad Simulator.</p>
      </footer>
    </div>
  );
}
