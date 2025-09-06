import { NextRequest, NextResponse } from 'next/server'
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import { analysisCache, createCacheKey } from '../../utils/cache'
import { getInstantTranslation } from '../../utils/preCache'

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  requestHandler: {
    requestTimeout: 3000, // 3초로 단축
    connectionTimeout: 500 // 0.5초로 단축
  }
})

export async function POST(request: NextRequest) {
  try {
    const { message, targetCountry, relationship, language } = await request.json()
    
    // 캐시 확인 (더 짧은 키)
    const cacheKey = `⚡${message.slice(0,20)}_${targetCountry}_${relationship}`
    const cached = analysisCache.get(cacheKey)
    if (cached) return NextResponse.json(cached)
    
    // 즉시 번역 체크 (0.1초 미만)
    const instantTrans = getInstantTranslation(message, targetCountry)
    if (instantTrans) {
      const instantResult = {
        type: 'good',
        message: '👍 매너 굿!',
        basicTranslation: instantTrans
      }
      analysisCache.set(cacheKey, instantResult, 30000)
      return NextResponse.json(instantResult)
    }

    // 언어 매핑 (최소화)
    const langs: { [key: string]: string } = {
      US: 'EN', GB: 'EN', JP: 'JA', CN: 'ZH', DE: 'DE', FR: 'FR', KR: 'KO'
    }
    const tLang = langs[targetCountry] || 'EN'

    // 극단적으로 짧은 프롬프트 (토큰 최소화)
    const prompt = `MSG:"${message}" TO:${targetCountry} REL:${relationship}
JSON:{"ok":true/false,"msg":"feedback","trans":"${tLang} translation"}
FAST RESPONSE ONLY!`

    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0', // 가장 빠른 모델
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 150, // 극도로 제한
        temperature: 0, // 일관성 최대화
        messages: [{ role: 'user', content: prompt }]
      }),
      contentType: 'application/json',
      accept: 'application/json',
    })

    const response = await client.send(command)
    const responseBody = JSON.parse(new TextDecoder().decode(response.body))
    
    let result
    try {
      const content = responseBody.content[0].text
      const jsonMatch = content.match(/\{[^}]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        result = {
          type: parsed.ok ? 'good' : 'warning',
          message: parsed.msg || '👍 매너 굿!',
          basicTranslation: parsed.trans || message
        }
      } else throw new Error('No JSON')
    } catch {
      // 초고속 폴백
      const quickTrans = {
        '안녕하세요': tLang === 'EN' ? 'Hello' : tLang === 'JA' ? 'こんにちは' : message,
        '감사합니다': tLang === 'EN' ? 'Thank you' : tLang === 'JA' ? 'ありがとう' : message,
        '죄송합니다': tLang === 'EN' ? 'Sorry' : tLang === 'JA' ? 'すみません' : message
      }
      result = {
        type: 'good',
        message: '👍 매너 굿!',
        basicTranslation: quickTrans[message as keyof typeof quickTrans] || message
      }
    }

    // 짧은 캐시 (30초)
    analysisCache.set(cacheKey, result, 30000)
    
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({
      type: 'good',
      message: '👍 매너 굿!',
      basicTranslation: ''
    })
  }
}