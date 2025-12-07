// Document status enum
export enum DocumentStatus {
  ACTIVE = 0,
  DISABLED = 1,
  DELETED = 2,
  ARCHIVED = 3,
}

// Privacy level enum
export enum PrivacyLevel {
  PRIVATE = 0,
  PUBLIC = 1,
}

// Main Document interface
export interface Document {
  documentId: number
  title: string
  fileUrl: string
  sizeBytes: number
  contentType: string
  uploaderId: number
  uploaderName?: string
  viewableUserIds: number[]
  status: DocumentStatus
  privacyLevel: PrivacyLevel
  createdTime: number
  updatedTime: number
}

// Upload document payload
export interface UploadDocumentPayload {
  title: string
  fileUrl: string
  sizeBytes?: number
  contentType?: string
  uploaderId?: number
  viewableUserIds?: number[]
  status?: DocumentStatus
  privacyLevel?: PrivacyLevel
}

// API Response
export interface UploadDocumentResponse {
  documentId: number
}

// Get documents response
export interface GetDocumentsResponse {
  documents: Document[]
  total?: number
}
