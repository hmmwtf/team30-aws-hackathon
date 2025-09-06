import { NextRequest, NextResponse } from 'next/server'
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import { analysisCache, createCacheKey } from '../../utils/cache'

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  requestHandler: {
    requestTimeout: 15000, // 15초로 증가
    connectionTimeout: 5000 // 5초로 증가
  }
})

export async function POST(request: NextRequest) {
  try {
    const { message, targetCountry, relationship, language } = await request.json()
    console.log('🔍 [HYBRID-ANALYZE] Request:', JSON.stringify({ message, targetCountry, relationship, language }, null, 2))
    
    // 캐시 확인
    const cacheKey = createCacheKey(message, targetCountry, relationship)
    const cached = analysisCache.get(cacheKey)
    if (cached) return NextResponse.json(cached)

    // 1단계: Guardrails로 욕설/부적절한 내용 체크
    try {
      const guardrailResponse = await fetch('/api/guardrails-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, targetCountry, relationship })
      })
      
      if (guardrailResponse.ok) {
        const guardrailResult = await guardrailResponse.json()
        console.log('🚪 [GUARDRAILS] Result:', guardrailResult.type)
        
        if (guardrailResult.type === 'blocked') {
          // 욕설/부적절한 내용으로 차단됨
          const result = {
            type: 'warning',
            message: guardrailResult.message,
            alternatives: guardrailResult.alternatives || [],
            confidence: guardrailResult.confidence
          }
          analysisCache.set(cacheKey, result, 120000)
          return NextResponse.json(result)
        }
      }
    } catch (guardrailError) {
      console.log('🚪 [GUARDRAILS] Skip due to error:', guardrailError)
    }

    // 2단계: 문화적 매너 체크 및 번역
    // 언어 매핑
    const langMap: { [key: string]: string } = {
      US: 'English', GB: 'English', JP: 'Japanese', CN: 'Chinese',
      DE: 'German', FR: 'French', KR: 'Korean'
    }
    const targetLang = langMap[targetCountry] || 'English'

    // 개선된 프롬프트 (피드백 + 대안 제시)
    const prompt = `You are a cultural communication expert. Analyze this Korean message for ${targetCountry} culture in a ${relationship} relationship context.

Message: "${message}"

Cultural Guidelines:
- ${targetCountry === 'US' ? 'Americans value directness but avoid controversial topics like politics, religion, personal finances' : ''}
- ${targetCountry === 'JP' ? 'Japanese culture values politeness, indirectness, and avoiding confrontational topics' : ''}
- ${targetCountry === 'CN' ? 'Chinese culture respects hierarchy and avoids sensitive political topics' : ''}
- ${targetCountry === 'GB' ? 'British culture appreciates politeness and understatement' : ''}
- ${targetCountry === 'DE' ? 'German culture values directness and punctuality' : ''}
- ${targetCountry === 'FR' ? 'French culture appreciates intellectual discussion but avoid personal topics early' : ''}

Relationship Context: ${relationship === 'boss' ? 'Formal, respectful tone required' : relationship === 'friend' ? 'Casual but respectful' : relationship === 'colleague' ? 'Professional and courteous' : 'Appropriate to relationship level'}

Provide response in EXACT JSON format:

For APPROPRIATE messages:
{
  "type": "good",
  "message": "👍 매너 굿! 문화적으로 적절한 표현입니다.",
  "translation": "${targetLang} translation of the message",
  "confidence": 0.85
}

For INAPPROPRIATE messages:
{
  "type": "warning",
  "message": "⚠️ 문화적으로 부적절할 수 있습니다. 다른 표현을 사용해보세요.",
  "alternatives": [
    {
      "text": "정중한 한국어 대안",
      "translatedText": "${targetLang} translation",
      "reason": "더 정중하고 문화적으로 적절함",
      "formalityLevel": "formal"
    },
    {
      "text": "중간 정도 한국어 대안",
      "translatedText": "${targetLang} translation",
      "reason": "적당한 정중함과 친근함",
      "formalityLevel": "semi-formal"
    },
    {
      "text": "주제 전환 한국어 대안",
      "translatedText": "${targetLang} translation",
      "reason": "민감한 주제를 피하고 안전한 대화로 전환",
      "formalityLevel": "casual"
    }
  ],
  "confidence": 0.90
}

IMPORTANT: 
1. Always provide accurate ${targetLang} translations
2. For sensitive topics (politics, religion, money, personal life), always return "warning" type
3. Ensure all Korean alternatives are natural and culturally appropriate
4. Return ONLY the JSON, no additional text`

    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0', // 정확도를 위해 Sonnet 사용
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 600, // 대안 제시를 위해 토큰 수 증가
        temperature: 0.1, // 더 일관된 결과를 위해 낮춤
        messages: [{ role: 'user', content: prompt }]
      }),
      contentType: 'application/json',
      accept: 'application/json',
    })

    const response = await client.send(command)
    const responseBody = JSON.parse(new TextDecoder().decode(response.body))
    console.log('📥 [BEDROCK-RAW]:', JSON.stringify({
      country: targetCountry,
      relationship,
      message: message.substring(0, 50) + '...',
      response: responseBody.content[0].text
    }, null, 2))
    
    let result
    try {
      const content = responseBody.content[0].text.trim()
      console.log('🔍 [PARSING] Raw content:', content)
      
      // JSON 추출 개선
      let jsonStr = content
      if (content.includes('```json')) {
        const match = content.match(/```json\s*([\s\S]*?)\s*```/)
        jsonStr = match ? match[1].trim() : content
      } else if (content.includes('```')) {
        const match = content.match(/```\s*([\s\S]*?)\s*```/)
        jsonStr = match ? match[1].trim() : content
      } else {
        const match = content.match(/\{[\s\S]*\}/)
        jsonStr = match ? match[0] : content
      }
      
      console.log('🔍 [PARSING] Extracted JSON:', jsonStr)
      const parsed = JSON.parse(jsonStr)
      
      if (parsed.type === 'warning' && parsed.alternatives) {
        result = {
          type: 'warning',
          message: parsed.message || '⚠️ 문화적으로 부적절할 수 있습니다.',
          alternatives: parsed.alternatives.map((alt: any) => ({
            text: alt.text,
            translatedText: alt.translatedText,
            reason: alt.reason,
            formalityLevel: alt.formalityLevel
          })),
          confidence: parsed.confidence || 0.85
        }
      } else {
        result = {
          type: 'good',
          message: parsed.message || '👍 매너 굿!',
          basicTranslation: parsed.translation || translateFallback(message, targetCountry),
          confidence: parsed.confidence || 0.85
        }
      }
      
      console.log('✅ [PARSING] Success:', { type: result.type, hasTranslation: !!(result as any).basicTranslation, hasAlternatives: !!(result as any).alternatives })
      
    } catch (parseError) {
      console.error('😨 [PARSING] Failed:', parseError)
      console.log('📄 [PARSING] Raw content for debug:', responseBody.content[0].text)
      
      // 폴백 처리
      result = {
        type: 'good',
        message: '👍 매너 굿!',
        basicTranslation: translateFallback(message, targetCountry),
        confidence: 0.75
      }
    }

    // 캐시 저장 (2분)
    analysisCache.set(cacheKey, result, 120000)
    console.log('📤 [FINAL-RESULT]:', JSON.stringify({
      type: result.type,
      hasTranslation: !!result.basicTranslation,
      hasAlternatives: !!(result as any).alternatives,
      alternativeCount: (result as any).alternatives?.length || 0,
      confidence: result.confidence
    }, null, 2))
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('😨 [ERROR]:', JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, null, 2))
    
    // 폴백 응답
    return NextResponse.json({
      type: 'good',
      message: '👍 매너 굿!',
      basicTranslation: 'Hello',
      confidence: 0.7
    })
  }
}

// 개선된 폴백 번역 함수
function translateFallback(message: string, targetCountry: string): string {
  const translations: { [key: string]: { [key: string]: string } } = {
    US: {
      '트럼프에 대해서 어떻게 생각하세요?': 'What do you think about current events?',
      '안녕하세요': 'Hello',
      '감사합니다': 'Thank you',
      '죄송합니다': 'I apologize',
      '어떻게 생각하세요?': 'What do you think?',
      '좋은 아침입니다': 'Good morning',
      '안녕히 가세요': 'Goodbye',
      '오늘 날씨가 좋네요': 'The weather is nice today',
      '잘 지내세요?': 'How are you doing?'
    },
    JP: {
      '트럼프에 대해서 어떻게 생각하세요?': '最近の出来事についてどう思いますか？',
      '안녕하세요': 'こんにちは',
      '감사합니다': 'ありがとうございます',
      '죄송합니다': 'すみません',
      '어떻게 생각하세요?': 'どう思いますか？',
      '좋은 아침입니다': 'おはようございます',
      '안녕히 가세요': 'さようなら'
    },
    CN: {
      '트럼프에 대해서 어떻게 생각하세요?': '你对最近的事情有什么看法？',
      '안녕하세요': '你好',
      '감사합니다': '谢谢',
      '죄송합니다': '对不起',
      '어떻게 생각하세요?': '你觉得怎么样？',
      '좋은 아침입니다': '早上好',
      '안녕히 가세요': '再见'
    },
    GB: {
      '안녕하세요': 'Hello',
      '감사합니다': 'Thank you',
      '죄송합니다': 'I apologise',
      '좋은 아침입니다': 'Good morning'
    },
    DE: {
      '안녕하세요': 'Hallo',
      '감사합니다': 'Danke',
      '죄송합니다': 'Entschuldigung',
      '좋은 아침입니다': 'Guten Morgen'
    },
    FR: {
      '안녕하세요': 'Bonjour',
      '감사합니다': 'Merci',
      '죄송합니다': 'Je suis désolé',
      '좋은 아침입니다': 'Bonjour'
    }
  }
  
  return translations[targetCountry]?.[message] || message
}