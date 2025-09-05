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

    expect(screen.getByText('CultureChat')).toBeInTheDocument()
    expect(screen.getByText('문화적 배려가 담긴 매너있는 채팅 서비스')).toBeInTheDocument()
    expect(screen.getByText('채팅 상대방의 국가를 선택하세요')).toBeInTheDocument()
    expect(screen.getByText('채팅 창')).toBeInTheDocument()
  })

  test('country selection updates chat interface', () => {
    render(<Home />)

    // 초기 상태는 미국
    expect(screen.getByText('US 문화 기준으로 매너를 체크합니다')).toBeInTheDocument()

    // 일본 선택
    const japanButton = screen.getByText('🇯🇵 일본')
    fireEvent.click(japanButton)

    expect(screen.getByText('JP 문화 기준으로 매너를 체크합니다')).toBeInTheDocument()
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