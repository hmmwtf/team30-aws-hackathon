import { NextRequest, NextResponse } from 'next/server'
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
})

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [Bedrock API] Analysis request received')
    
    const { message, targetCountry } = await request.json()
    console.log(`📝 [Bedrock API] Message: "${message}", Country: ${targetCountry}`)

    const prompt = `
당신은 문화적 매너 전문가입니다. 다음 메시지가 ${targetCountry} 문화권에서 적절한지 분석해주세요.

메시지: "${message}"
대상 국가: ${targetCountry}

다음 JSON 형식으로 응답해주세요:
{
  "type": "warning" | "good",
  "message": "피드백 메시지",
  "suggestion": "개선 제안 (선택사항)"
}

문화적으로 민감하거나 부적절한 표현이 있다면 "warning", 적절하다면 "good"으로 분류하세요.
`

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