'use client';

import { useState } from 'react';
import { Language, getTranslation } from '../lib/i18n';

export default function SponsorPage() {
  const language: Language = 'ko'; // 기본값, 실제로는 props나 context에서 가져와야 함
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  
  const t = (key: string) => getTranslation(language, key);
  
  const handleStarClick = (starIndex: number) => {
    setRating(starIndex);
  };
  
  const handleSubmitReview = () => {
    if (rating > 0) {
      // 실제로는 여기서 리뷰 제출 API를 호출
      console.log(`사용자가 ${rating}점을 주었습니다`);
      setReviewSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🌍 {t('sponsor.page.title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('sponsor.page.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 후원 안내 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              💝 {t('sponsor.page.donation.title')}
            </h2>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">{t('sponsor.account.title')}</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>{t('sponsor.account.bank')}:</strong> 카카오뱅크</p>
                  <p><strong>{t('sponsor.account.number')}:</strong> 3333-12-3456789</p>
                  <p><strong>{t('sponsor.account.name')}:</strong> CultureChat</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {t('sponsor.page.donation.message')}
              </p>
            </div>
          </div>

          {/* 리뷰 요청 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              ⭐ {t('sponsor.page.review.title')}
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                {t('sponsor.page.review.message')}
              </p>
              
              {!reviewSubmitted ? (
                <div className="text-center space-y-4">
                  <div className="flex justify-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="text-4xl transition-all duration-200 hover:scale-110 focus:outline-none"
                      >
                        {star <= (hoveredRating || rating) ? '⭐' : '☆'}
                      </button>
                    ))}
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-3">
                      {rating > 0 ? `${rating}점을 선택하셨습니다` : '별점을 선택해주세요'}
                    </p>
                    
                    {rating > 0 && (
                      <button 
                        onClick={handleSubmitReview}
                        className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                      >
                        {t('sponsor.page.review.button')}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-4xl mb-3">🎉</div>
                  <p className="text-green-600 font-semibold text-lg mb-2">리뷰 제출 완료!</p>
                  <p className="text-gray-600">소중한 의견 감사합니다</p>
                  <div className="mt-3 flex justify-center">
                    {[...Array(rating)].map((_, i) => (
                      <span key={i} className="text-2xl">⭐</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 서비스 소개 */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">
            🚀 {t('sponsor.page.about.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🌍</div>
              <h3 className="font-semibold mb-2">{t('sponsor.page.about.feature1.title')}</h3>
              <p className="text-sm text-gray-600">{t('sponsor.page.about.feature1.desc')}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🤖</div>
              <h3 className="font-semibold mb-2">{t('sponsor.page.about.feature2.title')}</h3>
              <p className="text-sm text-gray-600">{t('sponsor.page.about.feature2.desc')}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💬</div>
              <h3 className="font-semibold mb-2">{t('sponsor.page.about.feature3.title')}</h3>
              <p className="text-sm text-gray-600">{t('sponsor.page.about.feature3.desc')}</p>
            </div>
          </div>
        </div>

        {/* 연락처 */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">
            📞 {t('sponsor.page.contact.title')}
          </h2>
          <div className="text-gray-600 space-y-2">
            <p><strong>Email:</strong> support@culturechat.com</p>
            <p><strong>GitHub:</strong> github.com/team30-aws-hackathon</p>
            <p><strong>Team:</strong> Team 30 - AWS Hackathon</p>
          </div>
        </div>
      </div>
    </div>
  );
}