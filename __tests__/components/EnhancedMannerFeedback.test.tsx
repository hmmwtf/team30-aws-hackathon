import { render, screen } from '@testing-library/react'
import EnhancedMannerFeedback from '../../app/components/EnhancedMannerFeedback'

describe('EnhancedMannerFeedback', () => {
  it('renders good feedback correctly', () => {
    render(
      <EnhancedMannerFeedback
        feedback={{
          type: 'good',
          message: '👍 매너 굿!',
          confidence: 0.9
        }}
        language="ko"
      />
    )

    expect(screen.getByText('👍 매너 굿!')).toBeInTheDocument()
    expect(screen.getByText(/90%/)).toBeInTheDocument()
  })

  it('renders warning feedback correctly', () => {
    render(
      <EnhancedMannerFeedback
        feedback={{
          type: 'warning',
          message: '⚠️ 부적절한 표현입니다',
          suggestion: '다른 표현을 사용해보세요',
          confidence: 0.85
        }}
        language="ko"
      />
    )

    expect(screen.getByText('⚠️ 부적절한 표현입니다')).toBeInTheDocument()
    expect(screen.getByText('다른 표현을 사용해보세요')).toBeInTheDocument()
  })

  it('hides confidence when showConfidence is false', () => {
    render(
      <EnhancedMannerFeedback
        feedback={{
          type: 'good',
          message: '👍 매너 굿!',
          confidence: 0.9
        }}
        language="ko"
        showConfidence={false}
      />
    )

    expect(screen.queryByText(/90%/)).not.toBeInTheDocument()
  })
})