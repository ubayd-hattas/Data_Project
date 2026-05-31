'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { DataSeries } from '@/types'

interface BarChartCardProps {
  title: string
  series: DataSeries[]
  height?: number
  color?: string
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <p className="mb-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: entry.fill }} />
          <span className="font-mono font-medium text-slate-900 dark:text-white">
            {typeof entry.value === 'number' ? entry.value.toLocaleString('en-ZA') : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export function BarChartCard({ title, series, height = 280, color = '#18a06d' }: BarChartCardProps) {
  const s = series[0]
  if (!s) return null

  return (
    <div className="card p-5">
      <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={s.data} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            className="text-slate-100 dark:text-slate-800"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'currentColor' }}
            className="text-slate-400"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'currentColor' }}
            className="text-slate-400"
            tickLine={false}
            axisLine={false}
          />
          {/* FIX: cursor='false' removes the grey hover block entirely for bar charts */}
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48}>
            {s.data.map((_, i) => (
              <Cell key={i} fill={color} fillOpacity={0.88} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {s.unit && (
        <p className="mt-2 text-right text-xs text-slate-400">Unit: {s.unit}</p>
      )}
    </div>
  )
}
