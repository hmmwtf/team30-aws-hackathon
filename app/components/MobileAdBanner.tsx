'use client';

import { Language, getTranslation } from '../lib/i18n';

interface MobileAdBannerProps {
  language?: Language;
}

export default function MobileAdBanner({ language = 'ko' }: MobileAdBannerProps) {
  const t = (key: string) => getTranslation(language, key);

  return (
    <div className="2xl:hidden mb-4">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🌍</div>
            <div>
              <div className="text-sm font-bold">CultureChat</div>
              <div className="text-xs opacity-90">문화적 배려가 담긴 AI 번역</div>
            </div>
          </div>
          <div className="flex space-x-4 text-xs">
            <div className="text-center">
              <div>💬</div>
              <div>번역</div>
            </div>
            <div className="text-center">
              <div>🔍</div>
              <div>매너</div>
            </div>
            <div className="text-center">
              <div>🎯</div>
              <div>분석</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}