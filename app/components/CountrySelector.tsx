'use client'

import { Language, getTranslation } from '../lib/i18n'

interface CountrySelectorProps {
  selectedCountry: string
  onCountryChange: (country: string) => void
  language: Language
}

const countries = {
  ko: [
    { code: 'KR', name: '대한민국', flag: '🇰🇷' },
    { code: 'US', name: '미국', flag: '🇺🇸' },
    { code: 'JP', name: '일본', flag: '🇯🇵' },
    { code: 'CN', name: '중국', flag: '🇨🇳' },
    { code: 'GB', name: '영국', flag: '🇬🇧' },
    { code: 'DE', name: '독일', flag: '🇩🇪' },
    { code: 'FR', name: '프랑스', flag: '🇫🇷' },
  ],
  en: [
    { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'CN', name: 'China', flag: '🇨🇳' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
  ],
  ja: [
    { code: 'KR', name: '韓国', flag: '🇰🇷' },
    { code: 'US', name: 'アメリカ', flag: '🇺🇸' },
    { code: 'JP', name: '日本', flag: '🇯🇵' },
    { code: 'CN', name: '中国', flag: '🇨🇳' },
    { code: 'GB', name: 'イギリス', flag: '🇬🇧' },
    { code: 'DE', name: 'ドイツ', flag: '🇩🇪' },
    { code: 'FR', name: 'フランス', flag: '🇫🇷' },
  ],
  zh: [
    { code: 'KR', name: '韩国', flag: '🇰🇷' },
    { code: 'US', name: '美国', flag: '🇺🇸' },
    { code: 'JP', name: '日本', flag: '🇯🇵' },
    { code: 'CN', name: '中国', flag: '🇨🇳' },
    { code: 'GB', name: '英国', flag: '🇬🇧' },
    { code: 'DE', name: '德国', flag: '🇩🇪' },
    { code: 'FR', name: '法国', flag: '🇫🇷' },
  ],
  de: [
    { code: 'KR', name: 'Südkorea', flag: '🇰🇷' },
    { code: 'US', name: 'Vereinigte Staaten', flag: '🇺🇸' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'CN', name: 'China', flag: '🇨🇳' },
    { code: 'GB', name: 'Vereinigtes Königreich', flag: '🇬🇧' },
    { code: 'DE', name: 'Deutschland', flag: '🇩🇪' },
    { code: 'FR', name: 'Frankreich', flag: '🇫🇷' },
  ],
  fr: [
    { code: 'KR', name: 'Corée du Sud', flag: '🇰🇷' },
    { code: 'US', name: 'États-Unis', flag: '🇺🇸' },
    { code: 'JP', name: 'Japon', flag: '🇯🇵' },
    { code: 'CN', name: 'Chine', flag: '🇨🇳' },
    { code: 'GB', name: 'Royaume-Uni', flag: '🇬🇧' },
    { code: 'DE', name: 'Allemagne', flag: '🇩🇪' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
  ],
}


const countries = [
  { code: 'US', name: '미국', flag: '🇺🇸' },
  { code: 'JP', name: '일본', flag: '🇯🇵' },
  { code: 'CN', name: '중국', flag: '🇨🇳' },
  { code: 'GB', name: '영국', flag: '🇬🇧' },
  { code: 'DE', name: '독일', flag: '🇩🇪' },
  { code: 'FR', name: '프랑스', flag: '🇫🇷' },
  { code: 'KR', name: '한국', flag: '🇰🇷' },
  { code: 'IT', name: '이탈리아', flag: '🇮🇹' },
  { code: 'RU', name: '러시아', flag: '🇷🇺' },
  { code: 'IN', name: '인도', flag: '🇮🇳' },
  { code: 'BR', name: '브라질', flag: '🇧🇷' },
  { code: 'AU', name: '호주', flag: '🇦🇺' },
]

export default function CountrySelector({ selectedCountry, onCountryChange, language }: CountrySelectorProps) {
  const t = (key: keyof typeof import('../lib/i18n').translations.ko) => 
    getTranslation(language, key)

  const countryList = countries[language] || countries.ko

  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3">{t('selectCountry')}</h3>
      <div className="flex flex-wrap gap-2">
        {countryList.map((country) => (
          <button
            key={country.code}
            onClick={() => onCountryChange(country.code)}
            className={`px-4 py-2 rounded-full border transition-colors ${
              selectedCountry === country.code
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
            }`}
          >
            {country.flag} {country.name}
          </button>
        ))}
      </div>
    </div>
  )
}