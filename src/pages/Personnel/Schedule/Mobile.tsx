import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import LeavesMobile from '../Leaves/Mobile'
import LateArrivalMobile from '../LateArrival/Mobile'
import { motion, AnimatePresence } from 'framer-motion'

export default function ScheduleMobile() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')

  // Determine initial tab based on URL search params
  const getInitialTab = (): 'leaves' | 'late-arrival' => {
    if (tabParam === 'late-arrival') return 'late-arrival'
    if (tabParam === 'leaves') return 'leaves'
    return 'leaves'
  }

  const [activeTab, setActiveTab] = useState<'leaves' | 'late-arrival'>(getInitialTab)

  // Update tab if URL param changes
  useEffect(() => {
    if (tabParam === 'late-arrival' || tabParam === 'leaves') {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'leaves' | 'late-arrival')
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set('tab', value)
    setSearchParams(newSearchParams, { replace: true })
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Tab Switcher - Sticky at top */}
      <div className="sticky top-[calc(env(safe-area-inset-top)+56px)] z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-2 pt-2 px-4 border-b">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="leaves" className="flex-1">
              Lịch nghỉ
            </TabsTrigger>
            <TabsTrigger value="late-arrival" className="flex-1">
              Đi muộn
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Content */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'leaves' ? (
            <motion.div
              key="leaves"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 overflow-y-auto"
            >
              <LeavesMobile />
            </motion.div>
          ) : (
            <motion.div
              key="late-arrival"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 overflow-y-auto"
            >
              <LateArrivalMobile />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
