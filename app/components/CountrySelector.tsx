'use client'

interface CountrySelectorProps {
  selectedCountry: string
  onCountryChange: (country: string) => void
}

const countries = [
  { code: 'US', name: '미국', flag: '🇺🇸' },
  { code: 'JP', name: '일본', flag: '🇯🇵' },
  { code: 'CN', name: '중국', flag: '🇨🇳' },
  { code: 'GB', name: '영국', flag: '🇬🇧' },
  { code: 'DE', name: '독일', flag: '🇩🇪' },
  { code: 'FR', name: '프랑스', flag: '🇫🇷' },
]

export default function CountrySelector({ selectedCountry, onCountryChange }: CountrySelectorProps) {
  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3">채팅 상대방의 국가를 선택하세요</h3>
      <div className="flex flex-wrap gap-2">
        {countries.map((country) => (
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