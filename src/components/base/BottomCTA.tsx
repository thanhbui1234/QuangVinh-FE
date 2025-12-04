import React from 'react'
import { Button } from '@/components/ui/button'

type BottomCTAProps = {
  label: string
  onClick: () => void
  icon?: React.ReactNode
  visible?: boolean
  bottomOffsetClassName?: string
}

export const BottomCTA: React.FC<BottomCTAProps> = ({
  label,
  onClick,
  icon,
  visible = true,
  bottomOffsetClassName,
}) => {
  if (!visible) return null
  return (
    <div
      className={`fixed inset-x-0 z-[60] bg-transparent ${bottomOffsetClassName ?? 'bottom-16'}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="px-4">
        <Button
          onClick={onClick}
          className="w-full h-12 rounded-full bg-blue-600 hover:bg-blue-600/90 text-white shadow-lg"
        >
          {icon}
          {icon && <span className="mr-1" />}
          {label}
        </Button>
      </div>
    </div>
  )
}

export default BottomCTA
