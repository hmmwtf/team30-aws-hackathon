import { render, screen, fireEvent } from '@testing-library/react'
import CountrySelector from '../../app/components/CountrySelector'

describe('CountrySelector', () => {
  const mockOnCountryChange = jest.fn()

  beforeEach(() => {
    mockOnCountryChange.mockClear()
  })

  test('renders all supported countries', () => {
    render(
      <CountrySelector 
        selectedCountry="US" 
        onCountryChange={mockOnCountryChange} 
      />
    )

    expect(screen.getByText('🇺🇸 미국')).toBeInTheDocument()
    expect(screen.getByText('🇯🇵 일본')).toBeInTheDocument()
    expect(screen.getByText('🇨🇳 중국')).toBeInTheDocument()
    expect(screen.getByText('🇬🇧 영국')).toBeInTheDocument()
    expect(screen.getByText('🇩🇪 독일')).toBeInTheDocument()
    expect(screen.getByText('🇫🇷 프랑스')).toBeInTheDocument()
  })

  test('highlights selected country', () => {
    render(
      <CountrySelector 
        selectedCountry="JP" 
        onCountryChange={mockOnCountryChange} 
      />
    )

    const japanButton = screen.getByText('🇯🇵 일본')
    expect(japanButton).toHaveClass('bg-blue-500', 'text-white')
  })

  test('calls onCountryChange when country is selected', () => {
    render(
      <CountrySelector 
        selectedCountry="US" 
        onCountryChange={mockOnCountryChange} 
      />
    )

    const chinaButton = screen.getByText('🇨🇳 중국')
    fireEvent.click(chinaButton)

    expect(mockOnCountryChange).toHaveBeenCalledWith('CN')
  })
})