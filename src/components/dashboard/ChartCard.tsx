import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import SectionTitle from './SectionTitle'

interface ChartCardProps {
  title: string
  icon?: React.ReactNode
  badgeText?: string
  children: React.ReactNode
  onClick?: () => void
  contentClassName?: string
}

export default function ChartCard({
  title,
  icon,
  badgeText,
  children,
  onClick,
  contentClassName,
}: ChartCardProps) {
  return (
    <Card>
      <CardContent className={contentClassName ?? 'p-3 sm:p-4'}>
        <div className="mb-3 flex items-center justify-between">
          <SectionTitle title={title} icon={icon} />
          {badgeText && <Badge variant="outline">{badgeText}</Badge>}
        </div>
        <div
          role={onClick ? 'button' : undefined}
          aria-label={onClick ? title : undefined}
          className={onClick ? 'cursor-pointer' : undefined}
          onClick={onClick}
        >
          {children}
        </div>
      </CardContent>
    </Card>
  )
}
