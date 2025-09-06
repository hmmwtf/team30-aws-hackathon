import { render, screen, fireEvent } from '@testing-library/react'
import AlternativeSelector from '../../app/components/AlternativeSelector'

const mockAlternatives = [
  {
    text: '죄송합니다만, 회의 시간을 조정해 주실 수 있을까요?',
    reason: '정중한 요청 표현',
    formalityLevel: 'formal' as const
  },
  {
    text: '회의 시간 변경이 가능한지 여쭤봐도 될까요?',
    reason: '존댓말 사용',
    formalityLevel: 'semi-formal' as const
  },
  {
    text: '회의 시간 바꿀 수 있어요?',
    reason: '친근한 표현',
    formalityLevel: 'casual' as const
  }
]

describe('AlternativeSelector', () => {
  const mockOnSelect = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders alternatives correctly', () => {
    render(
      <AlternativeSelector
        alternatives={mockAlternatives}
        originalMessage="회의 시간 바꿔"
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText('🔄 더 나은 표현 제안')).toBeInTheDocument()
    expect(screen.getByText('"회의 시간 바꿔"')).toBeInTheDocument()
    
    mockAlternatives.forEach(alt => {
      expect(screen.getByText(`"${alt.text}"`)).toBeInTheDocument()
      expect(screen.getByText(alt.reason)).toBeInTheDocument()
    })
  })

  it('shows formality level badges', () => {
    render(
      <AlternativeSelector
        alternatives={mockAlternatives}
        originalMessage="회의 시간 바꿔"
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText('격식체')).toBeInTheDocument()
    expect(screen.getByText('준격식체')).toBeInTheDocument()
    expect(screen.getByText('친근체')).toBeInTheDocument()
  })

  it('allows selecting an alternative', () => {
    render(
      <AlternativeSelector
        alternatives={mockAlternatives}
        originalMessage="회의 시간 바꿔"
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    )

    const firstOption = screen.getByText(`"${mockAlternatives[0].text}"`).closest('div')
    fireEvent.click(firstOption!)

    const selectButton = screen.getByText('선택한 표현 사용')
    expect(selectButton).not.toBeDisabled()
    
    fireEvent.click(selectButton)
    expect(mockOnSelect).toHaveBeenCalledWith(mockAlternatives[0].text, undefined)
  })

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <AlternativeSelector
        alternatives={mockAlternatives}
        originalMessage="회의 시간 바꿔"
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    )

    fireEvent.click(screen.getByText('취소'))
    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('disables select button when no alternative is selected', () => {
    render(
      <AlternativeSelector
        alternatives={mockAlternatives}
        originalMessage="회의 시간 바꿔"
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    )

    const selectButton = screen.getByText('선택한 표현 사용')
    expect(selectButton).toBeDisabled()
  })
})