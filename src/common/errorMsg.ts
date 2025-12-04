import { ERROR_CODE } from './errorCode'

// Simple mapping: Error Code → Message
// Khi cần thêm error mới, chỉ cần thêm 1 dòng vào đây
export const ERROR_MESSAGES: Record<number, string> = {
  [ERROR_CODE.UNAUTHORIZED]: 'Tài khoản hoặc mật khẩu không chính xác',
  [ERROR_CODE.INVALID_TOKEN]: 'Token không hợp lệ',
  [ERROR_CODE.TOKEN_EXPIRED]: 'Phiên đăng nhập đã hết hạn',
  [ERROR_CODE.FORBIDDEN]: 'Không có quyền sử dụng chức năng này',
  [ERROR_CODE.SERVER_ERROR]: 'Hệ thống có vấn đề vui lòng thử lại sau',
  [ERROR_CODE.DUPLICATE_ACCOUNT]: 'Email này đã tồn tại',
  [ERROR_CODE.UNKNOWN_ERROR]: 'Đã xảy ra lỗi không xác định',
  [ERROR_CODE.ILLEGAL_ACTION]: 'Không có quyền truy cập',
}

export const getErrorMessage = (code: number): string => {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES[ERROR_CODE.UNKNOWN_ERROR]
}
