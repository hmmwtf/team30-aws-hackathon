import { classifyError, withRetry, ErrorType } from '../../app/utils/errorHandler'

describe('Error Handler', () => {
  describe('classifyError', () => {
    test('classifies timeout errors correctly', () => {
      const timeoutError = { name: 'TimeoutError' }
      const result = classifyError(timeoutError)
      
      expect(result.type).toBe(ErrorType.TIMEOUT_ERROR)
      expect(result.retryable).toBe(true)
      expect(result.message).toContain('응답 시간이 초과')
    })

    test('classifies network errors correctly', () => {
      const networkError = { code: 'ENOTFOUND' }
      const result = classifyError(networkError)
      
      expect(result.type).toBe(ErrorType.NETWORK_ERROR)
      expect(result.retryable).toBe(true)
      expect(result.message).toContain('네트워크 연결')
    })

    test('classifies Bedrock 403 errors correctly', () => {
      const bedrockError = { $metadata: { httpStatusCode: 403 } }
      const result = classifyError(bedrockError)
      
      expect(result.type).toBe(ErrorType.BEDROCK_ERROR)
      expect(result.retryable).toBe(false)
      expect(result.message).toContain('접근 권한')
    })

    test('classifies rate limit errors correctly', () => {
      const rateLimitError = { $metadata: { httpStatusCode: 429 } }
      const result = classifyError(rateLimitError)
      
      expect(result.type).toBe(ErrorType.BEDROCK_ERROR)
      expect(result.retryable).toBe(true)
      expect(result.message).toContain('요청이 너무 많습니다')
    })

    test('classifies unknown errors correctly', () => {
      const unknownError = new Error('Something went wrong')
      const result = classifyError(unknownError)
      
      expect(result.type).toBe(ErrorType.UNKNOWN_ERROR)
      expect(result.retryable).toBe(true)
      expect(result.message).toContain('일시적인 오류')
    })
  })

  describe('withRetry', () => {
    test('succeeds on first attempt', async () => {
      const mockFn = jest.fn().mockResolvedValue('success')
      
      const result = await withRetry(mockFn, 2, 100)
      
      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('retries on retryable errors', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce({ name: 'TimeoutError' })
        .mockResolvedValue('success')
      
      const result = await withRetry(mockFn, 2, 100)
      
      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    test('does not retry on non-retryable errors', async () => {
      const mockFn = jest.fn()
        .mockRejectedValue({ $metadata: { httpStatusCode: 403 } })
      
      await expect(withRetry(mockFn, 2, 100)).rejects.toMatchObject({
        type: ErrorType.BEDROCK_ERROR,
        retryable: false
      })
      
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('exhausts retries and throws last error', async () => {
      const mockFn = jest.fn()
        .mockRejectedValue({ name: 'TimeoutError' })
      
      await expect(withRetry(mockFn, 2, 100)).rejects.toMatchObject({
        type: ErrorType.TIMEOUT_ERROR,
        retryable: true
      })
      
      expect(mockFn).toHaveBeenCalledTimes(3) // 1 initial + 2 retries
    })
  })
})