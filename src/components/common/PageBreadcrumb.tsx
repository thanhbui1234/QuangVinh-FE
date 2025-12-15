import { Fragment } from 'react'
import { useLocation, Link } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useIsMobile } from '@/hooks/use-mobile'

type BreadcrumbConfig = {
  label: string
  href?: string
}

const routeBreadcrumbMap: Record<string, BreadcrumbConfig[]> = {
  '/dashboard': [{ label: 'Trang chủ' }],
  '/personnel/list': [
    { label: 'Trang chủ', href: '/dashboard' },
    { label: 'Nhân sự' },
    { label: 'Danh sách nhân sự' },
  ],
  '/personnel/leaves': [
    { label: 'Trang chủ', href: '/dashboard' },
    { label: 'Nhân sự' },
    { label: 'Quản lý nghỉ phép' },
  ],
  '/personnel/positions': [
    { label: 'Trang chủ', href: '/dashboard' },
    { label: 'Nhân sự' },
    { label: 'Vị trí' },
  ],
  '/documents': [{ label: 'Trang chủ', href: '/dashboard' }, { label: 'Tài liệu' }],
  '/documents/my': [
    { label: 'Trang chủ', href: '/dashboard' },
    { label: 'Tài liệu', href: '/documents' },
    { label: 'Tải tài liệu' },
  ],
  '/documents/shared': [
    { label: 'Trang chủ', href: '/dashboard' },
    { label: 'Tài liệu', href: '/documents' },
    { label: 'Tài liệu được chia sẻ' },
  ],
  '/assignments': [
    { label: 'Trang chủ', href: '/dashboard' },
    { label: 'Công việc' },
    { label: 'Dự án' },
  ],
  '/work-boards': [
    { label: 'Trang chủ', href: '/dashboard' },
    { label: 'Công việc', href: '/assignments' },
    { label: 'Bảng công việc' },
  ],
  '/notifications': [{ label: 'Trang chủ', href: '/dashboard' }, { label: 'Thông báo' }],
}

function getBreadcrumbForPath(pathname: string): BreadcrumbConfig[] {
  if (routeBreadcrumbMap[pathname]) return routeBreadcrumbMap[pathname]

  if (pathname.startsWith('/assignments/')) {
    return [
      { label: 'Trang chủ', href: '/dashboard' },
      { label: 'Công việc', href: '/assignments' },
      { label: 'Chi tiết dự án' },
    ]
  }

  if (pathname.startsWith('/work-boards/')) {
    return [
      { label: 'Trang chủ', href: '/dashboard' },
      { label: 'Công việc', href: '/assignments' },
      { label: 'Chi tiết bảng công việc' },
    ]
  }

  if (pathname.startsWith('/tasks/')) {
    return [
      { label: 'Trang chủ', href: '/dashboard' },
      { label: 'Công việc', href: '/assignments' },
      { label: 'Chi tiết công việc' },
    ]
  }

  if (pathname.startsWith('/profile')) {
    return [{ label: 'Trang chủ', href: '/dashboard' }, { label: 'Cá nhân' }]
  }

  return [{ label: 'Trang chủ', href: '/dashboard' }]
}

export const PageBreadcrumb = () => {
  const location = useLocation()
  const isMobile = useIsMobile()
  const items = getBreadcrumbForPath(location.pathname)

  // Chỉ hiển thị trên PC
  if (isMobile) return null
  if (!items || items.length === 0) return null

  return (
    <Breadcrumb className="mb-3">
      <BreadcrumbList>
        {items.map((item, index) => (
          <Fragment key={`${item.label}-${index}`}>
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink asChild>
                  <Link
                    to={item.href}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < items.length - 1 && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default PageBreadcrumb
