import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import SectionTitle from './SectionTitle'
import { motion } from 'framer-motion'

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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      whileHover={
        onClick
          ? {
              y: -2,
              scale: 1.01,
            }
          : undefined
      }
    >
      <Card className="shadow-sm">
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
    </motion.div>
  )
}
