import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ChatInterface from '../../app/components/ChatInterface'

// API 호출을 모킹
global.fetch = jest.fn()

describe('ChatInterface', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear()
  })

  test('renders chat interface correctly', () => {
    render(<ChatInterface targetCountry="US" language="ko" />)

    expect(screen.getByText('채팅 창')).toBeInTheDocument()
    expect(screen.getByText('메시지를 입력하면 문화적 매너를 체크해드립니다')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('메시지를 입력하세요...')).toBeInTheDocument()
  })

  test('sends message and displays feedback', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        type: 'good',
        message: '👍 매너 굿! 문화적으로 적절한 표현이에요',
        basicTranslation: 'Hello, how are you?'
      })
    }

    ;(fetch as jest.Mock).mockResolvedValueOnce(mockResponse)

    render(<ChatInterface targetCountry="US" language="ko" />)

    const input = screen.getByPlaceholderText('메시지를 입력하세요...')
    const sendButton = screen.getByText('전송')

    fireEvent.change(input, { target: { value: 'Hello, how are you?' } })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(screen.getAllByText(/Hello, how are you?/)).toHaveLength(2) // 원문과 번역문
    })

    await waitFor(() => {
      expect(screen.getByText('👍 매너 굿! 문화적으로 적절한 표현이에요')).toBeInTheDocument()
    })

    expect(fetch).toHaveBeenCalledWith('/api/fast-analyze', expect.objectContaining({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello, how are you?',
        targetCountry: 'US',
        relationship: 'friend',
        language: 'ko',
      }),
    }))
  })

  test('handles API error gracefully', async () => {
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'))

    render(<ChatInterface targetCountry="US" language="ko" />)

    const input = screen.getByPlaceholderText('메시지를 입력하세요...')
    const sendButton = screen.getByText('전송')

    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText(/Test message/)).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText(/분석 중 오류가 발생했습니다/)).toBeInTheDocument()
    })
  })

  test('displays message timestamp', async () => {
    const mockResponse = {
      type: 'good',
      message: '좋은 메시지입니다',
      basicTranslation: 'Test message'
    }

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockResponse
    })

    render(<ChatInterface targetCountry="US" language="ko" />)

    const input = screen.getByPlaceholderText('메시지를 입력하세요...')
    const sendButton = screen.getByText('전송')

    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText(/Test message/)).toBeInTheDocument()
    })

    // 타임스탬프가 표시되는지 확인 (정확한 시간은 확인하지 않고 형식만 확인)
    const timeElements = screen.getAllByText(/\d{1,2}:\d{2}:\d{2}/)
    expect(timeElements.length).toBeGreaterThan(0)
  })
})