import SonnerToaster from '@/components/ui/toaster'
import { ERROR_CODE } from '@/common/errorCode'
import { getErrorMessage } from '@/common/errorMsg'

const getErrorCode = (error: any): number => {
  if (error?.response?.data?.error?.code !== undefined) return error.response.data.error.code
  const status = error?.status || error?.response?.status
  if (status === 401) return ERROR_CODE.UNAUTHORIZED
  if (status === 403) return ERROR_CODE.FORBIDDEN
  if (status === 404) return ERROR_CODE.RESOURCE_NOT_FOUND
  if (status === 500) return ERROR_CODE.SERVER_ERROR

  // Mặc định trả về SERVER_ERROR khi không có error code cụ thể
  return ERROR_CODE.SERVER_ERROR
}

/**
 *
 * @example
 * // Cách dùng
 * handleCommonError(error)
 *
 * // Custom message
 * handleCommonError(error, 'Đăng nhập thất bại')
 *
 * // Với callback
 * handleCommonError(error, 'Đăng nhập thất bại', (code) => {
 *   if (code === ERROR_CODE.UNAUTHORIZED) {
 *     navigate('/login')
 *   }
 * })
 */
const handleCommonError = (
  error?: any,
  customMessage?: string,
  onError?: (code: number) => void
) => {
  // Lấy error code
  const errorCode = getErrorCode(error)
  // Lấy message từ API (dùng làm fallback)
  const apiMessage =
    error?.response?.data?.message || // Axios error có response
    error?.data?.message || // Direct API error
    error?.message // Fallback: Axios generic message

  //  ƯU TIÊN: Lấy message từ error code mapping trong code
  const codeMappedMessage = getErrorMessage(errorCode)
  // Thứ tự ưu tiên:
  // 1. customMessage (do developer truyền vào)
  // 2. codeMappedMessage (từ ERROR_MESSAGES mapping - based on error code)
  // 3. apiMessage (từ API - fallback nếu không có mapping)
  const finalMessage = customMessage || codeMappedMessage || apiMessage
  // Hiển thị toast
  SonnerToaster({
    type: 'error',
    message: finalMessage,
  })

  // Callback nếu có
  if (onError) {
    onError(errorCode)
  }

  return errorCode
}

export { handleCommonError, getErrorCode }
