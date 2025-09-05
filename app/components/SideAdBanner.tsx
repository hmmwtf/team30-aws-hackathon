'use client';

import { Language, getTranslation } from '../lib/i18n';

interface SideAdBannerProps {
  language?: Language;
}

export default function SideAdBanner({ language = 'ko' }: SideAdBannerProps) {
  const t = (key: string) => getTranslation(language, key);

  return (
    <div className="w-32 space-y-6">
      {/* 메인 광고 배너 */}
      <div className="bg-gradient-to-b from-blue-500 to-purple-600 text-white p-3 rounded-lg shadow-lg h-80">
        <div className="text-center h-full flex flex-col justify-between">
          <div>
            <div className="text-2xl mb-2">🌍</div>
            <div className="text-xs font-bold mb-1 leading-tight">
              Culture
            </div>
            <div className="text-xs font-bold mb-3 leading-tight">
              Chat
            </div>
          </div>
          
          <div className="space-y-3 text-xs">
            <div className="flex flex-col items-center">
              <span className="text-lg mb-1">💬</span>
              <span className="leading-tight">실시간</span>
              <span className="leading-tight">번역</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg mb-1">🔍</span>
              <span className="leading-tight">매너</span>
              <span className="leading-tight">체크</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg mb-1">🎯</span>
              <span className="leading-tight">문화</span>
              <span className="leading-tight">분석</span>
            </div>
          </div>
        </div>
      </div>

      {/* 후원 안내 배너 */}
      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg h-48">
        <div className="text-center h-full flex flex-col justify-between">
          <div>
            <div className="text-2xl mb-2">💝</div>
            <div className="text-xs font-semibold text-yellow-800 mb-2 leading-tight">
              서비스가
            </div>
            <div className="text-xs font-semibold text-yellow-800 mb-2 leading-tight">
              도움되셨나요?
            </div>
          </div>
          
          <div>
            <div className="text-xs text-yellow-700 mb-3 leading-tight">
              후원으로 더 나은
            </div>
            <div className="text-xs text-yellow-700 mb-3 leading-tight">
              서비스를 만들어가요
            </div>
            <button 
              onClick={() => window.open('/sponsor', '_blank')}
              className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600 w-full"
            >
              후원하기
            </button>
          </div>
        </div>
      </div>

      {/* 기능 소개 배너 */}
      <div className="bg-green-50 border border-green-200 p-3 rounded-lg h-40">
        <div className="text-center h-full flex flex-col justify-between">
          <div>
            <div className="text-2xl mb-2">🚀</div>
            <div className="text-xs font-semibold text-green-800 mb-2 leading-tight">
              새로운 기능
            </div>
          </div>
          
          <div className="text-xs text-green-700 space-y-1">
            <div className="leading-tight">✨ 음성 번역</div>
            <div className="leading-tight">(곧 출시)</div>
            <div className="leading-tight">🎨 UI 개선</div>
            <div className="leading-tight">📱 모바일 최적화</div>
          </div>
        </div>
      </div>
    </div>
  );
}