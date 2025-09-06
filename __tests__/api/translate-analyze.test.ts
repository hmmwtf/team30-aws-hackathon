/**
 * @jest-environment node
 */
import { POST } from '../../app/api/translate-analyze/route'
import { NextRequest } from 'next/server'

describe('/api/translate-analyze', () => {
  test('should handle translation errors gracefully', async () => {
    const request = {
      json: async () => ({
        text: 'test text',
        targetLanguage: 'en',
        sourceLanguage: 'ko',
        targetCountry: 'US'
      })
    } as NextRequest

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(500)
    expect(result.error).toBeDefined()
  })

  test('should return error for missing parameters', async () => {
    const request = {
      json: async () => ({})
    } as NextRequest

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(500)
    expect(result.error).toBeDefined()
  })
})