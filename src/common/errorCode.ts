// Error codes organized by category for better scalability
export enum ERROR_CODE {
  // Authentication & Authorization (-10 to -19)
  UNAUTHORIZED = -12,
  INVALID_TOKEN = -13,
  TOKEN_EXPIRED = -14,
  FORBIDDEN = -15,
  DUPLICATE_ACCOUNT = -49,
  ILLEGAL_ACTION = -11,
  // API Errors (-20 to -29)
  API_ERROR = -20,
  NETWORK_ERROR = -21,
  SERVER_ERROR = -22,
  TIMEOUT = -23,

  // Validation Errors (-30 to -39)
  VALIDATION_ERROR = -30,
  INVALID_INPUT = -31,
  MISSING_FIELD = -32,

  // Business Logic Errors (-40 to -49)
  RESOURCE_NOT_FOUND = -40,
  DUPLICATE_RESOURCE = -41,
  OPERATION_FAILED = -42,

  // Unknown/Generic
  UNKNOWN_ERROR = -1,
}

// Type helper to ensure type safety
export type ErrorCodeType = ERROR_CODE | number
