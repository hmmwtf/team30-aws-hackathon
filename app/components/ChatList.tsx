'use client'

import { useState, useEffect } from 'react'
import { Chat } from '../../types/chat'

interface ChatListProps {
  onChatSelect: (chat: Chat) => void
  selectedChatId?: string
}

export default function ChatList({ onChatSelect, selectedChatId }: ChatListProps) {
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNewChatForm, setShowNewChatForm] = useState(false)
  const [newChatName, setNewChatName] = useState('')
  const [newChatCountry, setNewChatCountry] = useState('US')

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
  }, [])

  const loadChats = async () => {
    try {
      const response = await fetch('/api/chats')
      const data = await response.json()
      setChats(data)
    } catch (error) {
      console.error('Failed to load chats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createChat = async () => {
    if (!newChatName.trim()) return

    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newChatName,
          country: newChatCountry
        })
      })
      
      const newChat = await response.json()
      setChats(prev => [newChat, ...prev])
      setNewChatName('')
      setShowNewChatForm(false)
      onChatSelect(newChat)
    } catch (error) {
      console.error('Failed to create chat:', error)
    }
  }

  const getCountryFlag = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode)
    return country ? country.flag : '🌍'
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
            onClick={() => setShowNewChatForm(true)}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
          >
            + 새 채팅
          </button>
        </div>
      </div>

      {showNewChatForm && (
        <div className="p-4 bg-white border-b">
          <input
            type="text"
            placeholder="채팅방 이름"
            value={newChatName}
            onChange={(e) => setNewChatName(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <select
            value={newChatCountry}
            onChange={(e) => setNewChatCountry(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          >
            {countries.map(country => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={createChat}
              className="flex-1 bg-green-500 text-white py-1 rounded text-sm hover:bg-green-600"
            >
              생성
            </button>
            <button
              onClick={() => setShowNewChatForm(false)}
              className="flex-1 bg-gray-500 text-white py-1 rounded text-sm hover:bg-gray-600"
            >
              취소
            </button>
          </div>
        </div>
      )}

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
                    <h3 className="font-medium truncate">{chat.name}</h3>
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