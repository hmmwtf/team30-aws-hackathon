import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TranslateMode from '../../app/components/TranslateMode'

// fetch 모킹
global.fetch = jest.fn()

describe('TranslateMode', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders translate mode interface', () => {
    render(<TranslateMode targetCountry="US" language="ko" />)
    
    expect(screen.getByRole('heading', { name: '번역 및 매너 체크' })).toBeInTheDocument()
    expect(screen.getByText('번역할 언어 선택')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('번역하고 싶은 텍스트를 입력하세요...')).toBeInTheDocument()
  })

  it('handles translation request', async () => {
    const mockResponse = {
      originalText: 'Hello',
      translatedText: '안녕하세요',
      detectedLanguage: 'en',
      targetLanguage: 'ko',
      mannerFeedback: {
        type: 'good',
        message: '문화적으로 적절한 표현입니다.',
        suggestion: ''
      }
    }

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    render(<TranslateMode targetCountry="KR" language="ko" />)
    
    const textarea = screen.getByPlaceholderText('번역하고 싶은 텍스트를 입력하세요...')
    const button = screen.getByRole('button', { name: '번역 및 매너 체크' })

    fireEvent.change(textarea, { target: { value: 'Hello' } })
    fireEvent.click(button)

    expect(screen.getByText('번역 중...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('원문')).toBeInTheDocument()
      expect(screen.getByText('번역 결과')).toBeInTheDocument()
      expect(screen.getByText('문화적 매너 분석')).toBeInTheDocument()
    })

    expect(fetch).toHaveBeenCalledWith('/api/translate-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Hello',
        targetLanguage: 'en',
        sourceLanguage: 'auto',
        targetCountry: 'KR'
      })
    })
  })

  it('disables button when input is empty', () => {
    render(<TranslateMode targetCountry="US" language="ko" />)
    
    const button = screen.getByRole('button', { name: '번역 및 매너 체크' })
    expect(button).toBeDisabled()
  })

  it('changes target language selection', () => {
    render(<TranslateMode targetCountry="US" language="ko" />)
    
    const select = screen.getByDisplayValue('영어')
    fireEvent.change(select, { target: { value: 'ja' } })
    
    expect(select).toHaveValue('ja')
  })
})