'use client'

import { useState, useEffect } from 'react'
import { Language, getTranslation } from '../lib/i18n'

interface HistoryItem {
  id: string
  original: string
  translated: string
  timestamp: Date
  targetCountry: string
}

interface TranslationHistoryProps {
  language: Language
}

export default function TranslationHistory({ language }: TranslationHistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const t = (key: keyof typeof import('../lib/i18n').translations.ko) => 
    getTranslation(language, key)

  useEffect(() => {
    const saved = localStorage.getItem('translation-history')
    if (saved) {
      const parsed = JSON.parse(saved).map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }))
      setHistory(parsed)
    }
  }, [])

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('translation-history')
  }

  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(itemId)
      setTimeout(() => setCopiedId(null), 1500)
    } catch (err) {
      console.error('복사 실패:', err)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-purple-500 text-white p-3 rounded-full shadow-lg hover:bg-purple-600 transition-colors z-40"
        title="번역 기록"
      >
        <span className="text-lg">📚</span>
        {history.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {history.length > 9 ? '9+' : history.length}
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">📚 번역 기록 ({history.length})</h3>
          <div className="flex gap-2">
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                🗑️ 전체 삭제
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-4 max-h-96 overflow-y-auto">
          {history.length === 0 ? (
            <p className="text-gray-500 text-center py-8">번역 기록이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {history.slice().reverse().map((item) => (
                <div key={item.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-gray-500">
                      {item.timestamp.toLocaleTimeString()}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {item.targetCountry}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{item.original}</p>
                        <p className="text-sm text-blue-600 font-medium mt-1">→ {item.translated}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(item.translated, item.id)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="번역 결과 복사"
                      >
                        {copiedId === item.id ? '✓' : '📋'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 히스토리에 항목 추가하는 유틸리티 함수
export const addToHistory = (original: string, translated: string, targetCountry: string) => {
  const newItem: HistoryItem = {
    id: Date.now().toString(),
    original,
    translated,
    timestamp: new Date(),
    targetCountry
  }
  
  const existing = JSON.parse(localStorage.getItem('translation-history') || '[]')
  const updated = [...existing, newItem].slice(-50) // 최대 50개만 저장
  
  localStorage.setItem('translation-history', JSON.stringify(updated))
}