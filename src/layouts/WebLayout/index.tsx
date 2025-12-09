import { type ReactNode, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Home,
  FileText,
  CheckSquare,
  FileIcon,
  ChevronUp,
  Plus,
  ChevronLeft,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocation, useNavigate } from 'react-router'

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
import { EnablePushButton } from '@/components/ui/enable-push-button'
import { ROLE } from '@/constants'
import { useNotifications } from '@/hooks/notifications/useNotifications'
import { useAuthStore } from '@/stores/authStore'

const WebLayout = ({ children }: Props) => {
  // Enable real-time notifications
  useNotifications()

  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const location = useLocation()
  const navigate = useNavigate()

  const { user } = useAuthStore()
  const userRoles = user?.roles || []
  const handleLogout = () => {
    navigate('/profile')
  }

  const hasPermission = (allowedRoles?: string[]) => {
    if (!allowedRoles || allowedRoles.length === 0) return true // không truyền gì => mọi role đều có quyền
    return allowedRoles.some((role: string) => userRoles.includes(role))
  }
  const toggleExpanded = (item: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(item)) {
      newExpanded.delete(item)
    } else {
      newExpanded.add(item)
    }
    setExpandedItems(newExpanded)
  }

  const handleNavigate = (item: INavigateItems) => {
    if (item.hasSubmenu) {
      toggleExpanded(item.id)
      return
    }

    if (item.href) {
      navigate(item.href)
    }
  }

  const handleSubItemNavigate = (href: string) => {
    navigate(href)
  }

  // Function to get page title based on current pathname
  const getPageTitle = (pathname: string, items: INavigateItems[]): string => {
    // Special route mappings
    const specialRoutes: Record<string, string> = {
      '/personnel/positions': 'Vị trí',
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
    if (pathname.startsWith('/profile')) {
      return 'Cá nhân'
    }

    return 'Dashboard'
  }

  useEffect(() => {
    const path = location.pathname

    const submenuMapping: Record<string, string[]> = {
      personnel: ['/personnel/list', '/personnel/leaves', '/personnel/positions'],
      documents: ['/documents/my', '/documents/shared'],
      // 'assignments': ['/assignments/pending', '/assignments/completed'],
    }

    Object.entries(submenuMapping).forEach(([parentId, subPaths]) => {
      if (subPaths.some((subPath) => path === subPath)) {
        setExpandedItems((prev) => new Set(prev).add(parentId))
      }
    })
  }, [location.pathname])
  let navigationItems: INavigateItems[] = [
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
      href: '/assignments',
    },
    {
      id: 'documents',
      label: 'Tài liệu',
      icon: FileIcon,
      hasSubmenu: true,
      expanded: expandedItems.has('documents'),
      href: '/documents',
      subItems: [
        { label: 'Tải tài liệu', href: '/documents/my' },
        { label: 'Tài liệu được chia sẻ', href: '/documents/shared' },
      ],
    },
  ]

  // If a group has no subItems (after filtering), hide the group
  navigationItems = navigationItems
    .filter((item) => hasPermission(item.roles)) // chỉ hiển thị menu có quyền
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

  return (
    <div className="flex h-screen bg-gray-50 ">
      <div
        className={cn(
          'bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-18' : 'w-80'
        )}
      >
        <div className="p-6 border-b border-gray-200">
          <div
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/dashboard')}
          >
            {!isCollapsed && (
              <span className="text-xl font-bold text-gray-900">Quang vinh Mobile</span>
            )}
            {isCollapsed && <Home className="w-6 h-6 text-gray-900" />}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item: any) => (
            <div key={item.id}>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start h-12 px-4 text-gray-700 transition-all duration-200 ease-in-out hover:bg-blue-50 hover:text-blue-700 hover:translate-x-1 group',
                  item.active && 'bg-blue-50 text-blue-700',
                  isCollapsed && 'px-2'
                )}
                onClick={() => handleNavigate(item)}
              >
                <item.icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                {!isCollapsed && (
                  <>
                    <span className="ml-3 flex-1 text-left">{item.label}</span>
                    {item.hasSubmenu && (
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4 transition-transform duration-300" />
                        <ChevronUp
                          className={cn(
                            'w-4 h-4 transition-transform duration-300 ease-in-out',
                            item.expanded ? 'rotate-180' : ''
                          )}
                        />
                      </div>
                    )}
                  </>
                )}
              </Button>

              {item?.hasSubmenu && item?.subItems && !isCollapsed && expandedItems.has(item.id) && (
                <div
                  className="ml-8 mt-2 space-y-1 overflow-hidden"
                  style={{
                    animation: 'slideDown 0.3s ease-out',
                  }}
                >
                  {item?.subItems?.map((subItem: any, index: number) => {
                    const isSubItemActive = location.pathname === subItem.href
                    return (
                      <Button
                        key={index}
                        variant="ghost"
                        className={cn(
                          'w-full justify-start h-10 px-4 text-sm transition-all duration-200 ease-in-out transform hover:translate-x-1 hover:shadow-sm',
                          isSubItemActive
                            ? 'bg-blue-50 text-blue-700 font-medium shadow-sm'
                            : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                        )}
                        onClick={() => handleSubItemNavigate(subItem.href)}
                        style={{
                          animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
                        }}
                      >
                        <span className="transition-colors duration-200">{subItem.label}</span>
                      </Button>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            className="w-full justify-start h-12 px-4 text-gray-700 hover:bg-gray-50"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <ChevronLeft
              className={cn(
                'w-5 h-5 transition-transform duration-300 ease-in-out',
                isCollapsed && 'rotate-180'
              )}
            />
            {!isCollapsed && <span className="ml-3">Thu gọn sidebar</span>}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              {getPageTitle(location.pathname, navigationItems)}
            </h1>
            <div className="flex items-center gap-10">
              <BellNotification />
              <EnablePushButton />
              <Avatar onClick={() => handleLogout()} className="cursor-pointer">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1 bg-gray-50 relative overflow-auto p-1 h-[calc(100vh-64px)]">
          {children}

          <div className="fixed bottom-6 right-6">
            <Button
              size="icon"
              className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg"
            >
              <Sparkles className="w-6 h-6 text-white" />
            </Button>
          </div>
        </main>
      </div>
    </div>
  )
}

export default WebLayout
