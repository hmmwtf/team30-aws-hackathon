import { NextRequest, NextResponse } from 'next/server'
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import { getCulturalData } from '../../data/culturalData'
import { withRetry, classifyError } from '../../utils/errorHandler'
import { analysisCache } from '../../utils/cache'

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  requestHandler: {
    requestTimeout: 8000, // 8초 타임아웃
    connectionTimeout: 3000 // 3초 연결 타임아웃
  }
})

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [Bedrock API] Analysis request received')
    
    const { message, targetCountry } = await request.json()
    console.log(`📝 [Bedrock API] Message: "${message}", Country: ${targetCountry}`)

    // 캐시 확인
    const cacheKey = analysisCache.generateKey(message, targetCountry)
    const cachedResult = analysisCache.get(cacheKey)
    if (cachedResult) {
      console.log('⚡ [Cache] Cache hit - returning cached result')
      return NextResponse.json(cachedResult)
    }

    // 문화 데이터 가져오기
    const culturalData = getCulturalData(targetCountry)
    
    // 간소화된 프롬프트로 속도 향상
    const prompt = `메시지: "${message}"
국가: ${targetCountry} (${culturalData?.country})
민감주제: ${culturalData?.sensitiveTopic.join(', ') || '없음'}
금기사항: ${culturalData?.taboos.join(', ') || '없음'}

이 메시지가 ${targetCountry} 문화에서 적절한지 분석하고 JSON으로 응답:
{"type":"warning"|"good","message":"피드백","suggestion":"제안","culturalReason":"이유"}`

    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0', // Haiku는 Sonnet보다 3-5배 빠름
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 350, // JSON 완성을 위해 토큰 수 증가
        temperature: 0.1, // 더 빠른 응답을 위해 낮춤
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      }),
      contentType: 'application/json',
      accept: 'application/json',
    })

    console.log('🤖 [Bedrock API] Sending request to Claude 3 Haiku...')
    const startTime = Date.now()
    
    const response = await withRetry(async () => {
      return await client.send(command)
    }, 2, 1000)
    
    const responseTime = Date.now() - startTime
    console.log(`✅ [Bedrock API] Response received in ${responseTime}ms`)
    
    const responseBody = JSON.parse(new TextDecoder().decode(response.body))
    console.log('📄 [Bedrock API] Raw response:', JSON.stringify(responseBody, null, 2))
    
    let feedback
    try {
      const rawText = responseBody.content[0].text
      console.log('📄 [Bedrock API] Raw AI response:', rawText)
      
      // 강화된 JSON 추출 및 복구
      let jsonText = rawText.trim()
      
      // JSON 시작점 찾기
      const startIndex = jsonText.indexOf('{')
      if (startIndex !== -1) {
        jsonText = jsonText.substring(startIndex)
        
        // JSON 끝점 찾기 또는 복구
        if (!jsonText.endsWith('}')) {
          // 마지막 완전한 필드까지만 사용
          const lastCommaIndex = jsonText.lastIndexOf(',')
          const lastQuoteIndex = jsonText.lastIndexOf('"')
          
          if (jsonText.includes('"culturalReason":')) {
            // culturalReason 필드가 있으면 그 부분까지만 사용
            const reasonStart = jsonText.indexOf('"culturalReason":')
            const reasonValueStart = jsonText.indexOf('"', reasonStart + 17)
            
            if (reasonValueStart !== -1 && lastQuoteIndex > reasonValueStart) {
              // 마지막 따옴표까지 사용하고 닫기
              jsonText = jsonText.substring(0, lastQuoteIndex + 1) + '\n}'
            } else {
              // culturalReason 값이 시작되지 않았으면 필드 제거
              jsonText = jsonText.substring(0, reasonStart - 1) + '\n}'
            }
          } else {
            // culturalReason이 없으면 마지막 완전한 필드까지만
            if (lastCommaIndex > 0) {
              jsonText = jsonText.substring(0, lastCommaIndex) + '\n}'
            } else {
              jsonText += '}'
            }
          }
        }
        
        feedback = JSON.parse(jsonText)
        console.log('🎯 [Bedrock API] Parsed feedback:', feedback)
        
        // 필수 필드 검증 및 기본값 설정
        if (!feedback.type) feedback.type = 'good'
        if (!feedback.message) feedback.message = '문화적으로 적절한 표현입니다.'
        if (!feedback.culturalReason) feedback.culturalReason = ''
        
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.log('⚠️ [Bedrock API] JSON parsing failed:', parseError)
      console.log('🔄 [Bedrock API] Using enhanced default response')
      
      const culturalData = getCulturalData(targetCountry)
      feedback = {
        type: 'good',
        message: `👍 매너 굿! ${culturalData?.country || targetCountry} 문화권에서 적절한 표현입니다.`,
        suggestion: '',
        culturalReason: '기본 분석 결과입니다.'
      }
    }

    // 결과 캐싱
    analysisCache.set(cacheKey, feedback)
    
    console.log('📤 [Bedrock API] Sending response to client:', feedback)
    return NextResponse.json(feedback)
  } catch (error) {
    const appError = classifyError(error)
    console.error('❌ [Bedrock API] Error occurred:', {
      type: appError.type,
      message: appError.message,
      retryable: appError.retryable
    })
    
    // 에러 시 targetCountry 기본값 설정
    const { targetCountry = 'US' } = await request.json().catch(() => ({ targetCountry: 'US' }))
    const culturalData = getCulturalData(targetCountry)
    
    // 에러 타입에 따른 다른 응답
    if (appError.retryable) {
      return NextResponse.json({
        type: 'good',
        message: `👍 매너 굿! ${culturalData?.country || targetCountry} 문화권에서 적절한 표현입니다.`,
        suggestion: '서비스 일시 장애로 기본 분석을 제공합니다.',
        culturalReason: appError.message
      })
    } else {
      return NextResponse.json({
        type: 'good',
        message: `👍 매너 굿! ${culturalData?.country || targetCountry} 문화권에서 적절한 표현입니다.`,
        suggestion: '',
        culturalReason: '기본 분석 결과입니다.'
      })
    }
  }
}