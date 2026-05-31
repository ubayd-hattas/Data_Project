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

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-600 dark:text-slate-300">{entry.name}:</span>
          <span className="font-mono font-medium text-slate-900 dark:text-white">
            {typeof entry.value === 'number' ? entry.value.toLocaleString('en-ZA') : entry.value}
            {entry.unit ? ` ${entry.unit}` : ''}
          </span>
        </div>
      ))}
    </div>
  )
}

// Transparent cursor line — replaces the default grey filled rectangle
function CustomCursor({ points, height }: any) {
  if (!points?.length) return null
  const { x } = points[0]
  return (
    <line
      x1={x}
      y1={0}
      x2={x}
      y2={height}
      stroke="currentColor"
      strokeWidth={1}
      strokeDasharray="4 2"
      className="text-slate-300 dark:text-slate-600"
    />
  )
}

export function LineChartCard({ title, series, height = 280, showLegend = false }: LineChartCardProps) {
  const data = series[0]?.data.map((point, i) => {
    const row: Record<string, string | number> = { label: point.label }
    series.forEach((s) => {
      if (s.data[i] !== undefined) row[s.name] = s.data[i].value
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
          {/* FIX: use custom cursor to eliminate the grey filled rectangle on hover */}
          <Tooltip content={<CustomTooltip />} cursor={<CustomCursor />} />
          {showLegend && (
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              formatter={(value) => (
                <span className="text-slate-600 dark:text-slate-300">{value}</span>
              )}
            />
          )}
          {series.map((s, i) => (
            <Line
              key={s.name}
              type="monotone"
              dataKey={s.name}
              stroke={s.color ?? CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      {series[0]?.unit && (
        <p className="mt-2 text-right text-xs text-slate-400">
          Unit: {series[0].unit}
        </p>
      )}
    </div>
  )
}
