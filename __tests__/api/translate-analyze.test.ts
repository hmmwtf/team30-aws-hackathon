import { POST } from '../../app/api/translate-analyze/route'
import { NextRequest } from 'next/server'

// AWS SDK 모킹
jest.mock('@aws-sdk/client-translate', () => ({
  TranslateClient: jest.fn().mockImplementation(() => ({
    send: jest.fn()
  })),
  TranslateTextCommand: jest.fn(),
  DetectDominantLanguageCommand: jest.fn()
}))

jest.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: jest.fn().mockImplementation(() => ({
    send: jest.fn()
  })),
  InvokeModelCommand: jest.fn()
}))

describe('/api/translate-analyze', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should translate text and analyze manner', async () => {
    const { TranslateClient } = require('@aws-sdk/client-translate')
    const { BedrockRuntimeClient } = require('@aws-sdk/client-bedrock-runtime')
    
    const mockTranslateClient = new TranslateClient()
    const mockBedrockClient = new BedrockRuntimeClient()

    // 언어 감지 모킹
    mockTranslateClient.send.mockResolvedValueOnce({
      Languages: [{ LanguageCode: 'ko' }]
    })

    // 번역 결과 모킹
    mockTranslateClient.send.mockResolvedValueOnce({
      TranslatedText: 'Hello, how are you?'
    })

    // Bedrock 응답 모킹
    const mockBedrockResponse = {
      body: new TextEncoder().encode(JSON.stringify({
        content: [{
          text: '{"type":"good","message":"문화적으로 적절한 표현입니다.","suggestion":""}'
        }]
      }))
    }
    mockBedrockClient.send.mockResolvedValue(mockBedrockResponse)

    const request = new NextRequest('http://localhost:3000/api/translate-analyze', {
      method: 'POST',
      body: JSON.stringify({
        text: '안녕하세요, 어떻게 지내세요?',
        targetLanguage: 'en',
        sourceLanguage: 'auto',
        targetCountry: 'US'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('originalText')
    expect(data).toHaveProperty('translatedText')
    expect(data).toHaveProperty('mannerFeedback')
    expect(data.mannerFeedback.type).toBe('good')
  })

  it('should handle translation errors gracefully', async () => {
    const { TranslateClient } = require('@aws-sdk/client-translate')
    const mockTranslateClient = new TranslateClient()
    
    mockTranslateClient.send.mockRejectedValue(new Error('Translation failed'))

    const request = new NextRequest('http://localhost:3000/api/translate-analyze', {
      method: 'POST',
      body: JSON.stringify({
        text: 'Test text',
        targetLanguage: 'en',
        sourceLanguage: 'auto',
        targetCountry: 'US'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toHaveProperty('error')
  })
})