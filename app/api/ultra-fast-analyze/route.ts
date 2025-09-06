import { NextRequest, NextResponse } from 'next/server'
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import { analysisCache, createCacheKey } from '../../utils/cache'

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  requestHandler: {
    requestTimeout: 5000,
    connectionTimeout: 1000
  }
})

export async function POST(request: NextRequest) {
  try {
    const { message, targetCountry, relationship, language } = await request.json()
    
    const cacheKey = `ultra_${createCacheKey(message, targetCountry, relationship)}`
    const cachedResult = analysisCache.get(cacheKey)
    if (cachedResult) {
      return NextResponse.json(cachedResult)
    }

    const languageMap: { [key: string]: string } = {
      'US': 'English', 'GB': 'English', 'JP': 'Japanese', 'CN': 'Chinese',
      'DE': 'German', 'FR': 'French', 'KR': 'Korean'
    }
    const targetLang = languageMap[targetCountry] || 'English'

    const userLangMap: { [key: string]: string } = {
      'ko': '한국어', 'en': 'English', 'ja': '일본어', 'zh': '중국어',
      'de': '독일어', 'fr': '프랑스어', 'it': '이탈리아어', 'ru': '러시아어',
      'hi': '힌디어', 'pt': '포르투갈어'
    }
    const userLang = userLangMap[language] || '한국어'
    
    const prompt = `Analyze message "${message}" for ${targetCountry} culture and ${relationship} relationship.
Provide feedback in ${userLang} and translate to ${targetLang}.

JSON format:
{
  "type": "good" or "warning",
  "msg": "feedback message in ${userLang}",
  "trans": "accurate ${targetLang} translation of the original message",
  "alts": [{"text": "alternative", "reason": "why"}]
}

IMPORTANT: Always provide accurate translation in "trans" field.`

    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 500,
        temperature: 0.1,
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
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        result = {
          type: parsed.type,
          message: parsed.msg,
          basicTranslation: parsed.trans,
          alternatives: parsed.alts || []
        }
      } else {
        throw new Error('No JSON found')
      }
    } catch (parseError) {
      const fallbackMsg = language === 'ko' ? '👍 매너 굿!' : 
                          language === 'en' ? '👍 Good manners!' :
                          language === 'ja' ? '👍 マナー良好!' :
                          language === 'zh' ? '👍 礼仪良好!' :
                          language === 'de' ? '👍 Gute Manieren!' :
                          language === 'fr' ? '👍 Bonnes manières!' :
                          '👍 매너 굿!'
      // 기본 번역 시도
      const basicTranslation = targetCountry === 'JP' && language === 'ko' ? 'こんにちは！良い一日です。' :
                               targetCountry === 'US' && language === 'ko' ? 'Hello! Have a good day.' :
                               targetCountry === 'CN' && language === 'ko' ? '你好！祈你今天过得愉快。' :
                               message
      result = {
        type: 'good',
        message: fallbackMsg,
        basicTranslation: basicTranslation
      }
    }

    analysisCache.set(cacheKey, result, 60000)
    
    return NextResponse.json(result)
  } catch (error) {
    const { language } = await request.json().catch(() => ({ language: 'ko' }))
    const fallbackMsg = language === 'ko' ? '👍 매너 굿!' : 
                        language === 'en' ? '👍 Good manners!' :
                        '👍 매너 굿!'
    return NextResponse.json({
      type: 'good',
      message: fallbackMsg,
      basicTranslation: ''
    })
  }
}