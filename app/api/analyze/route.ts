import { NextRequest, NextResponse } from 'next/server'
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
})

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [Bedrock API] Analysis request received')
    
    const { message, targetCountry, language = 'ko' } = await request.json()
    console.log(`📝 [Bedrock API] Message: "${message}", Country: ${targetCountry}, Language: ${language}`)

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

다음 JSON 형식으로 응답해주세요:
{
  "type": "warning" | "good",
  "message": "피드백 메시지",
  "suggestion": "개선 제안 (선택사항)"
}

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
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 1000,
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

    console.log('🤖 [Bedrock API] Sending request to Claude 3 Sonnet...')
    const response = await client.send(command)
    console.log('✅ [Bedrock API] Response received from Bedrock')
    
    const responseBody = JSON.parse(new TextDecoder().decode(response.body))
    console.log('📄 [Bedrock API] Raw response:', JSON.stringify(responseBody, null, 2))
    
    let feedback
    try {
      feedback = JSON.parse(responseBody.content[0].text)
      console.log('🎯 [Bedrock API] Parsed feedback:', feedback)
    } catch (parseError) {
      console.log('⚠️ [Bedrock API] JSON parsing failed, using default response')
      feedback = {
        type: 'good',
        message: '👍 매너 굿! 문화적으로 적절한 표현이에요 (기본 응답)'
      }
    }

    console.log('📤 [Bedrock API] Sending response to client:', feedback)
    return NextResponse.json(feedback)
  } catch (error) {
    console.error('❌ [Bedrock API] Error occurred:', error)
    console.log('🔄 [Bedrock API] Falling back to default response')
    
    // 에러 시 기본 응답
    return NextResponse.json({
      type: 'good',
      message: '👍 매너 굿! 문화적으로 적절한 표현이에요 (에러 시 기본 응답)'
    })
  }
}