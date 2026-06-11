import type { Metadata } from "next";
import { MathJaxContext } from "better-react-mathjax";
import "./globals.css";

export const metadata: Metadata = {
  title: "Simulasi Heliport",
  description:
    "Simulator & kalkulator marka heliport (TLOF, ring kuning, huruf H, PPJ) dengan ekspor PNG/PDF.",
};

const mathJaxConfig = {
  loader: { load: ["[tex]/ams"] },
  tex: {
    packages: { "[+]": ["ams"] },
    inlineMath: [
      ["$", "$"],
      ["\\(", "\\)"],
    ],
    displayMath: [
      ["$$", "$$"],
      ["\\[", "\\]"],
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const themeInit = `(function(){try{var t=localStorage.getItem('theme')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <MathJaxContext config={mathJaxConfig}>{children}</MathJaxContext>
      </body>
    </html>
  );
}
