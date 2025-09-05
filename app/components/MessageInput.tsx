'use client'

import { useState } from 'react'
import { Language, getTranslation } from '../lib/i18n'

interface MessageInputProps {
  value: string
  onChange: (value: string) => void
  onSend: (message: string) => void
  targetCountry: string
  language: Language
}

export default function MessageInput({ value, onChange, onSend, targetCountry, language }: MessageInputProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const t = (key: keyof typeof import('../lib/i18n').translations.ko) => 
    getTranslation(language, key)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim()) return

    setIsAnalyzing(true)
    await onSend(value)
    setIsAnalyzing(false)
  }

  return (
    <form onSubmit={handleSubmit} className="border-t p-4">
      <div className="flex space-x-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('inputPlaceholder')}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isAnalyzing}
        />
        <button
          type="submit"
          disabled={!value.trim() || isAnalyzing}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? t('analyzing') : t('sendButton')}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {targetCountry} {t('culturalCheck')}
      </p>
    </form>
  )
}