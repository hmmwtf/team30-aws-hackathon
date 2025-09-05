import { render, screen } from '@testing-library/react'
import EnhancedMannerFeedback from '../../app/components/EnhancedMannerFeedback'

describe('EnhancedMannerFeedback', () => {
  it('renders good feedback correctly', () => {
    const feedback = {
      type: 'good' as const,
      message: '적절한 표현입니다.',
      culturalReason: '한국 문화에 맞는 표현입니다.',
      confidence: 0.9
    }

    render(<EnhancedMannerFeedback feedback={feedback} />)

    expect(screen.getByText('매너 굿!')).toBeInTheDocument()
    expect(screen.getByText('적절한 표현입니다.')).toBeInTheDocument()
    expect(screen.getByText(/한국 문화에 맞는 표현입니다/)).toBeInTheDocument()
    expect(screen.getByText('신뢰도: 90%')).toBeInTheDocument()
  })

  it('renders warning feedback with suggestions', () => {
    const feedback = {
      type: 'warning' as const,
      message: '부적절한 표현입니다.',
      culturalReason: '상사에게는 높임법을 사용해야 합니다.',
      severity: 'high' as const,
      suggestions: ['존댓말 사용', '정중한 표현으로 변경'],
      confidence: 0.85
    }

    render(<EnhancedMannerFeedback feedback={feedback} />)

    expect(screen.getByText('심각 필요')).toBeInTheDocument()
    expect(screen.getByText('부적절한 표현입니다.')).toBeInTheDocument()
    expect(screen.getByText('💡 개선 제안:')).toBeInTheDocument()
    expect(screen.getByText('존댓말 사용')).toBeInTheDocument()
    expect(screen.getByText('정중한 표현으로 변경')).toBeInTheDocument()
    expect(screen.getByText('신뢰도: 85%')).toBeInTheDocument()
  })

  it('renders different severity levels correctly', () => {
    const lowSeverityFeedback = {
      type: 'warning' as const,
      message: '약간 부적절합니다.',
      culturalReason: '더 정중한 표현이 좋겠습니다.',
      severity: 'low' as const,
      confidence: 0.7
    }

    const { rerender } = render(<EnhancedMannerFeedback feedback={lowSeverityFeedback} />)
    expect(screen.getByText('주의 필요')).toBeInTheDocument()

    const mediumSeverityFeedback = {
      ...lowSeverityFeedback,
      severity: 'medium' as const
    }

    rerender(<EnhancedMannerFeedback feedback={mediumSeverityFeedback} />)
    expect(screen.getByText('경고 필요')).toBeInTheDocument()
  })

  it('handles feedback without confidence score', () => {
    const feedback = {
      type: 'good' as const,
      message: '좋은 표현입니다.',
      culturalReason: '적절합니다.',
      confidence: 0
    }

    render(<EnhancedMannerFeedback feedback={feedback} />)

    expect(screen.queryByText(/신뢰도/)).not.toBeInTheDocument()
  })
})