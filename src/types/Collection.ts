export interface ICollection {
  id: number
  name: string
  desc: string
  status: number // 1 active , 2 inactive, 3 archived
  createdAt?: string
  updatedAt?: string
}

export interface ICollectionResponse {
  id: number
  name: string
  description: string
  status: number // 1 active , 2 inactive, 3 archived
  createdAt?: string
  updatedAt?: string
  snapshotSheets?: any[] // Using any[] for now to avoid circular dependency, or better import SnapshotSheet if possible
}
export interface ICreateCollectionRequest {
  name: string
  desc: string
  status: number
}

export interface IUpdateCollectionRequest {
  id: number
  name?: string
  desc?: string
  status?: number
}
