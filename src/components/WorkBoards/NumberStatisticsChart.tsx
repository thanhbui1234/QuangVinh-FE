import React from 'react'
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, PolarAngleAxis } from 'recharts'
import { TrendingUp, TrendingDown, Hash, Sigma, Target } from 'lucide-react'

interface NumberStatistics {
  count: number
  min: number
  max: number
  avg: number
  sum: number
}

interface NumberStatisticsChartProps {
  data: NumberStatistics
}

export const NumberStatisticsChart: React.FC<NumberStatisticsChartProps> = ({ data }) => {
  const formatShort = (num: number) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M'
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K'
    return num.toLocaleString('vi-VN')
  }

  const fullFormat = (num: number) => num.toLocaleString('vi-VN')

  // Log scale cho chart
  const safeLog = (v: number) => Math.log10(Math.max(1, v))
  const logMax = safeLog(data.max)

  const chartData = [
    { name: 'Nhỏ nhất', value: safeLog(data.min), fill: '#ef4444', raw: data.min },
    { name: 'Trung bình', value: safeLog(data.avg), fill: '#3b82f6', raw: data.avg },
    { name: 'Lớn nhất', value: logMax, fill: '#10b981', raw: data.max },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard icon={<Hash />} label="Số lượng" value={data.count} />
        <StatCard
          icon={<TrendingDown />}
          label="Nhỏ nhất"
          value={formatShort(data.min)}
          full={fullFormat(data.min)}
          color="red"
        />
        <StatCard
          icon={<Target />}
          label="Trung bình"
          value={formatShort(data.avg)}
          full={fullFormat(data.avg)}
          color="cyan"
        />
        <StatCard
          icon={<TrendingUp />}
          label="Lớn nhất"
          value={formatShort(data.max)}
          full={fullFormat(data.max)}
          color="green"
        />
        <StatCard
          icon={<Sigma />}
          label="Tổng"
          value={formatShort(data.sum)}
          full={fullFormat(data.sum)}
          color="purple"
        />
      </div>

      {/* Radial Chart */}
      <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">So sánh giá trị (thang log)</h3>
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
              <PolarAngleAxis
                type="number"
                domain={[0, logMax]}
                tickFormatter={(v) => `10^${v}`}
                tickCount={5}
                tick={false}
              />
              <RadialBar
                dataKey="value"
                background
                cornerRadius={10}
                label={{
                  position: 'insideStart',
                  fill: '#fff',
                  fontSize: 13,
                  formatter: (v: any) => `10^${v.toFixed(1)}`,
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

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <InsightCard
          label="Khoảng giá trị"
          value={`${formatShort(data.max - data.min)}`}
          detail={`từ ${fullFormat(data.min)} → ${fullFormat(data.max)}`}
        />
        <InsightCard
          label="Tỷ lệ max/tổng"
          value={`${((data.max / data.sum) * 100).toFixed(1)}%`}
          detail="→ lệch mạnh"
        />
        <InsightCard
          label="Avg bỏ max"
          value={formatShort((data.sum - data.max) / (data.count - 1))}
          detail="tránh outlier"
        />
      </div>
    </div>
  )
}

const StatCard = ({ icon, label, value, full, color = 'blue' }: any) => {
  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    red: 'from-red-500 to-red-600',
    cyan: 'from-cyan-500 to-cyan-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
  }

  const gradientClass = colorMap[color] || colorMap.blue

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradientClass} p-5 text-white shadow-lg`}
    >
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-20 w-20 rounded-full bg-white/10" />
      <div className="relative">
        {React.cloneElement(icon, { className: 'h-5 w-5 mb-2 opacity-90' })}
        <p className="text-xs font-medium opacity-75 uppercase tracking-wide">{label}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
        {full && value !== full && <p className="text-xs opacity-75 mt-1">{full}</p>}
      </div>
    </div>
  )
}

const InsightCard = ({ label, value, detail }: any) => (
  <div className="rounded-lg border bg-card p-5 shadow-sm">
    <p className="text-muted-foreground">{label}</p>
    <p className="text-2xl font-bold mt-1">{value}</p>
    <p className="text-xs text-muted-foreground mt-2">{detail}</p>
  </div>
)
