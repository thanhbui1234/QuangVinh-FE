import { Outlet, useLocation } from 'react-router'
import { useEffect } from 'react'
import MobileBottomNav from '@/components/ui/mobile-bottom-nav'
import { ScrollArea } from '@/components/ui/scroll-area'
import MobileHeader from '@/components/ui/mobile-header'
import { useRouteTitle } from '@/hooks/useRouteTitle'

const MobileLayout = () => {
  const title = useRouteTitle()
  const location = useLocation()

  // Scroll to top when route changes
  useEffect(() => {
    // Find the scroll area viewport and scroll to top
    const scrollArea = document.querySelector('[data-slot="scroll-area"]')
    if (scrollArea) {
      const viewport = scrollArea.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement
      if (viewport) {
        viewport.scrollTo({ top: 0, behavior: 'instant' })
      }
    }
  }, [location.pathname])

  return (
    <div className="relative flex flex-col min-h-screen bg-background">
      <MobileHeader title={title} />
      <ScrollArea className="flex-1">
        <main className="px-4 min-h-screen pb-[calc(env(safe-area-inset-bottom)+72px)] pt-[calc(env(safe-area-inset-top)+56px)]">
          <Outlet key={location.pathname} />
        </main>
      </ScrollArea>

      <div className="fixed bottom-0 left-0 right-0 z-[100]">
        <MobileBottomNav />
      </div>
    </div>
  )
}

export default MobileLayout
