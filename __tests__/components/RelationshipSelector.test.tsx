import { render, screen, fireEvent } from '@testing-library/react'
import RelationshipSelector from '../../app/components/RelationshipSelector'

describe('RelationshipSelector', () => {
  const mockOnRelationshipChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all relationship options', () => {
    render(
      <RelationshipSelector
        selectedRelationship="friend"
        onRelationshipChange={mockOnRelationshipChange}
      />
    )

    expect(screen.getByText(/상사/)).toBeInTheDocument()
    expect(screen.getByText(/동료/)).toBeInTheDocument()
    expect(screen.getByText(/친구/)).toBeInTheDocument()
    expect(screen.getByText(/연인/)).toBeInTheDocument()
    expect(screen.getByText(/부모님/)).toBeInTheDocument()
    expect(screen.getByText(/낯선 사람/)).toBeInTheDocument()
  })

  it('highlights selected relationship', () => {
    render(
      <RelationshipSelector
        selectedRelationship="boss"
        onRelationshipChange={mockOnRelationshipChange}
      />
    )

    const bossButton = screen.getByText(/상사/).closest('button')
    expect(bossButton).toHaveClass('border-blue-500', 'bg-blue-50', 'text-blue-700')
  })

  it('calls onRelationshipChange when relationship is selected', () => {
    render(
      <RelationshipSelector
        selectedRelationship="friend"
        onRelationshipChange={mockOnRelationshipChange}
      />
    )

    const colleagueButton = screen.getByText(/동료/).closest('button')
    fireEvent.click(colleagueButton!)

    expect(mockOnRelationshipChange).toHaveBeenCalledWith('colleague')
  })

  it('shows relationship descriptions', () => {
    render(
      <RelationshipSelector
        selectedRelationship="friend"
        onRelationshipChange={mockOnRelationshipChange}
      />
    )

    expect(screen.getByText('높은 격식, 극존댓말')).toBeInTheDocument()
    expect(screen.getByText('중간 격식, 존댓말')).toBeInTheDocument()
    expect(screen.getByText('낮은 격식, 친근한 표현')).toBeInTheDocument()
    expect(screen.getByText('친밀한 표현, 애칭 사용')).toBeInTheDocument()
    expect(screen.getByText('높임말, 효도 표현')).toBeInTheDocument()
    expect(screen.getByText('정중한 표현, 예의')).toBeInTheDocument()
  })
})