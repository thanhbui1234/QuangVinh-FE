import { type ReactNode, useState, useEffect, useMemo, useCallback, memo } from 'react'
import { Button } from '@/components/ui/button'
import {
  Home,
  FileText,
  CheckSquare,
  FileIcon,
  ChevronUp,
  ChevronLeft,
  Sparkles,
  Menu,
  Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocation, useNavigate } from 'react-router'
import { ModeToggle } from '@/components/ui/modeToggle'
import { AnimatePresence, motion } from 'framer-motion'
import { useIsMobile } from '@/hooks/use-mobile'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

type Props = {
  children?: ReactNode
}

export interface INavigateItems {
  id: string
  label?: string
  icon?: any
  active?: boolean
  href?: string
  hasSubmenu?: boolean
  expanded?: boolean
  roles?: string[]
  subItems?: { label: string; href: string; roles?: string[] }[]
}
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import BellNotification from '@/components/ui/bell'
import { ROLE } from '@/constants'
import { useAuthStore } from '@/stores/authStore'
import { useGetProfile } from '@/hooks/profile/useGetProfile'

const WebLayout = ({ children }: Props) => {
  // Enable real-time notifications
  // useNotifications()

  const isMobile = useIsMobile()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { profile: userProfile } = useGetProfile(user?.id)
  const userRoles = user?.roles || []
  const handleLogout = useCallback(() => {
    navigate('/profile')
  }, [navigate])

  const hasPermission = useCallback(
    (allowedRoles?: string[]) => {
      if (!allowedRoles || allowedRoles.length === 0) return true
      return allowedRoles.some((role: string) => userRoles.includes(role))
    },
    [userRoles]
  )

  const toggleExpanded = useCallback((itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }, [])

  const handleNavigate = useCallback(
    (item: INavigateItems) => {
      if (item.hasSubmenu) {
        toggleExpanded(item.id)
        return
      }

      if (item.href) {
        navigate(item.href)
      }
    },
    [toggleExpanded, navigate]
  )

  const handleSubItemNavigate = useCallback(
    (href: string) => {
      navigate(href)
    },
    [navigate]
  )

  // Function to get page title based on current pathname
  const getPageTitle = (pathname: string, items: INavigateItems[]): string => {
    // Special route mappings
    const specialRoutes: Record<string, string> = {
      '/personnel/positions': 'Vị trí',
      '/personnel/late-arrival': 'Quản lý đi muộn',
      '/tasks': 'Chi tiết công việc',
      '/profile': 'Cá nhân',
    }

    // Check special routes first
    if (specialRoutes[pathname]) {
      return specialRoutes[pathname]
    }

    // Check for exact match in subItems first
    for (const item of items) {
      if (item.subItems) {
        const subItem = item.subItems.find((sub) => sub.href === pathname)
        if (subItem) {
          return subItem.label
        }
      }
    }

    // Check for exact match in main items
    const exactMatch = items.find((item) => item.href === pathname)
    if (exactMatch) {
      return exactMatch.label || 'Dashboard'
    }

    // Check for pathname starts with
    const startsWithMatch = items.find((item) => {
      if (item.href && pathname.startsWith(item.href)) {
        // Make sure it's not a sub-item path
        if (item.subItems) {
          const hasSubItemMatch = item.subItems.some((sub) => pathname === sub.href)
          return !hasSubItemMatch
        }
        return true
      }
      return false
    })
    if (startsWithMatch) {
      return startsWithMatch.label || 'Dashboard'
    }

    // Handle dynamic routes
    if (pathname.startsWith('/tasks/')) {
      return 'Chi tiết công việc'
    }
    if (pathname.startsWith('/assignments/')) {
      return 'Chi tiết dự án'
    }
    if (pathname.startsWith('/work-boards/')) {
      return 'Chi tiết bảng công việc'
    }
    if (pathname.startsWith('/work-boards')) {
      return 'Bảng công việc'
    }
    if (pathname.startsWith('/filter/work-boards')) {
      return 'Bảng công việc'
    }
    if (pathname.startsWith('/profile')) {
      return 'Cá nhân'
    }

    return 'Dashboard'
  }

  useEffect(() => {
    const path = location.pathname

    const submenuMapping: Record<string, string[]> = {
      personnel: [
        '/personnel/list',
        '/personnel/leaves',
        '/personnel/late-arrival',
        '/personnel/positions',
      ],
      documents: ['/documents/my', '/documents/shared'],
      assignments: ['/assignments', '/work-boards'],
    }

    Object.entries(submenuMapping).forEach(([parentId, subPaths]) => {
      if (subPaths.some((subPath) => path === subPath)) {
        setExpandedItems((prev) => new Set(prev).add(parentId))
      }
    })
  }, [location.pathname])
  const filteredNavigationItems = useMemo(() => {
    const items: INavigateItems[] = [
      {
        id: 'dashboard',
        label: 'Tổng quan',
        icon: Home,
        active: location.pathname === '/dashboard',
        href: '/dashboard',
      },
      {
        id: 'personnel',
        label: 'Nhân sự',
        icon: FileText,
        active: location.pathname.startsWith('/personnel'),
        href: '/personnel',
        hasSubmenu: true,
        expanded: expandedItems.has('personnel'),
        roles: [ROLE.DIRECTOR, ROLE.MANAGER, ROLE.WORKER],
        subItems: [
          {
            label: 'Danh sách nhân sự',
            href: '/personnel/list',
            roles: [ROLE.DIRECTOR, ROLE.MANAGER],
          },
          {
            label: 'Quản lý lịch nghỉ',
            href: '/personnel/leaves',
            roles: [ROLE.MANAGER, ROLE.DIRECTOR, ROLE.WORKER],
          },
          {
            label: 'Quản lý đi muộn',
            href: '/personnel/late-arrival',
            roles: [ROLE.MANAGER, ROLE.DIRECTOR, ROLE.WORKER],
          },
          {
            label: 'Thêm nhân viên',
            href: '/personnel/member',
            roles: [ROLE.DIRECTOR],
          },
        ],
      },
      {
        id: 'assignments',
        label: 'Công việc',
        icon: CheckSquare,
        active:
          location.pathname.startsWith('/assignments') ||
          location.pathname.startsWith('/work-boards'),
        href: '/assignments',
        hasSubmenu: true,
        expanded: expandedItems.has('assignments'),
        subItems: [
          {
            label: 'Dự án',
            href: '/assignments',
          },
          {
            label: 'Bảng công việc',
            href: '/work-boards',
          },
          {
            label: 'Phân loại bảng công việc',
            href: '/filter/work-boards',
          },
        ],
      },
      {
        id: 'documents',
        label: 'Tài liệu',
        icon: FileIcon,
        hasSubmenu: true,
        expanded: expandedItems.has('documents'),
        href: '/documents',
        subItems: [
          { label: 'Tải tài liệu', href: '/documents/my', roles: [ROLE.DIRECTOR, ROLE.MANAGER] },
          { label: 'Tài liệu được chia sẻ', href: '/documents/shared' },
        ],
      },
    ]

    return items
      .filter((item) => hasPermission(item.roles))
      .map((item) => {
        if (item.subItems) {
          item.subItems = item.subItems.filter((sub) => hasPermission(sub.roles))
        }
        return item
      })
      .filter((item) => {
        if (!item.hasSubmenu) return true
        return Array.isArray(item.subItems) && item.subItems.length > 0
      })
  }, [location.pathname, expandedItems, userRoles])

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {!isMobile && (
        <motion.aside
          className={cn(
            'bg-card/70 backdrop-blur-xl border-r border-border/50 flex flex-col transition-all duration-300 ease-in-out relative z-30',
            isCollapsed ? 'w-20' : 'w-72'
          )}
          initial={false}
          animate={{
            width: isCollapsed ? 80 : 288,
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <NavContent
            isCollapsed={isCollapsed}
            navigationItems={filteredNavigationItems}
            userProfile={userProfile}
            userRoles={userRoles}
            setIsCollapsed={setIsCollapsed}
            handleLogout={handleLogout}
            handleNavigate={handleNavigate}
            handleSubItemNavigate={handleSubItemNavigate}
            expandedItems={expandedItems}
            location={location}
          />
        </motion.aside>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white/80 dark:bg-[#0c0c0e]/80 backdrop-blur-md border-b border-border/40 px-4 lg:px-8 py-4 flex items-center justify-between z-20 sticky top-0">
          <div className="flex items-center gap-4">
            {isMobile && (
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[280px] border-r-0">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Navigation Menu</SheetTitle>
                  </SheetHeader>
                  <NavContent
                    isMobileNav={true}
                    isCollapsed={false}
                    navigationItems={filteredNavigationItems}
                    userProfile={userProfile}
                    userRoles={userRoles}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                    handleLogout={handleLogout}
                    handleNavigate={handleNavigate}
                    handleSubItemNavigate={handleSubItemNavigate}
                    expandedItems={expandedItems}
                    location={location}
                  />
                </SheetContent>
              </Sheet>
            )}
            <h1 className="text-lg lg:text-xl font-bold tracking-tight text-foreground truncate max-w-[200px] lg:max-w-none">
              {getPageTitle(location.pathname, filteredNavigationItems)}
            </h1>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="hidden sm:flex items-center mr-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground rounded-full"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <ModeToggle />
            <BellNotification />
            {!isMobile && (
              <Avatar
                onClick={() => navigate('/profile')}
                className="cursor-pointer h-9 w-9 border border-border/20 shadow-sm transition-transform active:scale-95"
              >
                <AvatarImage src={userProfile?.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </header>

        <main className="flex-1 bg-[#fcfcfd] dark:bg-[#0c0c0e] relative overflow-auto p-0 scroll-smooth custom-scrollbar">
          {children}

          <motion.div
            className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-[40]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="icon"
              className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-primary hover:bg-primary/90 shadow-[0_8px_30px_rgb(var(--primary-rgb),0.3)] border border-primary/20 transition-all duration-300"
            >
              <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </Button>
          </motion.div>
        </main>
      </div>
    </div>
  )
}

interface NavContentProps {
  isMobileNav?: boolean
  isCollapsed: boolean
  navigationItems: INavigateItems[]
  userProfile: any
  userRoles: string[]
  setIsCollapsed?: (v: boolean) => void
  setIsMobileMenuOpen?: (v: boolean) => void
  handleLogout: () => void
  handleNavigate: (item: INavigateItems) => void
  handleSubItemNavigate: (href: string) => void
  expandedItems: Set<string>
  location: any
}

const NavContent = memo(
  ({
    isMobileNav = false,
    isCollapsed,
    navigationItems,
    userProfile,
    userRoles,
    setIsCollapsed,
    setIsMobileMenuOpen,
    handleNavigate,
    handleSubItemNavigate,
    expandedItems,
    location,
  }: NavContentProps) => {
    const navigate = useNavigate()

    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <div
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              navigate('/dashboard')
              if (isMobileNav && setIsMobileMenuOpen) setIsMobileMenuOpen(false)
            }}
          >
            <img
              src="/assets/icon/QuangVinhIconApp192.png"
              alt="Quang Vinh Mobile"
              className="h-9 w-9 rounded-xl object-contain shadow-sm ring-1 ring-border/50"
            />
            {(!isCollapsed || isMobileNav) && (
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground leading-tight">Quang Vinh</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                  Mobile App
                </span>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-none custom-scrollbar">
          {navigationItems.map((item: any, itemIndex: number) => (
            <motion.div
              key={item.id}
              initial={isMobileNav ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: itemIndex * 0.03, ease: 'easeOut' }}
            >
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start h-12 px-4 transition-all duration-300 ease-in-out group relative overflow-hidden',
                  item.active
                    ? 'bg-primary/10 text-primary font-bold after:absolute after:left-0 after:top-1/4 after:h-1/2 after:w-1 after:bg-primary after:rounded-r-full shadow-[0_4px_12px_rgba(var(--primary),0.1)]'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground hover:translate-x-1',
                  isCollapsed && !isMobileNav && 'px-2 justify-center'
                )}
                onClick={() => {
                  handleNavigate(item)
                  if (isMobileNav && !item.hasSubmenu && setIsMobileMenuOpen)
                    setIsMobileMenuOpen(false)
                }}
              >
                <item.icon
                  className={cn(
                    'w-5 h-5 transition-all duration-300 group-hover:scale-110',
                    item.active
                      ? 'text-primary'
                      : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />
                {(!isCollapsed || isMobileNav) && (
                  <>
                    <span className="ml-3 flex-1 text-left text-sm">{item.label}</span>
                    {item.hasSubmenu && (
                      <ChevronUp
                        className={cn(
                          'w-4 h-4 transition-transform duration-300 ease-in-out opacity-60',
                          item.expanded ? 'rotate-180' : 'rotate-90'
                        )}
                      />
                    )}
                  </>
                )}
              </Button>

              <AnimatePresence initial={false}>
                {item?.hasSubmenu &&
                  item?.subItems &&
                  (!isCollapsed || isMobileNav) &&
                  expandedItems.has(item.id) && (
                    <motion.div
                      key={`${item.id}-submenu`}
                      className="ml-6 mt-1 border-l border-border/40 pl-2 space-y-1 overflow-hidden"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                      {item?.subItems?.map((subItem: any, index: number) => {
                        const isSubItemActive = location.pathname === subItem.href
                        return (
                          <motion.div
                            key={subItem.href ?? index}
                            initial={isMobileNav ? { opacity: 1, x: 0 } : { opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -6 }}
                            transition={{ duration: 0.2, delay: index * 0.03, ease: 'easeOut' }}
                          >
                            <Button
                              variant="ghost"
                              className={cn(
                                'w-full justify-start h-10 px-4 text-[13px] transition-all duration-200 transform hover:translate-x-1',
                                isSubItemActive
                                  ? 'bg-primary/5 text-primary font-semibold'
                                  : 'text-muted-foreground hover:bg-accent/30 hover:text-foreground'
                              )}
                              onClick={() => {
                                handleSubItemNavigate(subItem.href)
                                if (isMobileNav && setIsMobileMenuOpen) setIsMobileMenuOpen(false)
                              }}
                            >
                              <span className="truncate">{subItem.label}</span>
                            </Button>
                          </motion.div>
                        )
                      })}
                    </motion.div>
                  )}
              </AnimatePresence>
            </motion.div>
          ))}
        </nav>

        <div className="p-4 border-t border-border/50 bg-accent/10">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/50 dark:bg-white/5 border border-border/10">
            {(!isCollapsed || isMobileNav) && (
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-bold text-foreground truncate leading-none mb-1">
                  {userProfile?.name || 'User'}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium truncate uppercase tracking-tighter">
                  {userRoles[0] || 'Member'}
                </p>
              </div>
            )}
          </div>
          {!isMobileNav && setIsCollapsed && (
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start h-10 px-4 mt-4 text-muted-foreground hover:bg-accent/50 rounded-xl transition-all',
                isCollapsed && 'px-0 justify-center'
              )}
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <ChevronLeft
                className={cn(
                  'w-5 h-5 transition-transform duration-300 ease-in-out',
                  isCollapsed && 'rotate-180'
                )}
              />
              {!isCollapsed && (
                <span className="ml-3 text-xs font-bold uppercase tracking-widest">Thu gọn</span>
              )}
            </Button>
          )}
        </div>
      </div>
    )
  }
)

export default WebLayout
