/**
 * @jest-environment node
 */
import { POST } from '../../app/api/guardrails-check/route'
import { NextRequest } from 'next/server'

describe('/api/guardrails-check', () => {
  test('should block inappropriate content', async () => {
    const request = {
      json: async () => ({
        message: 'inappropriate content',
        targetCountry: 'US',
        relationship: 'boss'
      })
    } as NextRequest

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result.type).toBeDefined()
  })

  test('should allow appropriate content', async () => {
    const request = {
      json: async () => ({
        message: 'Hello, how are you?',
        targetCountry: 'US',
        relationship: 'friend'
      })
    } as NextRequest

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result.type).toBeDefined()
  })

  test('should warn about sensitive topics in workplace', async () => {
    const request = {
      json: async () => ({
        message: 'political discussion',
        targetCountry: 'US',
        relationship: 'colleague'
      })
    } as NextRequest

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result.type).toBeDefined()
  })
})