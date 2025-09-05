'use client'

import { useAuth } from "react-oidc-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Cookies from 'js-cookie'

export default function Home() {
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    // URL에 code 파라미터가 있으면 콜백 처리 중
    const urlParams = new URLSearchParams(window.location.search)
    const hasCode = urlParams.get('code')
    
    if (!auth.isLoading) {
      if (auth.isAuthenticated) {
        router.push('/main')
      } else if (!hasCode) {
        // 로그인되지 않은 상태에서 쿠키 정리
        const authCookies = ['oidc.user', 'oidc.access_token', 'oidc.id_token', 'oidc.refresh_token']
        authCookies.forEach(cookieName => {
          Cookies.remove(cookieName)
          Cookies.remove(cookieName, { path: '/' })
        })
        router.push('/login')
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">로딩 중...</p>
      </div>
    </div>
  )
}