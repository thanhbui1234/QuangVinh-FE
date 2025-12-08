export const PRIVACY = {
  PUBLIC: 1,
  PRIVATE: 2,
}

export const PRIVACY_LABEL = {
  PUBLIC: 'Công khai',
  PRIVATE: 'Riêng tư',
}

export type PRIVACY_TYPE = keyof typeof PRIVACY

export const STATUS_PROJECT = {
  CREATED: 1,
  PENDING: 4,
  IN_PROGRESS: 8,
  COMPLETED: 9,
}

export type STATUS_PROJECT_TYPE = keyof typeof STATUS_PROJECT
