/**
 * @jest-environment node
 */
import { POST } from '../../app/api/hybrid-analyze/route'
import { NextRequest } from 'next/server'

// AWS SDK 모킹
jest.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: jest.fn().mockImplementation(() => ({
    send: jest.fn()
  })),
  InvokeModelCommand: jest.fn()
}))

describe('/api/hybrid-analyze', () => {
  test('should return good result for appropriate message', async () => {
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

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result.type).toBe('good')
    expect(result.basicTranslation).toBe('Hello, how are you?')
  })

  test('should return warning with alternatives for inappropriate message', async () => {
    const { BedrockRuntimeClient } = require('@aws-sdk/client-bedrock-runtime')
    const mockSend = jest.fn().mockResolvedValue({
      body: new TextEncoder().encode(JSON.stringify({
        content: [{
          text: JSON.stringify({
            type: 'warning',
            message: '부적절한 표현입니다',
            alternatives: [
              { text: '정중한 표현', reason: '더 예의바른 표현', formalityLevel: 'formal' }
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

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result.type).toBe('warning')
    expect(result.alternatives).toBeDefined()
  })

  test('should handle timeout errors gracefully', async () => {
    const { BedrockRuntimeClient } = require('@aws-sdk/client-bedrock-runtime')
    const mockSend = jest.fn().mockRejectedValue(new Error('Timeout'))

    BedrockRuntimeClient.mockImplementation(() => ({
      send: mockSend
    }))

    const request = {
      json: async () => ({
        message: 'test message',
        targetCountry: 'US',
        relationship: 'friend',
        language: 'ko'
      })
    } as NextRequest

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result.type).toBe('good')
  })
})