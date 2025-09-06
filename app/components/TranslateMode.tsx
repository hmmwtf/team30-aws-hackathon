'use client'

import { useState } from 'react'
import { Language, getTranslation } from '../lib/i18n'
import EnhancedMannerFeedback from './EnhancedMannerFeedback'

interface TranslateModeProps {
  language: Language
}

export default function TranslateMode({ language }: TranslateModeProps) {
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
          sourceLanguage: 'auto'
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
        <h2 className="text-xl font-semibold mb-2">{t('mannerCheckTitle')}</h2>
        <p className="text-gray-600">{t('mannerCheckDesc')}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">{t('selectTargetLang')}</label>
          <select 
            value={targetLang} 
            onChange={(e) => setTargetLang(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="en">{language === 'ko' ? '영어' : language === 'ja' ? '英語' : 'English'}</option>
            <option value="ko">{language === 'ko' ? '한국어' : language === 'ja' ? '韓国語' : 'Korean'}</option>
            <option value="ja">{language === 'ko' ? '일본어' : language === 'ja' ? '日本語' : 'Japanese'}</option>
            <option value="zh">{language === 'ko' ? '중국어' : language === 'ja' ? '中国語' : 'Chinese'}</option>
            <option value="es">{language === 'ko' ? '스페인어' : language === 'ja' ? 'スペイン語' : 'Spanish'}</option>
            <option value="fr">{language === 'ko' ? '프랑스어' : language === 'ja' ? 'フランス語' : 'French'}</option>
            <option value="de">{language === 'ko' ? '독일어' : language === 'ja' ? 'ドイツ語' : 'German'}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('textToTranslate')}</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t('textPlaceholder')}
            className="w-full p-3 border rounded-lg h-32 resize-none"
          />
        </div>

        <button
          onClick={handleTranslate}
          disabled={isLoading || !inputText.trim()}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? t('mannerChecking') : t('mannerCheckButton')}
        </button>

        {result && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">{t('originalMessage')}</h3>
              <p>{result.originalText}</p>
              <p className="text-sm text-gray-500 mt-1">{t('detectedLanguage')}: {result.detectedLanguage}</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium mb-2">{t('translationResult')}</h3>
              <p>{result.translatedText}</p>
            </div>

            {result.mannerFeedback && (
              <div>
                <h3 className="font-medium mb-2">{t('culturalAnalysis')}</h3>
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