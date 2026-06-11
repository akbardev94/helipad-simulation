# Helipad Simulator

An interactive heliport / helipad marking simulator built with Next.js. Adjust
helipad dimensions and instantly see the markings rendered as a 2D diagram and a
3D model, with automatic geometric calculations and exportable reports.

This project was created as a school project.

## Features

- **Live parameter editing** — configure the landing area, TLOF (green circle),
  yellow ring, the **H** marking, **PPJ** text, and the red number boxes.
- **2D diagram** — top-down canvas rendering of the helipad markings.
- **3D view** — interactive Three.js scene (drag to rotate, scroll to zoom).
- **Automatic calculations** — areas, radii, diameters, perimeter, and the
  TLOF-to-area ratio, formatted with Indonesian number conventions.
- **Exports** — download the diagram as PNG or PDF, or export a full report
  image.
- **Light / dark theme** toggle.

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router) + [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Three.js](https://threejs.org/) for the 3D view
- [Fabric.js](http://fabricjs.com/) for 2D canvas rendering
- [jsPDF](https://github.com/parallax/jsPDF) & [html-to-image](https://github.com/bubkoo/html-to-image) for exports
- [better-react-mathjax](https://github.com/fast-reflexes/better-react-mathjax) for formula display

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18.18 or newer
- npm (bundled with Node.js)

### Installation

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Script          | Description                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Start the development server             |
| `npm run build` | Create a production build                |
| `npm run start` | Run the production build                 |
| `npm run lint`  | Run the linter                           |

## Project Structure

```
helipad-simulation/
├── app/                  # Next.js App Router (layout, page, global styles)
├── components/           # React components
│   ├── HelipadSimulator.tsx  # Main UI: inputs, tabs, exports
│   ├── HelipadCanvas.tsx     # 2D diagram (Fabric.js)
│   ├── Helipad3D.tsx         # 3D view (Three.js)
│   ├── Calculations.tsx      # Formulas & computed results
│   └── ThemeToggle.tsx       # Light/dark theme switch
└── lib/
    ├── helipad.ts        # Domain model, defaults & calculations
    └── render2d.ts        # 2D rendering helpers
```

## License

See [LICENSE](./LICENSE).
