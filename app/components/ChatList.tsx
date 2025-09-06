'use client'

import { useState, useEffect } from 'react'
import { Chat } from '../../types/chat'
import NewChatModal from './NewChatModal'

interface ChatListProps {
  onChatSelect: (chat: Chat) => void
  selectedChatId?: string
  currentUserEmail?: string
}

export default function ChatList({ onChatSelect, selectedChatId, currentUserEmail }: ChatListProps) {
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNewChatModal, setShowNewChatModal] = useState(false)

  const countries = [
    { code: 'US', name: '미국', flag: '🇺🇸' },
    { code: 'JP', name: '일본', flag: '🇯🇵' },
    { code: 'CN', name: '중국', flag: '🇨🇳' },
    { code: 'GB', name: '영국', flag: '🇬🇧' },
    { code: 'DE', name: '독일', flag: '🇩🇪' },
    { code: 'FR', name: '프랑스', flag: '🇫🇷' }
  ]

  useEffect(() => {
    loadChats()
  }, [currentUserEmail])

  const loadChats = async () => {
    if (!currentUserEmail) {
      console.log('currentUserEmail이 없어서 채팅 로드 스킵')
      setIsLoading(false)
      return
    }
    
    console.log('채팅 로드 시작:', currentUserEmail)
    try {
      const response = await fetch(`/api/chats?userEmail=${encodeURIComponent(currentUserEmail)}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('채팅 로드 성공:', data.length, '개')
      setChats(data)
    } catch (error) {
      console.error('Failed to load chats:', error)
      setChats([]) // 오류 시 빈 배열로 설정
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateChat = async (receiverEmail: string, relationship: string) => {
    if (!currentUserEmail) {
      alert('사용자 정보를 찾을 수 없습니다.')
      return
    }
    
    console.log('채팅 생성 시도:', { senderEmail: currentUserEmail, receiverEmail, relationship })
    
    try {
      const response = await fetch('/api/chat-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail: currentUserEmail,
          receiverEmail,
          relationship
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('채팅 요청 응답:', data)
      
      if (data.success) {
        alert(data.message)
        await loadChats() // 채팅 목록 새로고침
      } else {
        console.error('채팅 요청 실패:', data)
        alert(data.error || '채팅 요청 실패')
      }
    } catch (error) {
      console.error('Failed to create chat:', error)
      alert('채팅 요청 중 오류가 발생했습니다: ' + (error as Error).message)
    }
  }

  const getCountryFlag = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode)
    return country ? country.flag : '🌍'
  }

  // 상대방 이메일 추출 함수
  const getOtherUserEmail = (chat: Chat) => {
    if (!currentUserEmail || !chat.participants) return chat.name
    return chat.participants.find(email => email !== currentUserEmail) || chat.name
  }

  // 관계 라벨 매핑
  const relationshipLabels: { [key: string]: string } = {
    'boss': '상사',
    'colleague': '동료', 
    'friend': '친구',
    'lover': '연인',
    'parent': '부모님',
    'stranger': '낯선 사람'
  }

  // 채팅방 표시 이름 생성
  const getChatDisplayName = (chat: Chat) => {
    const otherUserEmail = getOtherUserEmail(chat)
    const relationshipLabel = relationshipLabels[chat.relationship] || chat.relationship
    return `${otherUserEmail} (${relationshipLabel})`
  }

  if (isLoading) {
    return (
      <div className="w-80 bg-gray-50 border-r flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-gray-50 border-r flex flex-col">
      <div className="p-4 border-b bg-white">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">채팅방</h2>
          <button
            onClick={() => setShowNewChatModal(true)}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
          >
            + 새 채팅
          </button>
        </div>
      </div>

      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onCreateChat={handleCreateChat}
      />

      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            채팅방이 없습니다.<br />
            새 채팅을 시작해보세요!
          </div>
        ) : (
          chats.map(chat => (
            <div
              key={chat.id}
              onClick={() => onChatSelect(chat)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${
                selectedChatId === chat.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCountryFlag(chat.country)}</span>
                    <h3 className="font-medium truncate">{getChatDisplayName(chat)}</h3>
                  </div>
                  {chat.lastMessage && (
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {chat.lastMessage}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(chat.timestamp).toLocaleDateString()}
                  </p>
                </div>
                {chat.unread > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}