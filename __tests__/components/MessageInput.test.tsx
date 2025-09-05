import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MessageInput from '../../app/components/MessageInput'

describe('MessageInput', () => {
  const mockOnSend = jest.fn()
  const mockOnChange = jest.fn()

  beforeEach(() => {
    mockOnSend.mockClear()
    mockOnChange.mockClear()
  })

  test('renders input field and send button', () => {
    render(
      <MessageInput
        value=""
        onChange={mockOnChange}
        onSend={mockOnSend}
        targetCountry="US"
      />
    )

    expect(screen.getByPlaceholderText('메시지를 입력하세요...')).toBeInTheDocument()
    expect(screen.getByText('전송')).toBeInTheDocument()
    expect(screen.getByText('US 문화 기준으로 매너를 체크합니다')).toBeInTheDocument()
  })

  test('calls onChange when typing', async () => {
    const user = userEvent.setup()
    
    render(
      <MessageInput
        value=""
        onChange={mockOnChange}
        onSend={mockOnSend}
        targetCountry="US"
      />
    )

    const input = screen.getByPlaceholderText('메시지를 입력하세요...')
    await user.type(input, 'Hello')

    expect(mockOnChange).toHaveBeenCalledTimes(5) // 'H', 'e', 'l', 'l', 'o'
  })

  test('calls onSend when form is submitted', async () => {
    render(
      <MessageInput
        value="Test message"
        onChange={mockOnChange}
        onSend={mockOnSend}
        targetCountry="US"
      />
    )

    const sendButton = screen.getByText('전송')
    fireEvent.click(sendButton)

    expect(mockOnSend).toHaveBeenCalledWith('Test message')
  })

  test('disables send button when input is empty', () => {
    render(
      <MessageInput
        value=""
        onChange={mockOnChange}
        onSend={mockOnSend}
        targetCountry="US"
      />
    )

    const sendButton = screen.getByText('전송')
    expect(sendButton).toBeDisabled()
  })

  test('shows analyzing state', () => {
    // 분석 중 상태를 시뮬레이션하기 위해 mockOnSend를 Promise로 만듦
    mockOnSend.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(
      <MessageInput
        value="Test message"
        onChange={mockOnChange}
        onSend={mockOnSend}
        targetCountry="US"
      />
    )

    const sendButton = screen.getByText('전송')
    fireEvent.click(sendButton)

    expect(screen.getByText('분석중')).toBeInTheDocument()
  })
})