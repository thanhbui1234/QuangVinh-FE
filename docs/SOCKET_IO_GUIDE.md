# Socket.IO + React Query - Team Guide

## 📘 Tổng Quan

Hệ thống WebSocket sử dụng **Socket.IO** kết hợp với **React Query** để xử lý real-time notifications.

### Kiến Trúc

```
┌────────────────────────────────────────────────────────────┐
│ main.tsx                                                   │
│   └─ SocketProvider                                        │
│        ├─ useSocket() - Socket.IO connection               │
│        └─ React Query auto-invalidation                    │
├────────────────────────────────────────────────────────────┤
│ WebLayout (authenticated area)                             │
│   └─ useNotifications() - Listen & show toasts            │
├────────────────────────────────────────────────────────────┤
│ Components                                                 │
│   ├─ NotificationIcon - Bell với badge                     │
│   └─ useCheckNotiUnread() - React Query status            │
└────────────────────────────────────────────────────────────┘
                       ↕ Socket.IO
┌────────────────────────────────────────────────────────────┐
│ Backend Socket.IO Server                                   │
│   - Auto ping/pong (built-in)                              │
│   - Auto reconnect (built-in)                              │
│   - Emit 'notification' events                             │
└────────────────────────────────────────────────────────────┘
```

---

## 🚀 Setup Instructions

### 1. Environment Variable

Tạo file `.env.local` trong root project:

```bash
# Socket.IO server URL
VITE_SOCKET_URL=http://localhost:3000
```

**Production:**
```bash
VITE_SOCKET_URL=https://api.yourdomain.com
```

### 2. Install Dependencies

Socket.IO client đã có trong `package.json`:

```json
{
  "dependencies": {
    "socket.io-client": "^4.8.1"
  }
}
```

### 3. Restart Dev Server

```bash
yarn dev
```

---

## 📚 Core Concepts

### Socket.IO Auto Features

Socket.IO TỰ ĐỘNG xử lý:
- ✅ **Ping/Pong** - Heartbeat mỗi 25s
- ✅ **Auto-reconnect** - Exponential backoff khi mất kết nối
- ✅ **Binary support** - Gửi file/images
- ✅ **Room management** - Built-in room/namespace

**Bạn KHÔNG CẦN code:**
- ❌ Manual ping interval
- ❌ Reconnect logic
- ❌ Connection state tracking (Socket.IO handles it)

### React Query Integration

Khi nhận notification từ Socket.IO → Tự động invalidate queries:

```typescript
// SocketProvider.tsx
useEffect(() => {
  if (receiveMessageTime) {
    queryClient.invalidateQueries({
      queryKey: notificationsKeys.all  // ['notifications']
    })
  }
}, [receiveMessageTime])
```

**Flow:**
1. Backend emit `'notification'` event
2. Frontend nhận event → update `receiveMessageTime`
3. React Query detect change → invalidate
4. Tất cả components dùng `useQuery(['notifications'])` → auto refetch
5. UI update với data mới

---

## 💻 Usage Examples

### Example 1: Sử dụng Socket trong Component

```typescript
import { useSocketContext } from '@/providers/SocketProvider'

function MyComponent() {
  const { socket, isConnected } = useSocketContext()
  
  const sendMessage = () => {
    if (socket && isConnected) {
      socket.emit('custom-event', { 
        message: 'Hello from client' 
      })
    }
  }
  
  useEffect(() => {
    if (!socket) return
    
    // Listen custom event
    socket.on('custom-response', (data) => {
      console.log('Response:', data)
    })
    
    // Cleanup
    return () => {
      socket.off('custom-response')
    }
  }, [socket])
  
  return (
    <div>
      <p>Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>
      <button onClick={sendMessage}>Send Message</button>
    </div>
  )
}
```

### Example 2: Join Room

```typescript
function ChatRoom({ roomId }: { roomId: string }) {
  const { socket } = useSocketContext()
  
  useEffect(() => {
    if (!socket) return
    
    // Join room
    socket.emit('join-room', { roomId })
    
    // Listen messages in this room
    socket.on('room-message', (data) => {
      console.log('New message in room:', data)
    })
    
    // Cleanup: leave room
    return () => {
      socket.emit('leave-room', { roomId })
      socket.off('room-message')
    }
  }, [socket, roomId])
  
  return <div>Chat Room {roomId}</div>
}
```

### Example 3: Custom Notification Handler

```typescript
function OrderTrackingPage() {
  const { socket, receiveMessageTime, messages } = useSocketContext()
  
  useEffect(() => {
    if (!messages || !receiveMessageTime) return
    
    try {
      const data = JSON.parse(messages)
      
      // Only handle order-related notifications
      if (data.notification_type === 'order-confirmed') {
        toast.success(`Đơn hàng #${data.order_id} đã được xác nhận!`)
        // Navigate to order detail
        navigate(`/orders/${data.order_id}`)
      }
    } catch (error) {
      console.error('Failed to parse notification:', error)
    }
  }, [receiveMessageTime, messages])
  
  return <div>Order Tracking</div>
}
```

### Example 4: Emit với Acknowledgment

```typescript
function TaskAction() {
  const { socket } = useSocketContext()
  
  const completeTask = async (taskId: number) => {
    if (!socket) return
    
    // Emit với callback để nhận response ngay
    socket.emit('complete-task', { taskId }, (response) => {
      if (response.success) {
        toast.success('Task completed!')
      } else {
        toast.error(response.error)
      }
    })
  }
  
  return <button onClick={() => completeTask(123)}>Complete</button>
}
```

---

## 🎨 Best Practices

### 1. **Luôn check socket tồn tại**

```typescript
// ✅ GOOD
if (socket && isConnected) {
  socket.emit('event', data)
}

// ❌ BAD - Có thể null
socket.emit('event', data)
```

### 2. **Cleanup listeners trong useEffect**

```typescript
// ✅ GOOD
useEffect(() => {
  if (!socket) return
  
  socket.on('event', handler)
  
  return () => {
    socket.off('event', handler)  // ← Cleanup
  }
}, [socket])

// ❌ BAD - Memory leak
useEffect(() => {
  socket?.on('event', handler)
  // No cleanup!
}, [socket])
```

### 3. **Sử dụng constants cho event names**

```typescript
// constants/socket.ts
export const SOCKET_EVENTS = {
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  NOTIFICATION: 'notification',
} as const

// Component
socket.emit(SOCKET_EVENTS.JOIN_ROOM, { roomId })
```

### 4. **Type-safe với TypeScript**

```typescript
// types/socket.ts
interface TaskNotification {
  notification_type: 'task-assigned' | 'task-updated'
  task_id: number
  message: string
}

// Component
socket.on('notification', (data: TaskNotification) => {
  // TypeScript sẽ check type
  console.log(data.task_id)
})
```

### 5. **Không emit quá nhiều trong loop**

```typescript
// ❌ BAD - Spam server
items.forEach(item => {
  socket.emit('process-item', item)
})

// ✅ GOOD - Batch send
socket.emit('process-items', { items })
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Socket không connect

**Triệu chứng:**
- Console log: `Socket.IO Connection Error`
- `isConnected` luôn `false`

**Check:**
1. `VITE_SOCKET_URL` trong `.env.local` có đúng không?
2. Backend Socket.IO server có đang chạy không?
3. CORS policy có cho phép origin của frontend không?

**Debug:**
```typescript
const { socket, isConnected } = useSocketContext()

console.log('Socket:', socket)
console.log('Is connected:', isConnected)
console.log('URL:', import.meta.env.VITE_SOCKET_URL)
```

### Issue 2: Không nhận được notifications

**Triệu chứng:**
- Backend emit nhưng frontend không nhận

**Check:**
1. Event name có đúng không? (Backend emit `'notification'`, frontend listen `'notification'`)
2. Socket có connected chưa?
3. Có cleanup listener sớm không?

**Debug:**
```typescript
useEffect(() => {
  if (!socket) return
  
  socket.on('notification', (data) => {
    console.log('✅ Notification received:', data)  // ← Debug log
  })
  
  // Test: emit event để check connection
  socket.emit('ping', {}, (response) => {
    console.log('Ping response:', response)
  })
}, [socket])
```

### Issue 3: React Query không invalidate

**Triệu chứng:**
- Nhận được notification nhưng UI không update

**Check:**
1. `receiveMessageTime` có thay đổi không?
2. Query key có đúng không?

**Debug:**
```typescript
// SocketProvider.tsx
useEffect(() => {
  console.log('🔄 receiveMessageTime changed:', receiveMessageTime)
  console.log('📤 Invalidating:', notificationsKeys.all)
  
  if (receiveMessageTime) {
    queryClient.invalidateQueries({
      queryKey: notificationsKeys.all,
    })
  }
}, [receiveMessageTime])
```

### Issue 4: Token authentication không work

**Triệu chứng:**
- Socket connect nhưng backend reject vì không có token

**Solution:**
```typescript
// SocketProvider.tsx
const token = getTokenAuth()

useSocket(SOCKET_CONFIG.URL, {
  auth: { token },  // ← Socket.IO gửi token trong handshake
})
```

Backend nhận:
```javascript
io.use((socket, next) => {
  const token = socket.handshake.auth.token
  if (!token) {
    return next(new Error('No token'))
  }
  // Verify token...
  next()
})
```

---

## 📖 API Reference

### useSocketContext()

Hook để access Socket.IO instance và state.

```typescript
const {
  socket,              // Socket.IO instance
  isConnected,         // Connection status
  hasNewNoti,          // Flag có notification mới
  messages,            // Message mới nhất (JSON string)
  receiveMessageTime,  // Timestamp nhận message
  setUnread,           // Set hasNewNoti state
} = useSocketContext()
```

### useNotifications()

Hook tự động listen notifications và hiển thị toast.

```typescript
// Gọi trong layout
function WebLayout() {
  useNotifications()  // ← Auto listen & show toasts
  return <div>...</div>
}
```

### useCheckNotiUnread()

Hook check có notification chưa đọc (React Query).

```typescript
const {
  isUnread,        // boolean - có unread không
  notifications,   // array - danh sách notifications
  total,           // number - tổng số notifications
  isLoading,       // boolean - đang load
  error,           // Error object
} = useCheckNotiUnread()
```

---

## 🔐 Security Notes

### 1. Token Authentication

Token được gửi trong handshake đầu tiên, **KHÔNG gửi lại** sau khi connected.

```typescript
// ✅ GOOD - Token trong handshake
useSocket(url, {
  auth: { token: getTokenAuth() }
})

// ❌ BAD - Gửi token trong emit (không an toàn)
socket.emit('auth', { token })
```

### 2. Validate Data từ Server

Luôn validate/sanitize data nhận được:

```typescript
socket.on('notification', (data) => {
  try {
    // Validate structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data')
    }
    
    // Sanitize message (prevent XSS)
    const message = sanitizeHtml(data.message)
    toast.info(message)
  } catch (error) {
    console.error('Invalid notification:', error)
  }
})
```

---

## 📝 Summary - Quick Reference

### Khi nào dùng Socket.IO?
- ✅ Real-time notifications
- ✅ Chat/messaging
- ✅ Live updates (order tracking, dashboard)
- ✅ Collaborative editing

### Khi nào dùng REST API?
- ✅ CRUD operations
- ✅ File uploads
- ✅ Public APIs
- ✅ One-time actions

### Event Names Convention

```typescript
// Backend events (to client)
'notification'      // Notification mới
'message'           // Chat message
'update'            // Data update

// Client events (to server)
'join-room'         // Join room
'leave-room'        // Leave room
'message'           // Send message
```

### Files Structure

```
src/
├── hooks/
│   ├── useSocket.ts                 # Core Socket.IO hook
│   └── notifications/
│       ├── useNotifications.ts      # Toast listener
│       └── useCheckNotiUnread.ts    # React Query status
├── providers/
│   └── SocketProvider.tsx           # Context provider
├── components/
│   └── NotificationIcon.tsx         # UI component
├── constants/
│   └── socket.ts                    # Event names & config
└── types/
    └── socket.ts                    # TypeScript types
```

---

## 🎓 Learning Resources

- [Socket.IO Client Docs](https://socket.io/docs/v4/client-api/)
- [React Query + WebSocket](https://tanstack.com/query/latest/docs/guides/mutations)
- [Socket.IO Best Practices](https://socket.io/docs/v4/best-practices/)

---

**Có câu hỏi?** 
Hỏi lead hoặc check code examples trong codebase! 🚀
