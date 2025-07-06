// src/components/DonCard.tsx
import React, { useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import type { Don } from '../models/Don';

interface DonCardProps {
  don: Don;
  onClick?: (d: Don) => void;
}

// Fonction utilitaire optimisée
const getShortText = (text: string): string => {
  if (!text) return '';
  const words = text.split(/\s+/);
  if (words.length <= 80) return text;
  return words.slice(0, 80).join(' ') + '…';
};

const DonCard = React.memo(({ don, onClick }: DonCardProps) => {
  const { darkMode } = useTheme();

  const handleTagClick = useCallback((e: React.MouseEvent, type: string) => {
    e.stopPropagation();
    // Déclenche un event personnalisé pour le filtre par type
    const customEvent = new CustomEvent('filterByType', { detail: type.trim() });
    window.dispatchEvent(customEvent);
  }, []);

  const handleCardClick = useCallback(() => {
    onClick?.(don);
  }, [onClick, don]);

  const cardClasses = `rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border p-6 cursor-pointer ${
    darkMode
      ? 'bg-gray-800 border-gray-700 text-gray-100'
      : 'bg-white border-gray-100 text-gray-900'
  }`;

  const tagClasses = `inline-block text-xs font-semibold px-2 py-1 rounded-full border cursor-pointer transition ${
    darkMode
      ? 'bg-blue-900 text-blue-100 border-blue-700 hover:bg-blue-800'
      : 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200'
  }`;

  const textClasses = darkMode ? "text-gray-300" : "text-gray-600";

  return (
    <div className={cardClasses} onClick={handleCardClick}>
      <h2 className="text-lg font-bold mb-2">{don.nom}</h2>
      <div className="flex flex-wrap gap-2 mb-1">
        {don.type.split(',').map((type, idx) => (
          <span
            key={idx}
            className={tagClasses}
            onClick={(e) => handleTagClick(e, type)}
            title={`Filtrer par "${type.trim()}"`}
          >
            {type.trim()}
          </span>
        ))}
      </div>
      <p className={textClasses}>
        {getShortText(don.description || don.fonctionnement)}
      </p>
    </div>
  );
});

DonCard.displayName = 'DonCard';

export { DonCard };
