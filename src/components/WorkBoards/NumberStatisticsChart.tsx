import React from 'react'
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, PolarAngleAxis } from 'recharts'
import type { NumberStatistics } from '@/types/ColumnStatistics'
import { TrendingUp, TrendingDown, Hash, Sigma, Target } from 'lucide-react'

interface NumberStatisticsChartProps {
  data: NumberStatistics
}

export const NumberStatisticsChart: React.FC<NumberStatisticsChartProps> = ({ data }) => {
  // Normalize data for radial chart (0-100 scale)
  const maxValue = Math.max(data.max, Math.abs(data.min))
  const chartData = [
    {
      name: 'Nhỏ nhất',
      value: data.min,
      fill: '#ef4444',
      displayValue: data.min,
    },
    {
      name: 'Trung bình',
      value: data.avg,
      fill: '#3b82f6',
      displayValue: data.avg,
    },
    {
      name: 'Lớn nhất',
      value: data.max,
      fill: '#10b981',
      displayValue: data.max,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-white shadow-lg">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-20 w-20 rounded-full bg-white/10" />
          <div className="relative">
            <Hash className="h-5 w-5 mb-2 opacity-90" />
            <p className="text-xs font-medium opacity-75 uppercase tracking-wide">Số lượng</p>
            <p className="text-3xl font-bold mt-1">{data.count}</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-5 text-white shadow-lg">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-20 w-20 rounded-full bg-white/10" />
          <div className="relative">
            <TrendingDown className="h-5 w-5 mb-2 opacity-90" />
            <p className="text-xs font-medium opacity-75 uppercase tracking-wide">Nhỏ nhất</p>
            <p className="text-3xl font-bold mt-1">{data.min}</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 p-5 text-white shadow-lg">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-20 w-20 rounded-full bg-white/10" />
          <div className="relative">
            <Target className="h-5 w-5 mb-2 opacity-90" />
            <p className="text-xs font-medium opacity-75 uppercase tracking-wide">Trung bình</p>
            <p className="text-3xl font-bold mt-1">{data.avg.toFixed(2)}</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-5 text-white shadow-lg">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-20 w-20 rounded-full bg-white/10" />
          <div className="relative">
            <TrendingUp className="h-5 w-5 mb-2 opacity-90" />
            <p className="text-xs font-medium opacity-75 uppercase tracking-wide">Lớn nhất</p>
            <p className="text-3xl font-bold mt-1">{data.max}</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-5 text-white shadow-lg">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-20 w-20 rounded-full bg-white/10" />
          <div className="relative">
            <Sigma className="h-5 w-5 mb-2 opacity-90" />
            <p className="text-xs font-medium opacity-75 uppercase tracking-wide">Tổng</p>
            <p className="text-3xl font-bold mt-1">{data.sum}</p>
          </div>
        </div>
      </div>

      {/* Radial Chart */}
      <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">So sánh giá trị</h3>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="20%"
              outerRadius="90%"
              data={chartData}
              startAngle={180}
              endAngle={0}
            >
              <PolarAngleAxis type="number" domain={[0, maxValue]} angleAxisId={0} tick={false} />
              <RadialBar
                background
                dataKey="value"
                cornerRadius={10}
                label={{
                  position: 'insideStart',
                  fill: '#fff',
                  fontSize: 14,
                  fontWeight: 'bold',
                  formatter: (value: any) => value.toFixed(1),
                }}
              />
              <Legend
                iconSize={12}
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: '20px' }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Khoảng giá trị</p>
              <p className="text-2xl font-bold">{data.max - data.min}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              Từ <span className="font-semibold text-foreground">{data.min}</span> đến{' '}
              <span className="font-semibold text-foreground">{data.max}</span>
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trung vị ước tính</p>
              <p className="text-2xl font-bold">{((data.min + data.max) / 2).toFixed(2)}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground">Giá trị giữa min và max</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Sigma className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trung bình/giá trị</p>
              <p className="text-2xl font-bold">{(data.sum / data.count).toFixed(2)}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              Tổng <span className="font-semibold text-foreground">{data.sum}</span> /{' '}
              <span className="font-semibold text-foreground">{data.count}</span> giá trị
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
