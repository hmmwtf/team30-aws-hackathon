import { NextRequest, NextResponse } from 'next/server'
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function POST(request: NextRequest) {
  try {
    const { message, targetCountry, relationship, language } = await request.json()
    console.log('🔍 fast-analyze API - Received:', { message, targetCountry, relationship, language })

    // 국가 코드를 언어로 매핑
    const getTargetLanguage = (countryCode: string) => {
      const countryLanguageMap: { [key: string]: string } = {
        'US': '영어',
        'GB': '영어', 
        'JP': '일본어',
        'CN': '중국어',
        'DE': '독일어',
        'FR': '프랑스어',
        'KR': '한국어'
      }
      return countryLanguageMap[countryCode] || '영어'
    }

    // 국가 코드를 국가명으로 매핑
    const getCountryName = (countryCode: string) => {
      const countryNameMap: { [key: string]: string } = {
        'US': '미국',
        'GB': '영국',
        'JP': '일본', 
        'CN': '중국',
        'DE': '독일',
        'FR': '프랑스',
        'KR': '한국'
      }
      return countryNameMap[countryCode] || countryCode
    }

    const targetLanguage = getTargetLanguage(targetCountry)
    const countryName = getCountryName(targetCountry)
    console.log('🌍 Mapped:', { targetCountry, targetLanguage, countryName })

    const prompt = `당신은 문화적 매너 전문가입니다. 다음 메시지를 분석하고 ${countryName}에서 ${relationship} 관계에서 사용하기에 적절한지 판단해주세요.

메시지: "${message}"
대상 국가: ${countryName}
관계: ${relationship}

다음 JSON 형식으로 응답해주세요:
{
  "type": "good" | "warning",
  "message": "피드백 메시지",
  "basicTranslation": "${targetLanguage}로 번역된 텍스트",
  "alternatives": [
    {
      "text": "대안 텍스트 1",
      "translatedText": "${targetLanguage}로 번역된 대안 1",
      "reason": "이유",
      "formalityLevel": "formal"
    }
  ]
}

만약 문화적으로 부적절하다면 type을 "warning"으로, 적절하다면 "good"으로 설정하세요.
warning인 경우 3개의 대안을 제시해주세요.`

    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 2000,
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

    const response = await client.send(command)
    const responseBody = JSON.parse(new TextDecoder().decode(response.body))
    
    let result
    try {
      const content = responseBody.content[0].text
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      // 파싱 실패 시 기본 번역이라도 제공
      result = {
        type: 'good',
        message: '👍 매너 굿!',
        basicTranslation: `[${targetLanguage} 번역 필요: ${message}]`
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Fast analyze error:', error)
    return NextResponse.json(
      { 
        type: 'good',
        message: '분석 중 오류가 발생했습니다.',
        basicTranslation: ''
      },
      { status: 500 }
    )
  }
}