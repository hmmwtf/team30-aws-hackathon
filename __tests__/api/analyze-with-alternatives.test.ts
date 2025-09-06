/**
 * @jest-environment node
 */
import { POST } from '../../app/api/analyze-with-alternatives/route'
import { NextRequest } from 'next/server'

// AWS SDK 모킹
jest.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({
      body: new TextEncoder().encode(JSON.stringify({
        content: [{
          text: JSON.stringify({
            type: 'good',
            message: '👍 매너 굿!'
          })
        }]
      }))
    })
  })),
  InvokeModelCommand: jest.fn()
}))

describe('/api/analyze-with-alternatives', () => {
  test('should return good feedback for appropriate messages', async () => {
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
  })

  test('should handle missing parameters', async () => {
    const request = {
      json: async () => ({})
    } as NextRequest

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result.type).toBeDefined()
  })
})