import { render, screen, fireEvent } from '@testing-library/react'
import Home from '../app/page'

// API 호출을 모킹
global.fetch = jest.fn()

describe('Home Page', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear()
  })

  test('renders main page elements', () => {
    render(<Home />)

    expect(screen.getByText('title')).toBeInTheDocument()
    expect(screen.getByText('subtitle')).toBeInTheDocument()
    expect(screen.getByText('selectCountry')).toBeInTheDocument()
    expect(screen.getByText('채팅 창')).toBeInTheDocument()
  })

  test('country selection updates chat interface', () => {
    render(<Home />)

    // 초기 상태는 한국
    expect(screen.getByText('KR culturalCheck')).toBeInTheDocument()

    // 미국 선택
    const usButton = screen.getByText('🇺🇸 미국')
    fireEvent.click(usButton)

    expect(screen.getByText('US culturalCheck')).toBeInTheDocument()
  })

  test('integrates country selector and chat interface', async () => {
    const mockResponse = {
      type: 'good',
      message: '👍 매너 굿!'
    }

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockResponse
    })

    render(<Home />)

    // 중국 선택
    const chinaButton = screen.getByText('🇨🇳 중국')
    fireEvent.click(chinaButton)

    // 메시지 입력 및 전송
    const input = screen.getByPlaceholderText('메시지를 입력하세요...')
    const sendButton = screen.getByText('전송')

    fireEvent.change(input, { target: { value: 'Hello' } })
    fireEvent.click(sendButton)

    // API가 올바른 국가 코드로 호출되는지 확인
    expect(fetch).toHaveBeenCalledWith('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello',
        targetCountry: 'CN',
        language: 'ko',
      }),
    })
  })

  test('has proper responsive layout classes', () => {
    const { container } = render(<Home />)
    
    const mainElement = container.querySelector('main')
    expect(mainElement).toHaveClass('min-h-screen', 'bg-gray-50')

    const containerDiv = container.querySelector('.container')
    expect(containerDiv).toHaveClass('mx-auto', 'px-4', 'py-8')

    const maxWidthDiv = container.querySelector('.max-w-4xl')
    expect(maxWidthDiv).toHaveClass('max-w-4xl', 'mx-auto')
  })
})