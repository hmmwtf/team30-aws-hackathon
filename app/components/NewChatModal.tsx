'use client'

import { useState } from 'react'

interface NewChatModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateChat: (receiverEmail: string, relationship: string) => Promise<void>
}

const relationships = [
  { value: 'boss', label: '👔 상사', description: '높은 격식, 극존댓말' },
  { value: 'colleague', label: '🤝 동료', description: '중간 격식, 존댓말' },
  { value: 'friend', label: '👫 친구', description: '낮은 격식, 친근한 표현' },
  { value: 'lover', label: '💕 연인', description: '친밀한 표현, 애칭 사용' },
  { value: 'parent', label: '👨👩👧👦 부모님', description: '높임말, 효도 표현' },
  { value: 'stranger', label: '🙋 낯선 사람', description: '정중한 표현, 예의' }
]

export default function NewChatModal({ isOpen, onClose, onCreateChat }: NewChatModalProps) {
  const [receiverEmail, setReceiverEmail] = useState('')
  const [selectedRelationship, setSelectedRelationship] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!receiverEmail || !selectedRelationship || isLoading) return

    setIsLoading(true)
    try {
      await onCreateChat(receiverEmail, selectedRelationship)
      setReceiverEmail('')
      setSelectedRelationship('')
      onClose()
    } catch (error) {
      console.error('채팅 생성 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">새 채팅 시작</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상대방 이메일
            </label>
            <input
              type="email"
              value={receiverEmail}
              onChange={(e) => setReceiverEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              관계 설정
            </label>
            <div className="grid grid-cols-2 gap-2">
              {relationships.map((rel) => (
                <button
                  key={rel.value}
                  type="button"
                  onClick={() => setSelectedRelationship(rel.value)}
                  className={`p-3 text-left border rounded-lg transition-all ${
                    selectedRelationship === rel.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="font-medium text-sm">{rel.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{rel.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!receiverEmail || !selectedRelationship || isLoading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {isLoading ? '요청 중...' : '채팅 요청'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}