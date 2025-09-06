import { render, screen } from '@testing-library/react'
import ChatInterface from '../../app/components/ChatInterface'

// WebSocket mock
global.WebSocket = jest.fn().mockImplementation(() => ({
  send: jest.fn(),
  close: jest.fn(),
  onopen: null,
  onmessage: null,
  onclose: null,
}))

// API 호출을 모킹
global.fetch = jest.fn()

describe('ChatInterface', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear()
  })

  test('renders chat interface correctly', () => {
    render(<ChatInterface targetCountry="US" language="ko" userId="test-user" />)

    expect(screen.getByText('채팅 창')).toBeInTheDocument()
    expect(screen.getByText('메시지를 입력하면 문화적 매너를 체크해드립니다')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('메시지를 입력하세요...')).toBeInTheDocument()
  })

  test('displays relationship selector', () => {
    render(<ChatInterface targetCountry="US" language="ko" userId="test-user" />)
    
    expect(screen.getByText('상대방과의 관계')).toBeInTheDocument()
    expect(screen.getByText('👤 상사')).toBeInTheDocument()
    expect(screen.getByText('👫 친구')).toBeInTheDocument()
  })

  test('shows empty chat state initially', () => {
    render(<ChatInterface targetCountry="US" language="ko" userId="test-user" />)
    
    expect(screen.getByText('대화를 시작해보세요!')).toBeInTheDocument()
  })

  test('displays connection status', () => {
    render(<ChatInterface targetCountry="US" language="ko" userId="test-user" />)
    
    expect(screen.getByText('Disconnected')).toBeInTheDocument()
  })
})