import { render, screen } from '@testing-library/react'
import MannerFeedback from '../../app/components/MannerFeedback'

describe('MannerFeedback', () => {
  test('renders warning feedback correctly', () => {
    const warningFeedback = {
      type: 'warning' as const,
      message: '이 표현은 주의가 필요해요',
      suggestion: '다른 표현을 사용해보세요'
    }

    render(<MannerFeedback feedback={warningFeedback} />)

    expect(screen.getByText('⚠️')).toBeInTheDocument()
    expect(screen.getByText('이 표현은 주의가 필요해요')).toBeInTheDocument()
    expect(screen.getByText('💡 다른 표현을 사용해보세요')).toBeInTheDocument()
  })

  test('renders good feedback correctly', () => {
    const goodFeedback = {
      type: 'good' as const,
      message: '👍 매너 굿! 문화적으로 적절한 표현이에요'
    }

    render(<MannerFeedback feedback={goodFeedback} />)

    expect(screen.getByText('✅')).toBeInTheDocument()
    expect(screen.getByText('👍 매너 굿! 문화적으로 적절한 표현이에요')).toBeInTheDocument()
  })

  test('applies correct styling for warning', () => {
    const warningFeedback = {
      type: 'warning' as const,
      message: '경고 메시지'
    }

    const { container } = render(<MannerFeedback feedback={warningFeedback} />)
    const feedbackDiv = container.firstChild as HTMLElement

    expect(feedbackDiv).toHaveClass('bg-yellow-50', 'border-yellow-400')
  })

  test('applies correct styling for good feedback', () => {
    const goodFeedback = {
      type: 'good' as const,
      message: '좋은 메시지'
    }

    const { container } = render(<MannerFeedback feedback={goodFeedback} />)
    const feedbackDiv = container.firstChild as HTMLElement

    expect(feedbackDiv).toHaveClass('bg-green-50', 'border-green-400')
  })

  test('does not render suggestion when not provided', () => {
    const feedbackWithoutSuggestion = {
      type: 'warning' as const,
      message: '경고 메시지'
    }

    render(<MannerFeedback feedback={feedbackWithoutSuggestion} />)

    expect(screen.queryByText(/💡/)).not.toBeInTheDocument()
  })
})