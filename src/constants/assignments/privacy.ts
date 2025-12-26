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
  IN_PROGRESS: 2,
  COMPLETED: 3,
}

export type STATUS_PROJECT_TYPE = keyof typeof STATUS_PROJECT
