import { NextRequest, NextResponse } from 'next/server'
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb'

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  requestHandler: {
    requestTimeout: 15000,
    connectionTimeout: 5000
  }
})

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const docClient = DynamoDBDocumentClient.from(dynamoClient)

// 언어 매핑
const languageMap: { [key: string]: string } = {
  'ko': 'Korean',
  'en': 'English', 
  'ja': 'Japanese',
  'zh': 'Chinese',
  'de': 'German',
  'fr': 'French',
  'it': 'Italian',
  'ru': 'Russian',
  'hi': 'Hindi',
  'pt': 'Portuguese'
}

export async function POST(request: NextRequest) {
  try {
    const { message, chatId, senderEmail } = await request.json()
    console.log('🔍 [CHAT-ANALYZE] Request:', { message, chatId, senderEmail })

    // 1. 채팅방 정보 조회 (참가자 언어 정보 포함)
    const chatResult = await docClient.send(new GetCommand({
      TableName: 'CultureChat-Chats',
      Key: { id: chatId }
    }))

    if (!chatResult.Item) {
      return NextResponse.json({ error: '채팅방을 찾을 수 없습니다.' }, { status: 404 })
    }

    const chat = chatResult.Item
    const isFromSender = chat.participants[0] === senderEmail
    const receiverEmail = isFromSender ? chat.participants[1] : chat.participants[0]
    
    // 발신자와 수신자 언어 결정
    const senderLanguage = isFromSender ? chat.senderLanguage : chat.receiverLanguage
    const receiverLanguage = isFromSender ? chat.receiverLanguage : chat.senderLanguage
    const targetCountry = isFromSender ? chat.receiverCountry : chat.senderCountry
    
    console.log('🌐 [LANGUAGE-INFO]:', {
      senderLanguage,
      receiverLanguage, 
      targetCountry,
      needsTranslation: senderLanguage !== receiverLanguage
    })

    // 2. 매너 체크 (발신자용 - 상세 피드백 포함)
    const mannerResult = await checkManner(message, targetCountry, chat.relationship, senderLanguage, receiverLanguage)
    
    // 3. 번역 (수신자 언어로)
    let translatedMessage = message
    if (senderLanguage !== receiverLanguage) {
      translatedMessage = await translateMessage(message, senderLanguage, receiverLanguage)
    }

    // 4. 응답 구성
    const response = {
      // 발신자용 정보 (매너 체크 결과 포함)
      senderView: {
        type: mannerResult.type,
        message: mannerResult.message,
        alternatives: mannerResult.alternatives || [],
        confidence: mannerResult.confidence,
        originalText: message,
        translatedText: translatedMessage
      },
      // 수신자용 정보 (번역된 메시지만)
      receiverView: {
        text: translatedMessage,
        senderEmail: senderEmail,
        timestamp: new Date().toISOString()
      },
      // 메타 정보
      meta: {
        needsTranslation: senderLanguage !== receiverLanguage,
        senderLanguage,
        receiverLanguage,
        targetCountry
      }
    }

    console.log('📤 [CHAT-ANALYZE] Response:', {
      mannerType: response.senderView.type,
      hasTranslation: response.meta.needsTranslation,
      hasAlternatives: response.senderView.alternatives.length > 0
    })

    return NextResponse.json(response)

  } catch (error) {
    console.error('😨 [CHAT-ANALYZE] Error:', error)
    return NextResponse.json({ 
      error: '분석 중 오류가 발생했습니다.',
      senderView: {
        type: 'good',
        message: '👍 매너 굿!',
        originalText: '',
        translatedText: ''
      }
    }, { status: 500 })
  }
}

// 매너 체크 함수
async function checkManner(message: string, targetCountry: string, relationship: string, senderLang: string, receiverLang: string) {
  const langMap: { [key: string]: string } = {
    'ko': 'Korean', 'en': 'English', 'ja': 'Japanese', 'zh': 'Chinese',
    'de': 'German', 'fr': 'French', 'it': 'Italian', 'ru': 'Russian',
    'hi': 'Hindi', 'pt': 'Portuguese'
  }
  
  const senderLanguage = langMap[senderLang] || 'Korean'
  const receiverLanguage = langMap[receiverLang] || 'English'
  const needsTranslation = senderLang !== receiverLang

  const prompt = `You are a cultural communication expert. Analyze this ${senderLanguage} message for ${targetCountry} culture in a ${relationship} relationship context.

Message: "${message}"

Cultural Guidelines:
- ${targetCountry === 'US' ? 'Americans value directness but avoid controversial topics like politics, religion, personal finances' : ''}
- ${targetCountry === 'JP' ? 'Japanese culture values politeness, indirectness, and avoiding confrontational topics' : ''}
- ${targetCountry === 'CN' ? 'Chinese culture respects hierarchy and avoids sensitive political topics' : ''}
- ${targetCountry === 'GB' ? 'British culture appreciates politeness and understatement' : ''}
- ${targetCountry === 'DE' ? 'German culture values directness and punctuality' : ''}
- ${targetCountry === 'FR' ? 'French culture appreciates intellectual discussion but avoid personal topics early' : ''}

Relationship Context: ${relationship === 'boss' ? 'Formal, respectful tone required' : relationship === 'friend' ? 'Casual but respectful' : relationship === 'colleague' ? 'Professional and courteous' : 'Appropriate to relationship level'}

Respond in JSON format:

For APPROPRIATE messages:
{
  "type": "good",
  "message": "👍 매너 굿! 문화적으로 적절한 표현입니다.",
  "confidence": 0.85
}

For INAPPROPRIATE messages:
{
  "type": "warning", 
  "message": "⚠️ 문화적으로 부적절할 수 있습니다. 다른 표현을 사용해보세요.",
  "alternatives": [
    {
      "text": "Provide a polite ${senderLanguage} alternative here",
      ${needsTranslation ? `"translatedText": "Provide accurate ${receiverLanguage} translation here",` : ''}
      "reason": "더 정중하고 문화적으로 적절함",
      "formalityLevel": "formal"
    },
    {
      "text": "Provide a semi-formal ${senderLanguage} alternative here", 
      ${needsTranslation ? `"translatedText": "Provide accurate ${receiverLanguage} translation here",` : ''}
      "reason": "적당한 정중함과 친근함",
      "formalityLevel": "semi-formal"
    },
    {
      "text": "Provide a casual ${senderLanguage} alternative here",
      ${needsTranslation ? `"translatedText": "Provide accurate ${receiverLanguage} translation here",` : ''}
      "reason": "민감한 주제를 피하고 안전한 대화로 전환", 
      "formalityLevel": "casual"
    }
  ],
  "confidence": 0.90
}

CRITICAL INSTRUCTIONS:
1. Replace "Provide a polite ${senderLanguage} alternative here" with ACTUAL appropriate ${senderLanguage} text
2. Replace "Provide accurate ${receiverLanguage} translation here" with ACTUAL ${receiverLanguage} translations
3. For Korean to Japanese: Use proper Japanese honorifics and cultural expressions
4. Make alternatives natural, contextually appropriate, and culturally sensitive
5. Return ONLY the JSON with actual text, no placeholder text

Example for Korean offensive message:
- Formal Korean: "안녕하세요, 반갑습니다."
- Formal Japanese: "こんにちは、お会いできて嬉しいです。"`

  try {
    console.log('🤖 [MANNER-CHECK] Prompt:', prompt.substring(0, 200) + '...')
    
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 800, // 번역문 포함으로 늘림
        temperature: 0.2, // 약간 높여서 다양한 대안 생성
        messages: [{ role: 'user', content: prompt }]
      }),
      contentType: 'application/json',
      accept: 'application/json',
    })

    const response = await bedrockClient.send(command)
    const responseBody = JSON.parse(new TextDecoder().decode(response.body))
    const content = responseBody.content[0].text.trim()
    
    console.log('📝 [MANNER-RAW]:', content)
    
    // JSON 파싱
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
    
    console.log('🔍 [MANNER-JSON]:', jsonStr)
    const parsed = JSON.parse(jsonStr)
    console.log('✅ [MANNER-PARSED]:', JSON.stringify(parsed, null, 2))
    
    return parsed
    
  } catch (error) {
    console.error('매너 체크 실패:', error)
    return {
      type: 'good',
      message: '👍 매너 굿!',
      confidence: 0.7
    }
  }
}

// 번역 함수
async function translateMessage(message: string, fromLang: string, toLang: string): Promise<string> {
  const fromLanguage = languageMap[fromLang] || 'Korean'
  const toLanguage = languageMap[toLang] || 'English'
  
  if (fromLanguage === toLanguage) {
    return message
  }

  const prompt = `Translate the following ${fromLanguage} text to ${toLanguage}. Provide only the translation, no additional text.

Text: "${message}"

Translation:`

  try {
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0', // 빠른 번역을 위해 Haiku 사용
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 200,
        temperature: 0.1,
        messages: [{ role: 'user', content: prompt }]
      }),
      contentType: 'application/json',
      accept: 'application/json',
    })

    const response = await bedrockClient.send(command)
    const responseBody = JSON.parse(new TextDecoder().decode(response.body))
    return responseBody.content[0].text.trim()
    
  } catch (error) {
    console.error('번역 실패:', error)
    return message // 번역 실패 시 원문 반환
  }
}