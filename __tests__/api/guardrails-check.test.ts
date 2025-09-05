import { POST } from '../../app/api/guardrails-check/route'
import { NextRequest } from 'next/server'

jest.mock('@aws-sdk/client-bedrock-runtime')

describe('/api/guardrails-check', () => {
  it('should block inappropriate content', async () => {
    const request = new NextRequest('http://localhost/api/guardrails-check', {
      method: 'POST',
      body: JSON.stringify({
        message: '시발',
        targetCountry: 'US',
        relationship: 'friend'
      })
    })

    const response = await POST(request)
    const result = await response.json()

    expect(result.type).toBe('blocked')
    expect(result.alternatives).toBeDefined()
    expect(result.alternatives.length).toBe(3)
  })

  it('should allow appropriate content', async () => {
    const request = new NextRequest('http://localhost/api/guardrails-check', {
      method: 'POST',
      body: JSON.stringify({
        message: '안녕하세요',
        targetCountry: 'US',
        relationship: 'friend'
      })
    })

    const response = await POST(request)
    const result = await response.json()

    expect(result.type).toBe('allowed')
  })

  it('should warn about sensitive topics in workplace', async () => {
    const request = new NextRequest('http://localhost/api/guardrails-check', {
      method: 'POST',
      body: JSON.stringify({
        message: '트럼프에 대해 어떻게 생각하세요?',
        targetCountry: 'US',
        relationship: 'boss'
      })
    })

    const response = await POST(request)
    const result = await response.json()

    expect(result.type).toBe('warning')
    expect(result.reason).toBe('sensitive_topic_workplace')
  })
})