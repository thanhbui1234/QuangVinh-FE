import { useLocation } from 'react-router'

export type TitleGetter = (pathname: string) => string | undefined

const defaultMap: Record<string, string> = {
  '/mobile/dashboard': 'Trang chủ',
  '/assignments': 'Công việc',
  '/mobile/schedule': 'Lịch nghỉ',
  '/mobile/leaves': 'Lịch nghỉ',
  '/mobile/late-arrival': 'Lịch nghỉ',
  '/mobile/documents': 'Tài liệu',
  '/profile': 'Cá nhân',
  '/mobile/notifications': 'Thông báo',
}

const defaultGetter: TitleGetter = (pathname: string) => {
  if (defaultMap[pathname]) return defaultMap[pathname]
  const match = Object.keys(defaultMap).find((key) => pathname.startsWith(key))
  return match ? defaultMap[match] : undefined
}

export function useRouteTitle(getTitle?: TitleGetter, fallback: string = 'Ứng dụng') {
  const location = useLocation()
  const getter = getTitle ?? defaultGetter
  return getter(location.pathname) ?? fallback
}
