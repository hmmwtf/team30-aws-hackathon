import { NextRequest, NextResponse } from 'next/server'
import { MannerAnalysisEngine } from '../../services/MannerAnalysisEngine'
import { analysisCache } from '../../utils/cache'

const analysisEngine = new MannerAnalysisEngine()

export async function POST(request: NextRequest) {
  try {
    const { message, targetCountry, relationship, language = 'ko' } = await request.json()
    
    // 입력 검증
    if (!message || !targetCountry || !relationship) {
      return NextResponse.json(
        { error: 'Missing required fields: message, targetCountry, relationship' },
        { status: 400 }
      )
    }

    // 캐시 확인
    const cacheKey = analysisCache.generateKey(`${message}-${targetCountry}-${relationship}`)
    const cachedResult = analysisCache.get(cacheKey)
    if (cachedResult) {
      return NextResponse.json(cachedResult)
    }

    // 매너 분석 실행
    const result = await analysisEngine.analyzeMessage({
      message,
      targetCountry,
      relationship,
      language
    })

    // 결과 캐싱 (신뢰도가 높은 경우만)
    if (result.confidence >= 0.8) {
      analysisCache.set(cacheKey, result)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Enhanced analysis failed:', error)
    
    return NextResponse.json({
      type: 'good',
      message: '👍 매너 굿! 적절한 표현입니다.',
      culturalReason: '분석 중 오류가 발생하여 기본 응답을 제공합니다.',
      confidence: 0.5
    })
  }
}