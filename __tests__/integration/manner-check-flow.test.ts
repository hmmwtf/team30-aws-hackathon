/**
 * 통합 테스트: 매너 체크 → 번역 → 전송 플로우
 */
import { POST as hybridAnalyze } from '../../app/api/hybrid-analyze/route'
import { POST as guardrailsCheck } from '../../app/api/guardrails-check/route'
import { NextRequest } from 'next/server'

jest.mock('@aws-sdk/client-bedrock-runtime')

describe('Manner Check Flow Integration', () => {
  it('should complete full flow for good message', async () => {
    // 1. Guardrails 체크
    const guardrailsRequest = new NextRequest('http://localhost/api/guardrails-check', {
      method: 'POST',
      body: JSON.stringify({
        message: '안녕하세요',
        targetCountry: 'US',
        relationship: 'friend'
      })
    })

    const guardrailsResponse = await guardrailsCheck(guardrailsRequest)
    const guardrailsResult = await guardrailsResponse.json()
    
    expect(guardrailsResult.type).toBe('allowed')

    // 2. 매너 분석 및 번역
    const mockSend = jest.fn().mockResolvedValue({
      body: new TextEncoder().encode(JSON.stringify({
        content: [{ text: '{"type": "good", "message": "👍 매너 굿!", "translation": "Hello", "confidence": 0.9}' }]
      }))
    })

    const { BedrockRuntimeClient } = require('@aws-sdk/client-bedrock-runtime')
    BedrockRuntimeClient.mockImplementation(() => ({ send: mockSend }))

    const hybridRequest = new NextRequest('http://localhost/api/hybrid-analyze', {
      method: 'POST',
      body: JSON.stringify({
        message: '안녕하세요',
        targetCountry: 'US',
        relationship: 'friend',
        language: 'ko'
      })
    })

    const hybridResponse = await hybridAnalyze(hybridRequest)
    const hybridResult = await hybridResponse.json()

    expect(hybridResult.type).toBe('good')
    expect(hybridResult.basicTranslation).toBeDefined()
  })

  it('should handle inappropriate content with alternatives', async () => {
    // 1. Guardrails에서 차단
    const guardrailsRequest = new NextRequest('http://localhost/api/guardrails-check', {
      method: 'POST',
      body: JSON.stringify({
        message: '시발',
        targetCountry: 'US',
        relationship: 'boss'
      })
    })

    const guardrailsResponse = await guardrailsCheck(guardrailsRequest)
    const guardrailsResult = await guardrailsResponse.json()
    
    expect(guardrailsResult.type).toBe('blocked')
    expect(guardrailsResult.alternatives).toHaveLength(3)
    
    // 각 대안에 번역이 포함되어 있는지 확인
    guardrailsResult.alternatives.forEach((alt: any) => {
      expect(alt.text).toBeDefined()
      expect(alt.translatedText).toBeDefined()
      expect(alt.reason).toBeDefined()
      expect(alt.formalityLevel).toBeDefined()
    })
  })
})