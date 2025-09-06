'use client'

import { useState, useEffect } from 'react'

interface NotificationProps {
  title: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  duration?: number
  onClose: () => void
}

export default function CustomNotification({ 
  title, 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose 
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // 애니메이션 완료 후 제거
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getTypeStyles = () => {
    return 'bg-gray-500/80 border-gray-400'
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      default:
        return '💬'
    }
  }

  return (
    <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`${getTypeStyles()} text-white rounded-lg shadow-lg border-l-4 p-4 max-w-sm`}>
        <div className="flex items-start">
          <div className="text-2xl mr-3">{getIcon()}</div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{title}</h4>
            <p className="text-sm opacity-90 mt-1">{message}</p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(onClose, 300)
            }}
            className="ml-2 text-white/70 hover:text-white text-lg leading-none"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}