import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
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
        language="ko"
      />
    )

    expect(screen.getByPlaceholderText('메시지를 입력하세요...')).toBeInTheDocument()
    expect(screen.getByText('전송')).toBeInTheDocument()
  })

  test('calls onChange when typing', async () => {
    const user = userEvent.setup()
    
    render(
      <MessageInput
        value=""
        onChange={mockOnChange}
        onSend={mockOnSend}
        targetCountry="US"
        language="ko"
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
        language="ko"
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
        language="ko"
      />
    )

    const sendButton = screen.getByText('전송')
    expect(sendButton).toBeDisabled()
  })
  test('shows analyzing state', async () => {
    // 분석 중 상태를 시뮬레이션하기 위해 mockOnSend를 Promise로 만듦
    mockOnSend.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(
      <MessageInput
        value="Test message"
        onChange={mockOnChange}
        onSend={mockOnSend}
        targetCountry="US"
        language="ko"
      />
    )

    const sendButton = screen.getByText('전송')
    
    await act(async () => {
      fireEvent.click(sendButton)
    })

    await waitFor(() => {
      expect(screen.getByText('분석중...')).toBeInTheDocument()
    })
  })

})