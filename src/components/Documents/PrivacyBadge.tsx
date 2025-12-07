import { Badge } from '@/components/ui/badge'
import { Lock, Globe } from 'lucide-react'
import { PrivacyLevel } from '@/types/Document'

interface PrivacyBadgeProps {
  privacyLevel: PrivacyLevel
}

export const PrivacyBadge = ({ privacyLevel }: PrivacyBadgeProps) => {
  if (privacyLevel === PrivacyLevel.PRIVATE) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Lock className="w-3 h-3" />
        Riêng tư
      </Badge>
    )
  }

  return (
    <Badge variant="default" className="gap-1 bg-green-500">
      <Globe className="w-3 h-3" />
      Công khai
    </Badge>
  )
}
