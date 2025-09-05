import { NextRequest, NextResponse } from 'next/server'
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
})

export async function POST(request: NextRequest) {
  try {
    const { message, targetLanguage, sourceLanguage } = await request.json()

    const prompt = `
Translate the following message from ${sourceLanguage} to ${targetLanguage}. 
Provide only the translation without any additional text or explanation.

Message: "${message}"

Translation:`

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

    const response = await client.send(command)
    const responseBody = JSON.parse(new TextDecoder().decode(response.body))
    const translation = responseBody.content[0].text.trim()

    return NextResponse.json({ translation })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json({ 
      translation: message,
      error: 'Translation service unavailable'
    })
  }
}