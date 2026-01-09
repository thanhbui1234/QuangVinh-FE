import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import type { GroupStatistics } from '@/types/ColumnStatistics'
import { TrendingUp } from 'lucide-react'

interface GroupStatisticsChartProps {
  data: GroupStatistics
}

// Beautiful gradient colors
const COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // green
  '#06b6d4', // cyan
  '#ef4444', // red
  '#f97316', // orange
]

export const GroupStatisticsChart: React.FC<GroupStatisticsChartProps> = ({ data }) => {
  // Transform data for recharts
  const chartData = Object.entries(data.groups).map(([name, count], index) => ({
    name: name || '(Trống)',
    value: count,
    color: COLORS[index % COLORS.length],
  }))

  // Calculate total
  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  // Sort by value descending
  const sortedData = [...chartData].sort((a, b) => b.value - a.value)
  const topValue = sortedData[0]

  // Custom label for pie chart
  const renderCustomLabel = (entry: any) => {
    const percent = ((entry.value / total) * 100).toFixed(0)
    return `${percent}%`
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10" />
          <div className="relative">
            <p className="text-sm font-medium opacity-90">Tổng giá trị</p>
            <p className="mt-2 text-4xl font-bold">{total}</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 p-6 text-white shadow-lg">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10" />
          <div className="relative">
            <p className="text-sm font-medium opacity-90">Số nhóm</p>
            <p className="mt-2 text-4xl font-bold">{chartData.length}</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 p-6 text-white shadow-lg">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <p className="text-sm font-medium opacity-90">Phổ biến nhất</p>
            </div>
            <p className="mt-2 text-2xl font-bold truncate">{topValue?.name || '-'}</p>
            <p className="text-sm opacity-75">{topValue?.value || 0} lần</p>
          </div>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Phân bố dữ liệu</h3>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Cards */}
      <div className="grid grid-cols-2 gap-4">
        {sortedData.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1)
          return (
            <div
              key={index}
              className="relative overflow-hidden rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ backgroundColor: item.color }}
              />
              <div className="pl-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium truncate flex-1">{item.name}</p>
                  <div
                    className="h-3 w-3 rounded-full ml-2"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
                <div className="flex items-baseline gap-3">
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-sm text-muted-foreground">{percentage}%</p>
                </div>
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
