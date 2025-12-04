// Socket.IO constants
export const SOCKET_CONFIG = {
  // Socket.IO server URL - sử dụng env variable
  URL: import.meta.env.VITE_BASE_URL,

  // Socket.IO reconnection config (auto-handled by Socket.IO)
  RECONNECTION_DELAY: 1000,
  RECONNECTION_DELAY_MAX: 5000,
  RECONNECTION_ATTEMPTS: 5,
  TIMEOUT: 10000,
} as const

// Socket.IO event names
export const SOCKET_EVENTS = {
  // Connection events (built-in)
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',

  // Custom events
  NOTIFICATION: 'notification',
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  MESSAGE: 'message',
} as const

// Notification types
export const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: 'task-assigned',
  TASK_UPDATED: 'task-updated',
  TASK_COMPLETED: 'task-completed',
  TASK_DELETED: 'task-deleted',
  COMMENT_ADDED: 'comment-added',
} as const
