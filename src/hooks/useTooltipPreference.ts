import { useState, useEffect } from 'react';

export function useTooltipPreference() {
  const [showTooltips, setShowTooltips] = useState<boolean>(() => {
    const saved = localStorage.getItem('showTooltips');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('showTooltips', JSON.stringify(showTooltips));
  }, [showTooltips]);

  const toggleTooltips = () => setShowTooltips(prev => !prev);

  return {
    showTooltips,
    toggleTooltips
  };
} 