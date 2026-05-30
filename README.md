# SA Data Hub

A modern, accessible platform for exploring South African public data — unemployment, GDP, inflation, crime, education, population, housing, and census statistics.

Built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **Recharts**.

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout — fonts, theme, navbar, footer
│   ├── page.tsx            # Homepage — hero, featured stats, categories
│   ├── globals.css         # Global styles and Tailwind base layers
│   ├── dashboard/
│   │   └── page.tsx        # Dashboard — filters, charts, all stats
│   └── category/
│       └── [slug]/
│           └── page.tsx    # Category detail — stats + charts + sources
├── components/
│   ├── layout/
│   │   ├── ThemeProvider.tsx   # next-themes wrapper
│   │   ├── Navbar.tsx          # Responsive navbar with theme toggle
│   │   └── Footer.tsx          # Footer with links and attributions
│   ├── ui/
│   │   ├── StatCard.tsx        # Reusable statistic card
│   │   ├── CategoryCard.tsx    # Category grid card
│   │   ├── SearchBar.tsx       # Search input component
│   │   └── SourceBadge.tsx     # Data source attribution badge
│   └── charts/
│       ├── LineChartCard.tsx   # Recharts line chart in a card
│       └── BarChartCard.tsx    # Recharts bar chart in a card
├── data/
│   └── mock.ts             # All mock South African data + helpers
├── lib/
│   └── utils.ts            # cn(), formatNumber(), formatDate(), trend helpers
└── types/
    └── index.ts            # All TypeScript types for the data layer
```

---

## 🗂️ Data Architecture

All data lives in `src/data/mock.ts`. It's structured to be easily replaced with real API calls later.

### Adding a new statistic

```ts
// In src/data/mock.ts
export const statistics: Statistic[] = [
  // ... existing stats
  {
    id: 'my-new-stat',
    categoryId: 'gdp',            // Must match a Category id
    title: 'Trade Balance',
    value: '-R48B',
    rawValue: -48000,
    unit: 'ZAR million',
    change: -3.2,
    changeLabel: 'from Q3 2023',
    trend: 'down',
    description: '...',
    source: {
      name: 'Statistics South Africa',
      shortName: 'Stats SA',
      url: 'https://www.statssa.gov.za',
    },
    lastUpdated: '2024-03-05',
    series: [
      {
        name: 'Trade Balance',
        unit: 'ZAR million',
        data: [
          { label: 'Q1 2023', value: -42000 },
          { label: 'Q2 2023', value: -45000 },
          // ...
        ],
      },
    ],
  },
]
```

### Replacing mock data with a live API

Replace the relevant section in `mock.ts` with a fetch call:

```ts
// src/data/api.ts (future)
export async function fetchUnemploymentStats(): Promise<Statistic[]> {
  const res = await fetch('https://api.statssa.gov.za/qlfs/latest')
  const raw = await res.json()
  return transformToStatistic(raw) // map to your Statistic type
}
```

---

## 🎨 Theme System

- Uses **next-themes** with `class` strategy
- Three modes: Light, Dark, System (preserved in localStorage)
- Toggle in the Navbar (Sun / Moon / Monitor icons)
- All components use Tailwind's `dark:` variant

---

## 🔮 Scalability Roadmap

| Feature | Status |
|---|---|
| Mock data | ✅ Done |
| Homepage, Dashboard, Category pages | ✅ Done |
| Light / Dark / System theme | ✅ Done |
| Responsive design | ✅ Done |
| Line + Bar charts | ✅ Done |
| Search | ✅ Done |
| Province filtering (UI) | ✅ Done |
| Live Stats SA API integration | 🔜 Future |
| Real-time data refresh | 🔜 Future |
| Province-level data | 🔜 Future |
| Data insight articles | 🔜 Future |
| Email alerts for new releases | 🔜 Future |

---

## 📦 Key Dependencies

| Package | Purpose |
|---|---|
| `next` | App framework |
| `tailwindcss` | Styling |
| `recharts` | Charts |
| `next-themes` | Theme switching |
| `lucide-react` | Icons |
| `clsx` + `tailwind-merge` | Class utilities |

---

## 📜 Data Sources

- **Statistics South Africa** — [statssa.gov.za](https://www.statssa.gov.za)
- **South African Reserve Bank** — [resbank.co.za](https://www.resbank.co.za)
- **South African Police Service** — [saps.gov.za](https://www.saps.gov.za)
- **National Treasury** — [treasury.gov.za](https://www.treasury.gov.za)

*This project is not affiliated with any government department.*
