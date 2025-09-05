import { NextRequest, NextResponse } from 'next/server'
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import { TranslateClient, TranslateTextCommand } from '@aws-sdk/client-translate'
import { getCulturalData } from '../../data/culturalData'
import { getRelationshipMannerCriteria } from '../../data/relationshipMannerData'
import { fastCache } from '../../utils/fastCache'

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  requestHandler: {
    requestTimeout: 5000, // 5초로 단축
    connectionTimeout: 2000
  }
})

const translateClient = new TranslateClient({
  region: process.env.AWS_REGION || 'us-east-1'
})

export async function POST(request: NextRequest) {
  try {
    const { message, targetCountry, relationship, language = 'ko' } = await request.json()
    
    // 🚀 캐시 확인 (가장 빠른 응답)
    const cacheKey = fastCache.generateKey(message, targetCountry, relationship)
    const cachedResult = fastCache.get(cacheKey)
    if (cachedResult) {
      console.log('⚡ Cache hit - instant response')
      return NextResponse.json(cachedResult)
    }
    
    const culturalData = getCulturalData(targetCountry)
    const relationshipData = getRelationshipMannerCriteria(relationship)
    
    const countryNames = {
      KR: '대한민국', US: '미국', JP: '일본', CN: '중국',
      GB: '영국', DE: '독일', FR: '프랑스'
    }
    const countryName = countryNames[targetCountry as keyof typeof countryNames] || targetCountry
    
    const targetLanguageMap = {
      KR: 'ko', US: 'en', JP: 'ja', CN: 'zh', 
      GB: 'en', DE: 'de', FR: 'fr', IN: 'hi', 
      IT: 'it', RU: 'ru', BR: 'pt', AU: 'en'
    }
    const targetLang = targetLanguageMap[targetCountry as keyof typeof targetLanguageMap] || 'en'

    // 🚀 병렬 처리: 매너 체크와 기본 번역 동시 실행
    const [mannerResult, basicTranslation] = await Promise.all([
      // 매너 체크 (간단한 프롬프트로 최적화)
      analyzeMannerFast(message, countryName, relationshipData, culturalData),
      // 기본 번역
      translateText(message, targetLang)
    ])

    // warning인 경우에만 대안 생성 (병렬 처리)
    let finalResult
    if (mannerResult.type === 'warning') {
      const alternatives = await generateAlternativesFast(message, relationshipData, targetLang)
      finalResult = {
        ...mannerResult,
        alternatives,
        basicTranslation
      }
    } else {
      finalResult = {
        ...mannerResult,
        basicTranslation
      }
    }
    
    // 🚀 결과 캐싱 (다음 요청을 위해)
    fastCache.set(cacheKey, finalResult)
    
    return NextResponse.json(finalResult)
  } catch (error) {
    console.error('Fast analysis failed:', error)
    return NextResponse.json({
      type: 'good',
      message: '👍 매너 굿! 적절한 표현입니다.',
      culturalReason: '빠른 분석 모드',
      basicTranslation: message
    })
  }
}

// 🚀 최적화된 매너 분석 (간단한 프롬프트)
async function analyzeMannerFast(message: string, countryName: string, relationshipData: any, culturalData: any) {
  const prompt = `문화 매너 체크: "${message}"
대상: ${countryName} ${relationshipData?.relationship}
금기: ${culturalData?.taboos.slice(0, 3).join(', ')}

JSON 응답:
{"type":"warning|good","message":"피드백","culturalReason":"이유"}`

  const command = new InvokeModelCommand({
    modelId: 'anthropic.claude-3-haiku-20240307-v1:0', // 가장 빠른 모델
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 200, // 토큰 수 최소화
      temperature: 0.1,
      messages: [{ role: 'user', content: prompt }]
    }),
    contentType: 'application/json',
    accept: 'application/json',
  })

  const response = await bedrockClient.send(command)
  const responseBody = JSON.parse(new TextDecoder().decode(response.body))
  
  try {
    const rawText = responseBody.content[0].text.trim()
    const jsonStart = rawText.indexOf('{')
    const jsonEnd = rawText.lastIndexOf('}')
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      return JSON.parse(rawText.substring(jsonStart, jsonEnd + 1))
    }
  } catch (e) {
    // 파싱 실패 시 기본값
  }
  
  return {
    type: 'good',
    message: '👍 매너 굿!',
    culturalReason: '적절한 표현입니다.'
  }
}

// 🚀 빠른 번역
async function translateText(text: string, targetLang: string): Promise<string> {
  if (targetLang === 'ko') return text // 한국어면 번역 불필요
  
  try {
    const command = new TranslateTextCommand({
      Text: text,
      SourceLanguageCode: 'ko',
      TargetLanguageCode: targetLang
    })
    
    const result = await translateClient.send(command)
    return result.TranslatedText || text
  } catch (error) {
    return text
  }
}

// 🚀 실제 대안 생성 (AI 기반)
async function generateAlternativesFast(message: string, relationshipData: any, targetLang: string) {
  const prompt = `다음 메시지를 ${relationshipData?.relationship}에게 보내기 적절하도록 3가지 대안을 만들어주세요:

원본: "${message}"
관계: ${relationshipData?.relationship}

3가지 실제 대안을 JSON으로:
{
  "alternatives": [
    {"text": "가장 정중한 실제 문장", "level": "formal"},
    {"text": "적당히 정중한 실제 문장", "level": "semi-formal"},
    {"text": "친근한 실제 문장", "level": "casual"}
  ]
}`

  const command = new InvokeModelCommand({
    modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 300,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }]
    }),
    contentType: 'application/json',
    accept: 'application/json',
  })

  try {
    const response = await bedrockClient.send(command)
    const responseBody = JSON.parse(new TextDecoder().decode(response.body))
    const rawText = responseBody.content[0].text.trim()
    
    const jsonStart = rawText.indexOf('{')
    const jsonEnd = rawText.lastIndexOf('}')
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const parsed = JSON.parse(rawText.substring(jsonStart, jsonEnd + 1))
      
      // 🚀 실제 대안들을 병렬 번역
      const translatedAlternatives = await Promise.all(
        parsed.alternatives.map(async (alt: any) => {
          const translatedText = await translateText(alt.text, targetLang)
          return {
            text: alt.text,
            translatedText,
            reason: `${relationshipData?.relationship}에게 적절한 ${alt.level} 표현`,
            formalityLevel: alt.level
          }
        })
      )
      
      return translatedAlternatives
    }
  } catch (error) {
    console.error('Alternative generation failed:', error)
  }

  // 폴백: 기본 대안들
  const fallbackAlternatives = [
    { text: '죄송합니다', level: 'formal' },
    { text: '미안해요', level: 'semi-formal' },
    { text: '미안', level: 'casual' }
  ]

  return Promise.all(
    fallbackAlternatives.map(async (alt) => {
      const translatedText = await translateText(alt.text, targetLang)
      return {
        text: alt.text,
        translatedText,
        reason: `${relationshipData?.relationship}에게 적절한 표현`,
        formalityLevel: alt.level
      }
    })
  )
}