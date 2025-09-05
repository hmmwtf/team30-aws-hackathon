/**
 * @jest-environment node
 */
import { POST } from '../../app/api/enhanced-analyze/route'

// Mock MannerAnalysisEngine
jest.mock('../../app/services/MannerAnalysisEngine', () => ({
  MannerAnalysisEngine: jest.fn().mockImplementation(() => ({
    analyzeMessage: jest.fn()
  }))
}))

// Mock cache
jest.mock('../../app/utils/cache', () => ({
  analysisCache: {
    generateKey: jest.fn().mockReturnValue('test-key'),
    get: jest.fn().mockReturnValue(null),
    set: jest.fn()
  }
}))

// Mock Request
global.Request = class MockRequest {
  constructor(public url: string, public init?: any) {}
  async json() {
    return JSON.parse(this.init?.body || '{}')
  }
} as any

describe('/api/enhanced-analyze', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return analysis result for valid request', async () => {
    const { MannerAnalysisEngine } = require('../../app/services/MannerAnalysisEngine')
    const mockAnalyzeMessage = MannerAnalysisEngine.prototype.analyzeMessage

    mockAnalyzeMessage.mockResolvedValue({
      type: 'warning',
      message: '상사에게 부적절한 표현입니다.',
      culturalReason: '한국 문화에서는 높임법을 사용해야 합니다.',
      severity: 'medium',
      suggestions: ['존댓말 사용', '정중한 표현으로 변경'],
      confidence: 0.9
    })

    const request = new Request('http://localhost:3000/api/enhanced-analyze', {
      method: 'POST',
      body: JSON.stringify({
        message: '야, 회의 언제 해?',
        targetCountry: 'KR',
        relationship: 'boss',
        language: 'ko'
      })
    }) as any

    const response = await POST(request)
    const result = await response.json()

    expect(result.type).toBe('warning')
    expect(result.severity).toBe('medium')
    expect(result.suggestions).toHaveLength(2)
    expect(result.confidence).toBe(0.9)
  })

  it('should return 400 for missing required fields', async () => {
    const request = new Request('http://localhost:3000/api/enhanced-analyze', {
      method: 'POST',
      body: JSON.stringify({
        message: '테스트'
        // targetCountry, relationship 누락
      })
    }) as any

    const response = await POST(request)
    expect(response.status).toBe(400)
    
    const result = await response.json()
    expect(result.error).toContain('Missing required fields')
  })

  it('should use cached result when available', async () => {
    const { analysisCache } = require('../../app/utils/cache')
    const cachedResult = {
      type: 'good',
      message: '캐시된 결과',
      culturalReason: '캐시에서 가져옴',
      confidence: 0.8
    }

    analysisCache.get.mockReturnValue(cachedResult)

    const request = new Request('http://localhost:3000/api/enhanced-analyze', {
      method: 'POST',
      body: JSON.stringify({
        message: '안녕하세요',
        targetCountry: 'KR',
        relationship: 'colleague'
      })
    }) as any

    const response = await POST(request)
    const result = await response.json()

    expect(result).toEqual(cachedResult)
  })
})