'use client';

import { useState } from 'react';
import { Language, getTranslation } from '../lib/i18n';

interface SponsorModalProps {
  isOpen: boolean;
  onClose: () => void;
  usageCount: number;
  language?: Language;
}

export default function SponsorModal({ isOpen, onClose, usageCount, language = 'ko' }: SponsorModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  
  const t = (key: string) => getTranslation(language, key);
  
  const handleStarClick = (starIndex: number) => {
    setRating(starIndex);
  };
  
  const handleSubmitReview = () => {
    if (rating > 0) {
      // 실제로는 여기서 리뷰 제출 API를 호출
      console.log(`사용자가 ${rating}점을 주었습니다`);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setRating(0);
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="text-4xl mb-4">🙏</div>
          <h2 className="text-xl font-bold mb-4">{t('sponsor.title')}</h2>
          <p className="text-gray-600 mb-4">
            지금까지 {usageCount}번 사용하셨습니다. 서비스 개선을 위해 후원이나 리뷰를 부탁드립니다!
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">{t('sponsor.account.title')}</h3>
            <div className="text-sm text-gray-700">
              <p>{t('sponsor.account.bank')}: 카카오뱅크</p>
              <p>{t('sponsor.account.number')}: 3333-12-3456789</p>
              <p>{t('sponsor.account.name')}: CultureChat</p>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2">{t('sponsor.review.title')}</h3>
            <p className="text-sm text-gray-700 mb-2">
              {t('sponsor.review.message')}
            </p>
            
            {!submitted ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="flex justify-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="text-3xl transition-all duration-200 hover:scale-110 focus:outline-none"
                    >
                      {star <= (hoveredRating || rating) ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    {rating > 0 ? `${rating}점을 선택하셨습니다` : '별점을 선택해주세요'}
                  </p>
                  
                  {rating > 0 && (
                    <button
                      onClick={handleSubmitReview}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      리뷰 제출하기
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-3xl mb-2">🎉</div>
                <p className="text-green-600 font-semibold">리뷰 제출 완료!</p>
                <p className="text-sm text-gray-600">소중한 의견 감사합니다</p>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              {t('sponsor.later')}
            </button>
            <button
              onClick={() => {
                window.open('/sponsor', '_blank');
                onClose();
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t('sponsor.support')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}