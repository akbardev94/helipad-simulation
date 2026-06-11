"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

function applyTheme(theme: Theme) {
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
}

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" strokeLinecap="round" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MonitorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" strokeLinecap="round" />
  </svg>
);

const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "Light", icon: <SunIcon /> },
  { value: "dark", label: "Dark", icon: <MoonIcon /> },
  { value: "system", label: "System", icon: <MonitorIcon /> },
];

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (localStorage.getItem("theme") as Theme) || "system";
    setTheme(stored);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("theme", theme);
    applyTheme(theme);
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme, mounted]);

  if (!mounted) {
    return <div className="h-9 w-[168px]" aria-hidden />;
  }

  return (
    <div
      role="group"
      aria-label="Pilih tema"
      className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white/70 p-1 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5"
    >
      {options.map((o) => {
        const active = theme === o.value;
        return (
          <button
            key={o.value}
            onClick={() => setTheme(o.value)}
            title={`Tema: ${o.label}`}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              active
                ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow"
                : "text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-white/10"
            }`}
          >
            {o.icon}
            <span className="hidden sm:inline">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
