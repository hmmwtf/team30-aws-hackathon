/**
 * @jest-environment node
 */
import { POST } from '../../app/api/analyze/route'
import { NextRequest } from 'next/server'

// AWS SDK 모킹
jest.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: jest.fn().mockImplementation(() => ({
    send: jest.fn()
  })),
  InvokeModelCommand: jest.fn()
}))

describe('/api/analyze', () => {
  test('returns analysis result for valid request', async () => {
    const { BedrockRuntimeClient } = require('@aws-sdk/client-bedrock-runtime')
    const mockSend = jest.fn().mockResolvedValue({
      body: new TextEncoder().encode(JSON.stringify({
        content: [{
          text: JSON.stringify({
            type: 'good',
            message: '👍 매너 굿! 문화적으로 적절한 표현이에요'
          })
        }]
      }))
    })

    BedrockRuntimeClient.mockImplementation(() => ({
      send: mockSend
    }))

    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Hello, how are you?',
        targetCountry: 'US'
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result.type).toBe('good')
    expect(result.message).toBe('👍 매너 굿! 문화적으로 적절한 표현이에요 (에러 시 기본 응답)')

  })

  test('handles Bedrock API error gracefully', async () => {
    const { BedrockRuntimeClient } = require('@aws-sdk/client-bedrock-runtime')
    const mockSend = jest.fn().mockRejectedValue(new Error('Bedrock API Error'))

    BedrockRuntimeClient.mockImplementation(() => ({
      send: mockSend
    }))

    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Test message',
        targetCountry: 'US'
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result.type).toBe('good')

    expect(result.message).toBe('👍 매너 굿! 문화적으로 적절한 표현이에요 (에러 시 기본 응답)')

  })

  test('handles invalid JSON response from Bedrock', async () => {
    const { BedrockRuntimeClient } = require('@aws-sdk/client-bedrock-runtime')
    const mockSend = jest.fn().mockResolvedValue({
      body: new TextEncoder().encode(JSON.stringify({
        content: [{
          text: 'Invalid JSON response'
        }]
      }))
    })

    BedrockRuntimeClient.mockImplementation(() => ({
      send: mockSend
    }))

    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Test message',
        targetCountry: 'US'
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result.type).toBe('good')

    expect(result.message).toBe('👍 매너 굿! 문화적으로 적절한 표현이에요 (에러 시 기본 응답)')

  })
})