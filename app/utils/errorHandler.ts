// 에러 타입 정의
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  BEDROCK_ERROR = 'BEDROCK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface AppError {
  type: ErrorType
  message: string
  originalError?: Error
  retryable: boolean
}

// 에러 분류 함수
export function classifyError(error: any): AppError {
  if (error.name === 'TimeoutError' || error.code === 'TimeoutError') {
    return {
      type: ErrorType.TIMEOUT_ERROR,
      message: '응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.',
      originalError: error,
      retryable: true
    }
  }

  if (error.name === 'NetworkError' || error.code === 'ENOTFOUND') {
    return {
      type: ErrorType.NETWORK_ERROR,
      message: '네트워크 연결을 확인해주세요.',
      originalError: error,
      retryable: true
    }
  }

  if (error.$metadata?.httpStatusCode === 403) {
    return {
      type: ErrorType.BEDROCK_ERROR,
      message: 'AI 서비스 접근 권한이 없습니다.',
      originalError: error,
      retryable: false
    }
  }

  if (error.$metadata?.httpStatusCode === 429) {
    return {
      type: ErrorType.BEDROCK_ERROR,
      message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
      originalError: error,
      retryable: true
    }
  }

  if (error.name === 'ValidationException') {
    return {
      type: ErrorType.VALIDATION_ERROR,
      message: '입력 데이터에 문제가 있습니다.',
      originalError: error,
      retryable: false
    }
  }

  return {
    type: ErrorType.UNKNOWN_ERROR,
    message: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    originalError: error,
    retryable: true
  }
}

// 재시도 로직
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  delay: number = 1000
): Promise<T> {
  let lastError: any

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      const appError = classifyError(error)
      
      if (!appError.retryable || attempt === maxRetries) {
        throw appError
      }

      // 지수 백오프
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)))
    }
  }

  throw classifyError(lastError)
}