'use client'

import { useState } from 'react'
import { Language, getTranslation } from '../lib/i18n'
import EnhancedMannerFeedback from './EnhancedMannerFeedback'

interface TranslateModeProps {
  targetCountry: string
  language: Language
}

export default function TranslateMode({ targetCountry, language }: TranslateModeProps) {
  const [inputText, setInputText] = useState('')
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [targetLang, setTargetLang] = useState('en')

  const t = (key: keyof typeof import('../lib/i18n').translations.ko) => 
    getTranslation(language, key)

  const handleTranslate = async () => {
    if (!inputText.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/translate-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          targetLanguage: targetLang,
          sourceLanguage: 'auto',
          targetCountry
        }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Translation failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">번역 및 매너 체크</h2>
        <p className="text-gray-600">텍스트를 입력하면 번역과 함께 문화적 매너를 분석해드립니다.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">번역할 언어 선택</label>
          <select 
            value={targetLang} 
            onChange={(e) => setTargetLang(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="en">영어</option>
            <option value="ko">한국어</option>
            <option value="ja">일본어</option>
            <option value="zh">중국어</option>
            <option value="es">스페인어</option>
            <option value="fr">프랑스어</option>
            <option value="de">독일어</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">번역할 텍스트</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="번역하고 싶은 텍스트를 입력하세요..."
            className="w-full p-3 border rounded-lg h-32 resize-none"
          />
        </div>

        <button
          onClick={handleTranslate}
          disabled={isLoading || !inputText.trim()}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? '번역 중...' : '번역 및 매너 체크'}
        </button>

        {result && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">원문</h3>
              <p>{result.originalText}</p>
              <p className="text-sm text-gray-500 mt-1">감지된 언어: {result.detectedLanguage}</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium mb-2">번역 결과</h3>
              <p>{result.translatedText}</p>
            </div>

            {result.mannerFeedback && (
              <div>
                <h3 className="font-medium mb-2">문화적 매너 분석</h3>
                <EnhancedMannerFeedback 
                  feedback={{
                    ...result.mannerFeedback,
                    confidence: result.mannerFeedback.confidence || 0.8
                  }} 
                  language={language} 
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}