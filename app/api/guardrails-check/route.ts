import { NextRequest, NextResponse } from 'next/server'
import { BedrockRuntimeClient, ApplyGuardrailCommand } from '@aws-sdk/client-bedrock-runtime'

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  requestHandler: {
    requestTimeout: 10000,
    connectionTimeout: 3000
  }
})

export async function POST(request: NextRequest) {
  try {
    const { message, targetCountry, relationship } = await request.json()
    console.log('🛡️ [GUARDRAILS] Request:', JSON.stringify({ message, targetCountry, relationship }, null, 2))

    // Guardrails 설정 (실제 환경에서는 AWS Console에서 생성한 Guardrail ID 사용)
    const guardrailId = process.env.BEDROCK_GUARDRAIL_ID || 'default'
    const guardrailVersion = process.env.BEDROCK_GUARDRAIL_VERSION || '1'

    const command = new ApplyGuardrailCommand({
      guardrailIdentifier: guardrailId,
      guardrailVersion: guardrailVersion,
      source: 'INPUT',
      content: [{
        text: {
          text: message
        }
      }]
    })

    try {
      const response = await client.send(command)
      console.log('🛡️ [GUARDRAILS] Response:', JSON.stringify(response, null, 2))

      // Guardrails 결과 분석
      if (response.action === 'BLOCKED') {
        return NextResponse.json({
          type: 'blocked',
          message: '⚠️ 부적절한 내용이 감지되었습니다. 다른 표현을 사용해주세요.',
          reason: 'guardrails_blocked',
          confidence: 0.95
        })
      } else {
        return NextResponse.json({
          type: 'allowed',
          message: '✅ 내용이 적절합니다.',
          confidence: 0.90
        })
      }

    } catch (guardrailError) {
      console.log('🛡️ [GUARDRAILS] Not available, using fallback detection')
      
      // Guardrails가 없을 때 간단한 욕설 필터링
      const result = await simpleContentFilter(message, targetCountry, relationship)
      return NextResponse.json(result)
    }

  } catch (error) {
    console.error('😨 [GUARDRAILS-ERROR]:', JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, null, 2))

    return NextResponse.json({
      type: 'allowed',
      message: '✅ 검사를 완료했습니다.',
      confidence: 0.70
    })
  }
}

// 간단한 콘텐츠 필터링 (Guardrails 대체)
async function simpleContentFilter(message: string, targetCountry: string, relationship: string) {
  // 한국어 욕설/부적절한 표현 목록
  const inappropriateWords = [
    '시발', '씨발', '개새끼', '병신', '미친', '좆', '꺼져', '죽어', '바보', '멍청이'
  ]

  // 정치적/종교적 민감 키워드
  const sensitiveTopics = [
    '트럼프', '바이든', '정치', '종교', '기독교', '불교', '이슬람', '공산당', '민주당', '공화당'
  ]

  const lowerMessage = message.toLowerCase()
  
  // 욕설 검사
  const hasInappropriate = inappropriateWords.some(word => 
    message.includes(word) || lowerMessage.includes(word.toLowerCase())
  )

  // 민감한 주제 검사
  const hasSensitive = sensitiveTopics.some(topic => 
    message.includes(topic) || lowerMessage.includes(topic.toLowerCase())
  )

  if (hasInappropriate) {
    return {
      type: 'blocked',
      message: '⚠️ 부적절한 언어가 감지되었습니다. 정중한 표현을 사용해주세요.',
      reason: 'inappropriate_language',
      confidence: 0.90,
      alternatives: [
        {
          text: '죄송합니다. 다시 말씀드리겠습니다.',
          translatedText: getTranslation('죄송합니다. 다시 말씀드리겠습니다.', targetCountry),
          reason: '정중한 사과 표현',
          formalityLevel: 'formal'
        },
        {
          text: '실수했습니다. 양해 부탁드립니다.',
          translatedText: getTranslation('실수했습니다. 양해 부탁드립니다.', targetCountry),
          reason: '실수를 인정하는 표현',
          formalityLevel: 'semi-formal'
        },
        {
          text: '다른 주제로 이야기해볼까요?',
          translatedText: getTranslation('다른 주제로 이야기해볼까요?', targetCountry),
          reason: '주제 전환 제안',
          formalityLevel: 'casual'
        }
      ]
    }
  }

  if (hasSensitive && (relationship === 'boss' || relationship === 'colleague')) {
    return {
      type: 'warning',
      message: '⚠️ 직장에서는 정치나 종교 주제를 피하는 것이 좋습니다.',
      reason: 'sensitive_topic_workplace',
      confidence: 0.85,
      alternatives: [
        {
          text: '업무 관련해서 이야기해볼까요?',
          translatedText: getTranslation('업무 관련해서 이야기해볼까요?', targetCountry),
          reason: '업무 관련 주제로 전환',
          formalityLevel: 'formal'
        },
        {
          text: '오늘 날씨가 좋네요.',
          translatedText: getTranslation('오늘 날씨가 좋네요.', targetCountry),
          reason: '안전한 일상 주제',
          formalityLevel: 'semi-formal'
        },
        {
          text: '점심 뭐 드셨나요?',
          translatedText: getTranslation('점심 뭐 드셨나요?', targetCountry),
          reason: '가벼운 일상 대화',
          formalityLevel: 'casual'
        }
      ]
    }
  }

  return {
    type: 'allowed',
    message: '✅ 적절한 표현입니다.',
    confidence: 0.85
  }
}

// 간단한 번역 함수
function getTranslation(text: string, targetCountry: string): string {
  const translations: { [key: string]: { [key: string]: string } } = {
    US: {
      '죄송합니다. 다시 말씀드리겠습니다.': 'I apologize. Let me rephrase that.',
      '실수했습니다. 양해 부탁드립니다.': 'I made a mistake. Please understand.',
      '다른 주제로 이야기해볼까요?': 'Shall we talk about something else?',
      '업무 관련해서 이야기해볼까요?': 'Shall we discuss work-related matters?',
      '오늘 날씨가 좋네요.': 'The weather is nice today.',
      '점심 뭐 드셨나요?': 'What did you have for lunch?'
    },
    JP: {
      '죄송합니다. 다시 말씀드리겠습니다.': '申し訳ございません。言い直させていただきます。',
      '실수했습니다. 양해 부탁드립니다.': '間違いました。ご理解をお願いします。',
      '다른 주제로 이야기해볼까요?': '他の話題について話しませんか？',
      '업무 관련해서 이야기해볼까요?': '仕事の話をしませんか？',
      '오늘 날씨가 좋네요.': '今日はいい天気ですね。',
      '점심 뭐 드셨나요?': 'お昼は何を食べましたか？'
    },
    CN: {
      '죄송합니다. 다시 말씀드리겠습니다.': '对不起，让我重新说一遍。',
      '실수했습니다. 양해 부탁드립니다.': '我犯了个错误，请理解。',
      '다른 주제로 이야기해볼까요?': '我们聊点别的话题吧？',
      '업무 관련해서 이야기해볼까요?': '我们聊聊工作相关的事情吧？',
      '오늘 날씨가 좋네요.': '今天天气真好。',
      '점심 뭐 드셨나요?': '你午饭吃了什么？'
    }
  }

  return translations[targetCountry]?.[text] || text
}