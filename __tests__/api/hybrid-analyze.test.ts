import { POST } from '../../app/api/hybrid-analyze/route'
import { NextRequest } from 'next/server'

// Mock AWS SDK
jest.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: jest.fn().mockImplementation(() => ({
    send: jest.fn()
  })),
  InvokeModelCommand: jest.fn()
}))

describe('/api/hybrid-analyze', () => {
  const mockSend = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
    const { BedrockRuntimeClient } = require('@aws-sdk/client-bedrock-runtime')
    BedrockRuntimeClient.mockImplementation(() => ({ send: mockSend }))
  })

  it('should return good result for appropriate message', async () => {
    mockSend.mockResolvedValue({
      body: new TextEncoder().encode(JSON.stringify({
        content: [{ text: '{"type": "good", "message": "👍 매너 굿!", "translation": "Hello", "confidence": 0.9}' }]
      }))
    })

    const request = new NextRequest('http://localhost/api/hybrid-analyze', {
      method: 'POST',
      body: JSON.stringify({
        message: '안녕하세요',
        targetCountry: 'US',
        relationship: 'friend',
        language: 'ko'
      })
    })

    const response = await POST(request)
    const result = await response.json()

    expect(result.type).toBe('good')
    expect(result.basicTranslation).toBeDefined()
  })

  it('should return warning with alternatives for inappropriate message', async () => {
    mockSend.mockResolvedValue({
      body: new TextEncoder().encode(JSON.stringify({
        content: [{ text: '{"type": "warning", "message": "부적절한 표현", "alternatives": [{"text": "대안", "translatedText": "Alternative", "reason": "더 좋음", "formalityLevel": "formal"}]}' }]
      }))
    })

    const request = new NextRequest('http://localhost/api/hybrid-analyze', {
      method: 'POST',
      body: JSON.stringify({
        message: '시발',
        targetCountry: 'US',
        relationship: 'boss',
        language: 'ko'
      })
    })

    const response = await POST(request)
    const result = await response.json()

    expect(result.type).toBe('warning')
    expect(result.alternatives).toBeDefined()
    expect(Array.isArray(result.alternatives)).toBe(true)
  })

  it('should handle timeout errors gracefully', async () => {
    mockSend.mockRejectedValue(new Error('Stream timed out'))

    const request = new NextRequest('http://localhost/api/hybrid-analyze', {
      method: 'POST',
      body: JSON.stringify({
        message: '테스트',
        targetCountry: 'US',
        relationship: 'friend',
        language: 'ko'
      })
    })

    const response = await POST(request)
    const result = await response.json()

    expect(result.type).toBe('good')
    expect(result.confidence).toBe(0.7)
  })
})