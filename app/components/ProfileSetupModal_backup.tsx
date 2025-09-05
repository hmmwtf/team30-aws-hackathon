'use client'

import { useState } from 'react'
import { Language, languages } from '../lib/i18n'

interface ProfileSetupModalProps {
  isOpen: boolean
  onComplete: (nationality: string, language: Language) => Promise<void>
  defaultLanguage?: Language
  currentProfile?: { nationality: string; language: Language } | null
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

export default function ProfileSetupModal({ isOpen, onComplete, defaultLanguage = 'ko', currentProfile }: ProfileSetupModalProps) {
  const [selectedNationality, setSelectedNationality] = useState(currentProfile?.nationality || '')
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(currentProfile?.language || defaultLanguage)
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
            {selectedLanguage === 'ko' ? '프로필 설정' :
             selectedLanguage === 'en' ? 'Profile Settings' :
             selectedLanguage === 'ja' ? 'プロフィール設定' :
             selectedLanguage === 'zh' ? '个人资料设置' :
             selectedLanguage === 'de' ? 'Profil-Einstellungen' :
             selectedLanguage === 'fr' ? 'Paramètres du profil' :
             selectedLanguage === 'it' ? 'Impostazioni profilo' :
             selectedLanguage === 'ru' ? 'Настройки профиля' :
             selectedLanguage === 'hi' ? 'प्रोफ़ाइल सेटिंग्स' :
             selectedLanguage === 'pt' ? 'Configurações do perfil' : '프로필 설정'}
          </h2>
          <p className="text-gray-600">
            {selectedLanguage === 'ko' ? '더 나은 서비스를 위해 국적과 언어를 설정해주세요' :
             selectedLanguage === 'en' ? 'Please set your nationality and language for better service' :
             selectedLanguage === 'ja' ? 'より良いサービスのために国籍と言語を設定してください' :
             selectedLanguage === 'zh' ? '请设置您的国籍和语言以获得更好的服务' :
             selectedLanguage === 'de' ? 'Bitte stellen Sie Ihre Nationalität und Sprache für einen besseren Service ein' :
             selectedLanguage === 'fr' ? 'Veuillez définir votre nationalité et votre langue pour un meilleur service' :
             selectedLanguage === 'it' ? 'Imposta la tua nazionalità e lingua per un servizio migliore' :
             selectedLanguage === 'ru' ? 'Пожалуйста, установите вашу национальность и язык для лучшего сервиса' :
             selectedLanguage === 'hi' ? 'बेहतर सेवा के लिए कृपया अपनी राष्ट्रीयता और भाषा सेट करें' :
             selectedLanguage === 'pt' ? 'Por favor, defina sua nacionalidade e idioma para um melhor serviço' : '더 나은 서비스를 위해 국적과 언어를 설정해주세요'}
          </p>
        </div>

        <div className="space-y-6">
          {/* 국적 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {selectedLanguage === 'ko' ? '국적' :
               selectedLanguage === 'en' ? 'Nationality' :
               selectedLanguage === 'ja' ? '国籍' :
               selectedLanguage === 'zh' ? '国籍' :
               selectedLanguage === 'de' ? 'Nationalität' :
               selectedLanguage === 'fr' ? 'Nationalité' :
               selectedLanguage === 'it' ? 'Nazionalità' :
               selectedLanguage === 'ru' ? 'Национальность' :
               selectedLanguage === 'hi' ? 'राष्ट्रीयता' :
               selectedLanguage === 'pt' ? 'Nacionalidade' : '국적'}
            </label>
            <select
              value={selectedNationality}
              onChange={(e) => setSelectedNationality(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">
                {selectedLanguage === 'ko' ? '국적을 선택하세요' :
                 selectedLanguage === 'en' ? 'Select your nationality' :
                 selectedLanguage === 'ja' ? '国籍を選択してください' :
                 selectedLanguage === 'zh' ? '请选择您的国籍' :
                 selectedLanguage === 'de' ? 'Wählen Sie Ihre Nationalität' :
                 selectedLanguage === 'fr' ? 'Sélectionnez votre nationalité' :
                 selectedLanguage === 'it' ? 'Seleziona la tua nazionalità' :
                 selectedLanguage === 'ru' ? 'Выберите вашу национальность' :
                 selectedLanguage === 'hi' ? 'अपनी राष्ट्रीयता चुनें' :
                 selectedLanguage === 'pt' ? 'Selecione sua nacionalidade' : '국적을 선택하세요'}
              </option>
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
              {selectedLanguage === 'ko' ? '사용 언어' :
               selectedLanguage === 'en' ? 'Language' :
               selectedLanguage === 'ja' ? '使用言語' :
               selectedLanguage === 'zh' ? '使用语言' :
               selectedLanguage === 'de' ? 'Sprache' :
               selectedLanguage === 'fr' ? 'Langue' :
               selectedLanguage === 'it' ? 'Lingua' :
               selectedLanguage === 'ru' ? 'Язык' :
               selectedLanguage === 'hi' ? 'भाषा' :
               selectedLanguage === 'pt' ? 'Idioma' : '사용 언어'}
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
            {isLoading ? 
              (selectedLanguage === 'ko' ? '저장 중...' :
               selectedLanguage === 'en' ? 'Saving...' :
               selectedLanguage === 'ja' ? '保存中...' :
               selectedLanguage === 'zh' ? '保存中...' :
               selectedLanguage === 'de' ? 'Speichern...' :
               selectedLanguage === 'fr' ? 'Enregistrement...' :
               selectedLanguage === 'it' ? 'Salvataggio...' :
               selectedLanguage === 'ru' ? 'Сохранение...' :
               selectedLanguage === 'hi' ? 'सेव कर रहे हैं...' :
               selectedLanguage === 'pt' ? 'Salvando...' : '저장 중...') :
              (selectedLanguage === 'ko' ? '설정 완료' :
               selectedLanguage === 'en' ? 'Complete Setup' :
               selectedLanguage === 'ja' ? '設定完了' :
               selectedLanguage === 'zh' ? '完成设置' :
               selectedLanguage === 'de' ? 'Einrichtung abschließen' :
               selectedLanguage === 'fr' ? 'Terminer la configuration' :
               selectedLanguage === 'it' ? 'Completa configurazione' :
               selectedLanguage === 'ru' ? 'Завершить настройку' :
               selectedLanguage === 'hi' ? 'सेटअप पूरा करें' :
               selectedLanguage === 'pt' ? 'Concluir configuração' : '설정 완료')
          </button>
        </div>
      </div>
    </div>
  )
}