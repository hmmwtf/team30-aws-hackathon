import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import { getCulturalData } from '../data/culturalData'
import { getRelationshipMannerCriteria } from '../data/relationshipMannerData'
import { withRetry, classifyError } from '../utils/errorHandler'

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  requestHandler: {
    requestTimeout: 8000,
    connectionTimeout: 3000
  }
})

export interface MannerAnalysisRequest {
  message: string
  targetCountry: string
  relationship: string
  language?: string
}

export interface MannerAnalysisResult {
  type: 'warning' | 'good'
  message: string
  culturalReason: string
  severity?: 'low' | 'medium' | 'high'
  suggestions?: string[]
  confidence: number
}

export class MannerAnalysisEngine {
  private generatePrompt(request: MannerAnalysisRequest): string {
    const { message, targetCountry, relationship, language = 'ko' } = request
    
    const culturalData = getCulturalData(targetCountry)
    const relationshipData = getRelationshipMannerCriteria(relationship)
    
    const countryNames = {
      KR: '대한민국', US: '미국', JP: '일본', CN: '중국',
      GB: '영국', DE: '독일', FR: '프랑스'
    }
    
    const countryName = countryNames[targetCountry as keyof typeof countryNames] || targetCountry

    return `당신은 국제적 문화 매너 전문가입니다. 다음 메시지를 ${countryName} 문화권에서 ${relationshipData?.relationship || relationship}에게 보내는 상황으로 분석해주세요.

**분석 대상 메시지**: "${message}"
**대상 국가**: ${countryName}
**관계**: ${relationshipData?.relationship || relationship}

**문화적 배경**:
- 의사소통 스타일: ${culturalData?.communicationStyle || '일반적'}
- 예의 수준: ${culturalData?.politenessLevel || 'medium'}
- 직접성: ${culturalData?.directness || 'medium'}
- 위계 중요도: ${culturalData?.hierarchyImportance || 'medium'}
- 민감 주제: ${culturalData?.sensitiveTopic.join(', ') || '없음'}
- 금기사항: ${culturalData?.taboos.join(', ') || '없음'}

**관계별 매너 기준**:
- 격식 수준: ${relationshipData?.formalityLevel || 'medium'}
- 존경 수준: ${relationshipData?.respectLevel || 'moderate'}
- 권장 언어 스타일: ${relationshipData?.languageStyle.join(', ') || '일반적'}
- 피해야 할 표현: ${relationshipData?.avoidExpressions.join(', ') || '없음'}
- 권장 표현: ${relationshipData?.recommendedExpressions.join(', ') || '없음'}
- 문화적 주의사항: ${relationshipData?.culturalNotes || '없음'}

**분석 기준**:
1. 문화적 민감성 (금기사항, 민감 주제 포함 여부)
2. 관계별 적절성 (격식 수준, 존경 표현)
3. 언어적 예의 (존댓말, 높임법 사용)
4. 의사소통 스타일 적합성

다음 JSON 형식으로 응답해주세요:
{
  "type": "warning" | "good",
  "message": "구체적인 피드백 메시지",
  "culturalReason": "문화적/관계적 근거",
  "severity": "low" | "medium" | "high" (warning인 경우만),
  "suggestions": ["개선 제안 1", "개선 제안 2"] (warning인 경우만),
  "confidence": 0.0-1.0 (분석 신뢰도)
}

**판정 기준**:
- "good": 문화적으로 적절하고 관계에 맞는 표현
- "warning": 문화적 민감성이나 관계별 예의에 문제가 있는 표현
- severity: low(가벼운 실수), medium(주의 필요), high(심각한 문제)
- confidence: 분석 결과에 대한 신뢰도 (0.8 이상 권장)`
  }

  async analyzeMessage(request: MannerAnalysisRequest): Promise<MannerAnalysisResult> {
    try {
      const prompt = this.generatePrompt(request)
      
      const command = new InvokeModelCommand({
        modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: 800,
          temperature: 0.2,
          messages: [{ role: 'user', content: prompt }]
        }),
        contentType: 'application/json',
        accept: 'application/json',
      })

      const response = await withRetry(async () => {
        return await client.send(command)
      }, 2, 1000)
      
      const responseBody = JSON.parse(new TextDecoder().decode(response.body))
      const rawText = responseBody.content[0].text.trim()
      
      // JSON 추출 및 파싱
      const jsonStart = rawText.indexOf('{')
      const jsonEnd = rawText.lastIndexOf('}')
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonText = rawText.substring(jsonStart, jsonEnd + 1)
        const result = JSON.parse(jsonText) as MannerAnalysisResult
        
        // 필수 필드 검증
        if (!result.type) result.type = 'good'
        if (!result.message) result.message = '분석 완료'
        if (!result.culturalReason) result.culturalReason = '기본 분석'
        if (!result.confidence) result.confidence = 0.7
        
        return result
      } else {
        throw new Error('Invalid JSON response')
      }
    } catch (error) {
      const appError = classifyError(error)
      
      // 기본 응답 반환
      return {
        type: 'good',
        message: '👍 매너 굿! 적절한 표현입니다.',
        culturalReason: '분석 중 오류가 발생하여 기본 응답을 제공합니다.',
        confidence: 0.5
      }
    }
  }
}