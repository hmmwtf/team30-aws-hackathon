'use client'

import { useState } from 'react'
import { Language, languages } from '../lib/i18n'

interface ProfileSetupModalProps {
  isOpen: boolean
  onComplete: (nationality: string, language: Language) => Promise<void>
  defaultLanguage?: Language
}

const countries = {
  KR: { name: '대한민국', flag: '🇰🇷' },
  US: { name: '미국', flag: '🇺🇸' },
  JP: { name: '일본', flag: '🇯🇵' },
  CN: { name: '중국', flag: '🇨🇳' },
  GB: { name: '영국', flag: '🇬🇧' },
  DE: { name: '독일', flag: '🇩🇪' },
  FR: { name: '프랑스', flag: '🇫🇷' },
  IT: { name: '이탈리아', flag: '🇮🇹' },
  RU: { name: '러시아', flag: '🇷🇺' },
  IN: { name: '인도', flag: '🇮🇳' },
  BR: { name: '브라질', flag: '🇧🇷' },
}

export default function ProfileSetupModal({ isOpen, onComplete, defaultLanguage = 'ko' }: ProfileSetupModalProps) {
  const [selectedNationality, setSelectedNationality] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(defaultLanguage)
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (selectedNationality && selectedLanguage && !isLoading) {
      setIsLoading(true)
      try {
        await onComplete(selectedNationality, selectedLanguage)
      } catch (error) {
        console.error('프로필 설정 오류:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            프로필 설정
          </h2>
          <p className="text-gray-600">
            더 나은 서비스를 위해 국적과 언어를 설정해주세요
          </p>
        </div>

        <div className="space-y-6">
          {/* 국적 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              국적
            </label>
            <select
              value={selectedNationality}
              onChange={(e) => setSelectedNationality(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">국적을 선택하세요</option>
              {Object.entries(countries).map(([code, country]) => (
                <option key={code} value={code}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
          </div>

          {/* 언어 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              사용 언어
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as Language)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(languages).map(([code, lang]) => (
                <option key={code} value={code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleSubmit}
            disabled={!selectedNationality || !selectedLanguage || isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {isLoading ? '저장 중...' : '설정 완료'}
          </button>
        </div>
      </div>
    </div>
  )
}