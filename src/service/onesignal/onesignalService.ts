import { API_ENDPOINT } from '@/common/apiEndpoint'
import { POST } from '@/core/api'
import { isAuthenticated } from '@/utils/auth'

export async function getOneSignalPlayerId(): Promise<string | null> {
  if (typeof window === 'undefined' || !window.OneSignal) {
    return null
  }

  try {
    const OneSignal = window.OneSignal
    const playerId = await OneSignal.User.PushSubscription.id
    return playerId || null
  } catch (error) {
    console.error('Error getting OneSignal Player ID:', error)
    return null
  }
}

export async function sendPlayerIdToDashboard(playerId: string): Promise<boolean> {
  if (!isAuthenticated()) {
    console.log('User chưa đăng nhập, không gửi Player ID')
    return false
  }

  try {
    await POST(API_ENDPOINT.NOTIFICATION_SUBSCRIBE, {
      playerId,
    })
    console.log('Đã gửi Player ID lên dashboard thành công:', playerId)
    return true
  } catch (error) {
    console.error('Lỗi khi gửi Player ID lên dashboard:', error)
    return false
  }
}

export async function registerPlayerIdToDashboard(): Promise<boolean> {
  if (!isAuthenticated()) {
    console.log('User chưa đăng nhập, không đăng ký Player ID')
    return false
  }

  const playerId = await getOneSignalPlayerId()
  if (!playerId) {
    console.log('Chưa có Player ID, đợi OneSignal khởi tạo...')
    return false
  }

  return await sendPlayerIdToDashboard(playerId)
}
