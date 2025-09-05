'use client'

import { useAuth } from "react-oidc-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function CallbackPage() {
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!auth.isLoading) {
      if (auth.isAuthenticated) {
        router.push('/main')
      } else if (auth.error) {
        router.push('/login')
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.error, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">로그인 처리 중...</p>
      </div>
    </div>
  )
}