'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { DataSeries } from '@/types'

interface LineChartCardProps {
  title: string
  series: DataSeries[]
  height?: number
  showLegend?: boolean
}

const CHART_COLORS = ['#18a06d', '#e8ab10', '#3b82f6', '#ef4444', '#8b5cf6']

// Custom tooltip
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-600 dark:text-slate-300">{entry.name}:</span>
          <span className="font-mono font-medium text-slate-900 dark:text-white">
            {entry.value.toLocaleString('en-ZA')}
            {entry.unit && ` ${entry.unit}`}
          </span>
        </div>
      ))}
    </div>
  )
}

export function LineChartCard({ title, series, height = 280, showLegend = false }: LineChartCardProps) {
  // Flatten series into recharts-compatible data
  const data = series[0]?.data.map((point, i) => {
    const row: Record<string, string | number> = { label: point.label }
    series.forEach((s) => {
      row[s.name] = s.data[i]?.value ?? 0
    })
    return row
  }) ?? []

  return (
    <div className="card p-5">
      <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            className="text-slate-100 dark:text-slate-800"
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
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {series.map((s, i) => (
            <Line
              key={s.name}
              type="monotone"
              dataKey={s.name}
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={2.5}
              dot={{ r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <p className="mt-2 text-right text-xs text-slate-400">
        Unit: {series[0]?.unit}
      </p>
    </div>
  )
}
