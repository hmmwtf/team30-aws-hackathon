'use client';

import { useState, useEffect } from 'react';

const USAGE_KEY = 'culturechat_usage_count';
const INITIAL_FREE_USAGE = 3;
const SPONSOR_MODAL_INTERVAL = 10;

export const useUsageCounter = () => {
  const [usageCount, setUsageCount] = useState(0);
  const [showSponsorModal, setShowSponsorModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(USAGE_KEY);
    const count = stored ? parseInt(stored, 10) : 0;
    setUsageCount(count);
  }, []);

  const incrementUsage = () => {
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem(USAGE_KEY, newCount.toString());
    
    // 3회 후부터 10회마다 후원 모달 표시
    if (newCount >= INITIAL_FREE_USAGE && (newCount - INITIAL_FREE_USAGE) % SPONSOR_MODAL_INTERVAL === 0) {
      setShowSponsorModal(true);
    }
  };

  const resetUsage = () => {
    setUsageCount(0);
    localStorage.setItem(USAGE_KEY, '0');
  };

  const closeSponsorModal = () => {
    setShowSponsorModal(false);
  };

  return {
    usageCount,
    showSponsorModal,
    incrementUsage,
    resetUsage,
    closeSponsorModal,
    isLimitReached: usageCount >= INITIAL_FREE_USAGE,
    remainingUsage: Math.max(0, INITIAL_FREE_USAGE - usageCount)
  };
};