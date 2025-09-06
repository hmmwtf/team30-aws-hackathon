import { render, screen } from '@testing-library/react'
import Home from '../app/page'

// Next.js router mock
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}))

// react-oidc-context mock
jest.mock('react-oidc-context', () => ({
  useAuth: () => ({
    isLoading: false,
    isAuthenticated: false,
    user: null,
  }),
}))

// js-cookie mock
jest.mock('js-cookie', () => ({
  remove: jest.fn(),
}))

describe('Home Page', () => {
  test('renders loading page', () => {
    render(<Home />)
    
    expect(screen.getByText('CultureChat')).toBeInTheDocument()
    expect(screen.getByText('문화적 배려가 담긴 매너있는 외국인 채팅 서비스')).toBeInTheDocument()
    expect(screen.getByText('로딩 중...')).toBeInTheDocument()
  })

  test('has proper layout structure', () => {
    const { container } = render(<Home />)
    
    const mainElement = container.querySelector('main')
    expect(mainElement).toHaveClass('min-h-screen', 'bg-gray-50')
  })
})