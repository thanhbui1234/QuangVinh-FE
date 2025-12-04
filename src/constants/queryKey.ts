import { QUERY_KEY_TYPE } from './common'

interface QueryKeyConfig<T extends string | number> {
  readonly all: readonly [string]
  readonly getAll: readonly [string, string]
  list: (filters: object) => readonly [string, typeof QUERY_KEY_TYPE.LIST, object]
  detail: (id: T) => readonly [string, typeof QUERY_KEY_TYPE.DETAIL, T]
}

export function createQueryKeys<T extends string | number>(baseName: string): QueryKeyConfig<T> {
  return {
    all: [baseName] as const,
    getAll: [baseName, QUERY_KEY_TYPE.GET_ALL] as const,
    list: (filters: object) => [baseName, QUERY_KEY_TYPE.LIST, filters] as const,
    detail: (id: T) => [baseName, QUERY_KEY_TYPE.DETAIL, id] as const,
  }
}

// Query keys for notifications
export const notificationsKeys = createQueryKeys<number>('notifications')
