/**
 * @jest-environment node
 */
import { POST } from '../../app/api/analyze-with-alternatives/route'

// Mock AWS SDK
jest.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: jest.fn().mockImplementation(() => ({
    send: jest.fn()
  })),
  InvokeModelCommand: jest.fn()
}))

// Mock dependencies
jest.mock('../../app/data/culturalData', () => ({
  getCulturalData: jest.fn().mockReturnValue({
    country: '대한민국',
    sensitiveTopic: ['정치', '종교'],
    taboos: ['나이 묻기', '개인 소득']
  })
}))

jest.mock('../../app/utils/errorHandler', () => ({
  withRetry: jest.fn().mockImplementation((fn) => fn()),
  classifyError: jest.fn().mockReturnValue({
    type: 'network',
    message: 'Network error',
    retryable: true
  })
}))

// Mock Request
global.Request = class MockRequest {
  constructor(public url: string, public init?: any) {}
  async json() {
    return JSON.parse(this.init?.body || '{}')
  }
} as any

describe('/api/analyze-with-alternatives', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should analyze message and provide alternatives for inappropriate content', async () => {
    const { BedrockRuntimeClient } = require('@aws-sdk/client-bedrock-runtime')
    const mockSend = BedrockRuntimeClient.prototype.send

    mockSend.mockResolvedValue({
      body: new TextEncoder().encode(JSON.stringify({
        content: [{
          text: JSON.stringify({
            type: 'warning',
            message: '상사에게 너무 직접적인 표현입니다.',
            culturalReason: '한국 문화에서는 상사에게 높임말을 사용해야 합니다.',
            alternatives: [
              {
                text: '죄송합니다만, 회의 시간을 조정해 주실 수 있을까요?',
                reason: '정중한 요청 표현',
                formalityLevel: 'formal'
              },
              {
                text: '회의 시간 변경이 가능한지 여쭤봐도 될까요?',
                reason: '존댓말 사용',
                formalityLevel: 'semi-formal'
              },
              {
                text: '회의 시간 바꿀 수 있어요?',
                reason: '친근한 표현',
                formalityLevel: 'casual'
              }
            ],
            originalMessage: '회의 시간 바꿔'
          })
        }]
      }))
    })

    const request = new Request('http://localhost:3000/api/analyze-with-alternatives', {
      method: 'POST',
      body: JSON.stringify({
        message: '회의 시간 바꿔',
        targetCountry: 'KR',
        relationship: 'boss',
        language: 'ko'
      })
    }) as any

    const response = await POST(request)
    const result = await response.json()

    expect(result.type).toBe('warning')
    expect(result.alternatives).toHaveLength(3)
    expect(result.alternatives[0].formalityLevel).toBe('formal')
    expect(result.alternatives[1].formalityLevel).toBe('semi-formal')
    expect(result.alternatives[2].formalityLevel).toBe('casual')
  })

  it('should return good feedback for appropriate messages', async () => {
    const { BedrockRuntimeClient } = require('@aws-sdk/client-bedrock-runtime')
    const mockSend = BedrockRuntimeClient.prototype.send

    mockSend.mockResolvedValue({
      body: new TextEncoder().encode(JSON.stringify({
        content: [{
          text: JSON.stringify({
            type: 'good',
            message: '👍 매너 굿! 친구에게 적절한 표현입니다.',
            culturalReason: '친구 관계에서 자연스러운 표현입니다.'
          })
        }]
      }))
    })

    const request = new Request('http://localhost:3000/api/analyze-with-alternatives', {
      method: 'POST',
      body: JSON.stringify({
        message: '오늘 점심 같이 먹을래?',
        targetCountry: 'KR',
        relationship: 'friend',
        language: 'ko'
      })
    }) as any

    const response = await POST(request)
    const result = await response.json()

    expect(result.type).toBe('good')
    expect(result.alternatives).toBeUndefined()
  })
})