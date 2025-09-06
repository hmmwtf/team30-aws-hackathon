/**
 * @jest-environment node
 */
import { POST as hybridAnalyze } from '../../app/api/hybrid-analyze/route'
import { POST as analyzeWithAlternatives } from '../../app/api/analyze-with-alternatives/route'
import { NextRequest } from 'next/server'

// AWS SDK 모킹
jest.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: jest.fn().mockImplementation(() => ({
    send: jest.fn()
  })),
  InvokeModelCommand: jest.fn()
}))

describe('Manner Check Flow Integration', () => {
  test('should complete full flow for good message', async () => {
    const { BedrockRuntimeClient } = require('@aws-sdk/client-bedrock-runtime')
    const mockSend = jest.fn().mockResolvedValue({
      body: new TextEncoder().encode(JSON.stringify({
        content: [{
          text: JSON.stringify({
            type: 'good',
            message: '👍 매너 굿!',
            basicTranslation: 'Hello, how are you?'
          })
        }]
      }))
    })

    BedrockRuntimeClient.mockImplementation(() => ({
      send: mockSend
    }))

    const request = {
      json: async () => ({
        message: 'Hello, how are you?',
        targetCountry: 'US',
        relationship: 'friend',
        language: 'ko'
      })
    } as NextRequest

    const response = await hybridAnalyze(request)
    const result = await response.json()

    expect(result.type).toBe('good')
    expect(result.basicTranslation).toBe('Hello, how are you?')
  })

  test('should handle inappropriate content with alternatives', async () => {
    const { BedrockRuntimeClient } = require('@aws-sdk/client-bedrock-runtime')
    const mockSend = jest.fn().mockResolvedValue({
      body: new TextEncoder().encode(JSON.stringify({
        content: [{
          text: JSON.stringify({
            type: 'warning',
            message: '부적절한 표현입니다',
            alternatives: [
              {
                text: '정중한 표현',
                reason: '더 예의바른 표현',
                formalityLevel: 'formal'
              }
            ]
          })
        }]
      }))
    })

    BedrockRuntimeClient.mockImplementation(() => ({
      send: mockSend
    }))

    const request = {
      json: async () => ({
        message: 'inappropriate message',
        targetCountry: 'US',
        relationship: 'boss',
        language: 'ko'
      })
    } as NextRequest

    // 1단계: hybrid-analyze로 부적절한 내용 감지
    const hybridResponse = await hybridAnalyze(request)
    const hybridResult = await hybridResponse.json()

    expect(hybridResult.type).toBe('warning')

    // 2단계: analyze-with-alternatives로 대안 제공
    const altResponse = await analyzeWithAlternatives(request)
    const altResult = await altResponse.json()

    expect(altResult.alternatives).toBeDefined()
    expect(altResult.alternatives.length).toBeGreaterThan(0)
  })
})