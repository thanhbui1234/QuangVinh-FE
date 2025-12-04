import type { WeeklyLeaveStats } from '@/hooks/dashboard/useTeamLeaveStats.ts'

export function MiniLine({ className = 'h-24 w-full' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 40" className={className}>
      <polyline
        fill="none"
        stroke="#16a34a"
        strokeWidth="2"
        points="0,30 15,28 30,26 45,20 60,24 75,16 90,12 100,14"
      />
      <polyline fill="none" stroke="#d1d5db" strokeWidth="1" points="0,32 100,32" />
    </svg>
  )
}

export function MiniBar({ className = 'h-24 w-full' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 40" className={className}>
      {Array.from({ length: 8 }).map((_, i) => {
        const height = [10, 20, 12, 28, 18, 30, 22, 26][i]
        return (
          <rect
            key={i}
            x={i * 12 + 2}
            y={38 - height}
            width="8"
            height={height}
            fill="#2563eb"
            rx="1"
          />
        )
      })}
    </svg>
  )
}

export function MiniDonut({ className = 'h-24 w-24' }: { className?: string }) {
  return (
    <svg viewBox="0 0 42 42" className={className}>
      <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#e5e7eb" strokeWidth="6" />
      <circle
        cx="21"
        cy="21"
        r="15.915"
        fill="transparent"
        stroke="#22c55e"
        strokeWidth="6"
        strokeDasharray="60 40"
        strokeDashoffset="25"
      />
    </svg>
  )
}

const defaultLeaveStackedData = [
  { dayLabel: 'T2', approved: 8, pending: 2 },
  { dayLabel: 'T3', approved: 4, pending: 1 },
  { dayLabel: 'T4', approved: 6, pending: 3 },
  { dayLabel: 'T5', approved: 10, pending: 2 },
  { dayLabel: 'T6', approved: 5, pending: 1 },
  { dayLabel: 'T7', approved: 2, pending: 1 },
  { dayLabel: 'CN', approved: 3, pending: 1 },
]

interface MiniLeaveStackedProps {
  className?: string
  data?: WeeklyLeaveStats[]
}

export function MiniLeaveStacked({ className = 'h-28 w-full', data }: MiniLeaveStackedProps) {
  const chartData = (data && data.length > 0 ? data : defaultLeaveStackedData).slice(0, 7)
  const totals = chartData.map((item) => item.approved + item.pending)
  const maxValue = Math.max(...totals, 1)
  const baseY = 54
  const chartHeight = 38
  const barWidth = 10
  const barSpacing = 16
  const viewBoxWidth = Math.max(120, chartData.length * barSpacing + 10)

  return (
    <svg viewBox={`0 0 ${viewBoxWidth} 60`} className={className}>
      {chartData.map((day, index) => {
        const x = index * barSpacing + 6
        const approvedHeight = (day.approved / maxValue) * chartHeight
        const pendingHeight = (day.pending / maxValue) * chartHeight
        const approvedY = baseY - approvedHeight
        const pendingY = approvedY - pendingHeight
        return (
          <g key={`${day?.dayLabel}-${index}`}>
            <rect
              x={x}
              y={approvedY}
              width={barWidth}
              height={approvedHeight}
              fill="#22c55e"
              rx="1"
            />
            <rect
              x={x}
              y={pendingY}
              width={barWidth}
              height={pendingHeight}
              fill="#f59e0b"
              rx="1"
            />
            <text x={x + barWidth / 2} y={58} textAnchor="middle" fontSize="4" fill="#6b7280">
              {day.dayLabel}
            </text>
          </g>
        )
      })}
      <line x1="0" y1="54" x2={viewBoxWidth} y2="54" stroke="#e5e7eb" strokeWidth="1" />
    </svg>
  )
}
