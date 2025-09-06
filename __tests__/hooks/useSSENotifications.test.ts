import { renderHook, act } from '@testing-library/react'
import { useSSENotifications } from '../../app/hooks/useSSENotifications'

// EventSource 모킹
class MockEventSource {
  onopen: ((event: Event) => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null
  readyState: number = 0
  
  constructor(public url: string) {
    setTimeout(() => {
      this.readyState = 1
      if (this.onopen) {
        this.onopen(new Event('open'))
      }
    }, 0)
  }
  
  close() {
    this.readyState = 2
  }
}

// 전역 EventSource 모킹
(global as any).EventSource = MockEventSource

// fetch 모킹
global.fetch = jest.fn()

describe('useSSENotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    })
  })

  it('should connect to SSE endpoint', () => {
    const { result } = renderHook(() => 
      useSSENotifications({ userId: 'test-user' })
    )

    expect(result.current.isConnected).toBe(false)
  })

  it('should update online status', async () => {
    jest.useFakeTimers()
    
    renderHook(() => 
      useSSENotifications({ userId: 'test-user' })
    )

    // 디바운스 타이머 실행
    jest.advanceTimersByTime(1000)
    
    expect(fetch).toHaveBeenCalledWith('/api/online-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        userId: 'test-user', 
        status: 'online' 
      })
    })
    
    jest.useRealTimers()
  })

  it('should clear notifications', () => {
    const { result } = renderHook(() => 
      useSSENotifications({ userId: 'test-user' })
    )

    act(() => {
      result.current.clearNotifications()
    })

    expect(result.current.notifications).toEqual([])
  })
})