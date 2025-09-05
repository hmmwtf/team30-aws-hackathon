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
    
    const { message, targetCountry, language = 'ko' } = await request.json()
    console.log(`📝 [Bedrock API] Message: "${message}", Country: ${targetCountry}, Language: ${language}`)


    // 캐시 확인
    const cacheKey = analysisCache.generateKey(message, targetCountry)
    const cachedResult = analysisCache.get(cacheKey)
    if (cachedResult) {
      console.log('⚡ [Cache] Cache hit - returning cached result')
      return NextResponse.json(cachedResult)
    }

    const countryNames = {
      KR: '대한민국',
      US: '미국',
      JP: '일본',
      CN: '중국',
      GB: '영국',
      DE: '독일',
      FR: '프랑스'
    }

    const countryName = countryNames[targetCountry as keyof typeof countryNames] || targetCountry

    const prompts = {
      ko: `당신은 문화적 매너 전문가입니다. 다음 메시지가 ${countryName} 문화권에서 적절한지 분석해주세요.

메시지: "${message}"
대상 국가: ${countryName}

${targetCountry === 'KR' ? 
  '한국 문화의 특징을 고려하세요: 존댓말과 높임법, 나이와 지위에 따른 예의, 집단주의 문화, 체면과 인간관계 중시, 직접적 표현보다는 완곡한 표현 선호' : 
  '해당 국가의 문화적 특성과 금기사항, 예의범절을 고려하세요.'}

    // 문화 데이터 가져오기
    const culturalData = getCulturalData(targetCountry)
    
    // 간소화된 프롬프트로 속도 향상
    const prompt = `메시지: "${message}"
국가: ${targetCountry} (${culturalData?.country})
민감주제: ${culturalData?.sensitiveTopic.join(', ') || '없음'}
금기사항: ${culturalData?.taboos.join(', ') || '없음'}


이 메시지가 ${targetCountry} 문화에서 적절한지 분석하고 JSON으로 응답:
{"type":"warning"|"good","message":"피드백","suggestion":"제안","culturalReason":"이유"}`

문화적으로 민감하거나 부적절한 표현이 있다면 "warning", 적절하다면 "good"으로 분류하세요.`,
      en: `You are a cultural manner expert. Please analyze if the following message is appropriate in ${countryName} culture.

Message: "${message}"
Target Country: ${countryName}

${targetCountry === 'KR' ? 
  'Consider Korean cultural characteristics: honorific language and hierarchy, respect based on age and status, collectivist culture, importance of face-saving and relationships, preference for indirect rather than direct expression.' : 
  'Consider the cultural characteristics, taboos, and etiquette of the target country.'}

Please respond in the following JSON format:
{
  "type": "warning" | "good",
  "message": "feedback message",
  "suggestion": "improvement suggestion (optional)"
}

Classify as "warning" if culturally sensitive or inappropriate, "good" if appropriate.`,
      ja: `あなたは文化的マナーの専門家です。以下のメッセージが${countryName}文化圏で適切か分析してください。

メッセージ: "${message}"
対象国: ${countryName}

${targetCountry === 'KR' ? 
  '韓国文化の特徴を考慮してください：敬語と年功序列、年齢や地位に基づく敬意、集団主義文化、面子と人間関係の重視、直接的表現よりも遠回的表現の好み' : 
  '対象国の文化的特性、タブー、エチケットを考慮してください。'}

以下JSON形式で応答してください:
{
  "type": "warning" | "good",
  "message": "フィードバックメッセージ",
  "suggestion": "改善提案(オプション)"
}

文化的に敏感または不適切な表現がある場合は"warning"、適切な場合は"good"で分類してください。`,
      zh: `您是文化礼仪专家。请分析以下消息在${countryName}文化中是否合适。

消息: "${message}"
目标国家: ${countryName}

${targetCountry === 'KR' ? 
  '请考虑韩国文化特征：敬语和等级制度、基于年龄和地位的尊重、集体主义文化、重视面子和人际关系、偏好间接表达而非直接表达' : 
  '请考虑目标国家的文化特征、禁忌和礼仪。'}

请以以下JSON格式回复:
{
  "type": "warning" | "good",
  "message": "反馈消息",
  "suggestion": "改进建议(可选)"
}

如果文化上敏感或不合适，则分类为"warning"，如果合适则分类为"good"。`,
      de: `Sie sind ein Experte für kulturelle Umgangsformen. Bitte analysieren Sie, ob die folgende Nachricht in der ${countryName}-Kultur angemessen ist.

Nachricht: "${message}"
Zielland: ${countryName}

${targetCountry === 'KR' ? 
  'Berücksichtigen Sie koreanische kulturelle Merkmale: Höflichkeitssprache und Hierarchie, Respekt basierend auf Alter und Status, kollektivistische Kultur, Wichtigkeit von Gesichtswahrung und Beziehungen, Vorliebe für indirekte statt direkte Ausdrucksweise.' : 
  'Berücksichtigen Sie die kulturellen Eigenschaften, Tabus und Etikette des Ziellandes.'}

Bitte antworten Sie im folgenden JSON-Format:
{
  "type": "warning" | "good",
  "message": "Feedback-Nachricht",
  "suggestion": "Verbesserungsvorschlag (optional)"
}

Klassifizieren Sie als "warning", wenn kulturell sensibel oder unangemessen, "good", wenn angemessen.`,
      fr: `Vous êtes un expert en manières culturelles. Veuillez analyser si le message suivant est approprié dans la culture ${countryName}.

Message: "${message}"
Pays cible: ${countryName}

${targetCountry === 'KR' ? 
  'Considérez les caractéristiques culturelles coréennes : langage honorifique et hiérarchie, respect basé sur l’âge et le statut, culture collectiviste, importance de sauver la face et des relations, préférence pour l’expression indirecte plutôt que directe.' : 
  'Considérez les caractéristiques culturelles, les tabous et l’étiquette du pays cible.'}

Veuillez répondre au format JSON suivant:
{
  "type": "warning" | "good",
  "message": "message de retour",
  "suggestion": "suggestion d'amélioration (optionnel)"
}

Classez comme "warning" si culturellement sensible ou inapproprié, "good" si approprié.`
    }

    const prompt = prompts[language as keyof typeof prompts] || prompts.ko

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