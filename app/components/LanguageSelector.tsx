'use client'

import { Language, languages } from '../lib/i18n'

interface LanguageSelectorProps {
  selectedLanguage: Language
  onLanguageChange: (language: Language) => void
}

export default function LanguageSelector({ selectedLanguage, onLanguageChange }: LanguageSelectorProps) {
  return (
    <div className="mb-4 p-3 bg-white rounded-lg shadow">
      <h3 className="text-sm font-medium mb-2">Language / 언어</h3>
      <div className="flex flex-wrap gap-1">
        {Object.entries(languages).map(([code, lang]) => (
          <button
            key={code}
            onClick={() => onLanguageChange(code as Language)}
            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
              selectedLanguage === code
                ? 'bg-green-500 text-white border-green-500'
                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
            }`}
          >
            {lang.flag} {lang.name}
          </button>
        ))}
      </div>
    </div>
  )
}