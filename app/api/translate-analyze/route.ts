import { NextRequest, NextResponse } from 'next/server'
import { TranslateClient, TranslateTextCommand } from '@aws-sdk/client-translate'
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'

const translateClient = new TranslateClient({
  region: process.env.AWS_REGION || 'us-east-1'
})

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1'
})

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage, sourceLanguage, targetCountry, userLanguage = 'ko' } = await request.json()

    // 1. 대상 국가에 따른 언어 매핑
    const countryToLanguage: Record<string, string> = {
      'KR': 'ko',  // 한국
      'US': 'en',  // 미국
      'JP': 'ja',  // 일본
      'CN': 'zh',  // 중국
      'GB': 'en',  // 영국
      'DE': 'de',  // 독일
      'FR': 'fr',  // 프랑스
      'IT': 'it',  // 이탈리아
      'RU': 'ru',  // 러시아
      'IN': 'hi',  // 인도 (히디어)
      'BR': 'pt',  // 브라질 (포르투갈어)
      'AU': 'en'   // 호주
    }

    // 2. 언어 감지 (간단한 휴리스틱 사용)
    let detectedSourceLang = sourceLanguage
    if (!sourceLanguage || sourceLanguage === 'auto') {
      // 한글이 포함되어 있으면 한국어, 그렇지 않으면 영어로 가정
      const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text)
      detectedSourceLang = hasKorean ? 'ko' : 'en'
    }

    // 3. 대상 언어 결정 (대상 국가에 따라)
    const actualTargetLanguage = countryToLanguage[targetCountry] || 'en'

    // 4. 번역 실행
    const translateCommand = new TranslateTextCommand({
      Text: text,
      SourceLanguageCode: detectedSourceLang,
      TargetLanguageCode: actualTargetLanguage
    })
    const translateResult = await translateClient.send(translateCommand)

    // 3. 매너 체크 (사용자 언어에 맞게)
    const mannerPrompts = {
      ko: `다음 메시지가 ${targetCountry} 문화권에서 적절한지 분석해주세요.

원문: "${text}"
번역문: "${translateResult.TranslatedText}"
대상 국가: ${targetCountry}

한국어로 피드백을 제공해주세요. JSON 형식:
{"type":"warning"|"good","message":"피드백","suggestion":"제안"}`,
      en: `Please analyze if the following message is appropriate in ${targetCountry} culture.

Original: "${text}"
Translated: "${translateResult.TranslatedText}"
Target Country: ${targetCountry}

Please provide feedback in English. JSON format:
{"type":"warning"|"good","message":"feedback","suggestion":"suggestion"}`,
      ja: `以下のメッセージが${targetCountry}文化圈で適切か分析してください。

原文: "${text}"
翻訳文: "${translateResult.TranslatedText}"
対象国: ${targetCountry}

日本語でフィードバックを提供してください。JSON形式:
{"type":"warning"|"good","message":"フィードバック","suggestion":"提案"}`
    }
    
    const mannerPrompt = mannerPrompts[userLanguage as keyof typeof mannerPrompts] || mannerPrompts.ko

    const bedrockCommand = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 300,
        temperature: 0.1,
        messages: [{ role: 'user', content: mannerPrompt }]
      }),
      contentType: 'application/json',
      accept: 'application/json'
    })

    const bedrockResult = await bedrockClient.send(bedrockCommand)
    const responseBody = JSON.parse(new TextDecoder().decode(bedrockResult.body))
    
    let mannerFeedback
    try {
      const rawText = responseBody.content[0].text
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      mannerFeedback = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        type: 'good',
        message: '문화적으로 적절한 표현입니다.',
        suggestion: ''
      }
    } catch {
      mannerFeedback = {
        type: 'good',
        message: '문화적으로 적절한 표현입니다.',
        suggestion: ''
      }
    }

    return NextResponse.json({
      originalText: text,
      translatedText: translateResult.TranslatedText,
      detectedLanguage: detectedSourceLang,
      targetLanguage: actualTargetLanguage,
      targetCountry,
      mannerFeedback
    })

  } catch (error) {
    console.error('Translation/Analysis error:', error)
    return NextResponse.json(
      { error: '번역 또는 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}