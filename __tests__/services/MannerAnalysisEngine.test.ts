/**
 * @jest-environment node
 */
import { MannerAnalysisEngine } from '../../app/services/MannerAnalysisEngine'

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
    communicationStyle: '예의를 중시하고 위계를 존중',
    sensitiveTopic: ['나이', '정치'],
    taboos: ['직접적 비판', '나이 무시'],
    politenessLevel: 'high',
    directness: 'indirect',
    hierarchyImportance: 'high'
  })
}))

jest.mock('../../app/data/relationshipMannerData', () => ({
  getRelationshipMannerCriteria: jest.fn().mockReturnValue({
    relationship: '상사',
    formalityLevel: 'very-high',
    respectLevel: 'maximum',
    languageStyle: ['극존댓말', '높임법'],
    avoidExpressions: ['반말', '직접적 거절'],
    recommendedExpressions: ['~습니다', '~해 주시겠습니까'],
    culturalNotes: '위계질서를 존중하고 체면을 세워주는 표현 필수'
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

describe('MannerAnalysisEngine', () => {
  let engine: MannerAnalysisEngine

  beforeEach(() => {
    engine = new MannerAnalysisEngine()
    jest.clearAllMocks()
  })

  it('should analyze inappropriate message and return warning', async () => {
    const { BedrockRuntimeClient } = require('@aws-sdk/client-bedrock-runtime')
    const mockSend = BedrockRuntimeClient.prototype.send

    mockSend.mockResolvedValue({
      body: new TextEncoder().encode(JSON.stringify({
        content: [{
          text: JSON.stringify({
            type: 'warning',
            message: '상사에게 반말을 사용하는 것은 부적절합니다.',
            culturalReason: '한국 문화에서는 상사에게 극존댓말을 사용해야 합니다.',
            severity: 'high',
            suggestions: ['~습니다로 변경', '높임법 사용'],
            confidence: 0.95
          })
        }]
      }))
    })

    const result = await engine.analyzeMessage({
      message: '야, 회의 언제 해?',
      targetCountry: 'KR',
      relationship: 'boss'
    })

    expect(result.type).toBe('warning')
    expect(result.severity).toBe('high')
    expect(result.suggestions).toHaveLength(2)
    expect(result.confidence).toBe(0.95)
  })

  it('should analyze appropriate message and return good', async () => {
    const { BedrockRuntimeClient } = require('@aws-sdk/client-bedrock-runtime')
    const mockSend = BedrockRuntimeClient.prototype.send

    mockSend.mockResolvedValue({
      body: new TextEncoder().encode(JSON.stringify({
        content: [{
          text: JSON.stringify({
            type: 'good',
            message: '상사에게 적절한 존댓말을 사용하고 있습니다.',
            culturalReason: '높임법과 정중한 표현을 올바르게 사용했습니다.',
            confidence: 0.92
          })
        }]
      }))
    })

    const result = await engine.analyzeMessage({
      message: '회의 시간을 언제로 정하시겠습니까?',
      targetCountry: 'KR',
      relationship: 'boss'
    })

    expect(result.type).toBe('good')
    expect(result.confidence).toBe(0.92)
  })

  it('should handle API errors gracefully', async () => {
    const { BedrockRuntimeClient } = require('@aws-sdk/client-bedrock-runtime')
    const mockSend = BedrockRuntimeClient.prototype.send

    mockSend.mockRejectedValue(new Error('API Error'))

    const result = await engine.analyzeMessage({
      message: '테스트 메시지',
      targetCountry: 'KR',
      relationship: 'friend'
    })

    expect(result.type).toBe('good')
    expect(result.confidence).toBe(0.5)
    expect(result.message).toContain('매너 굿!')
  })
})