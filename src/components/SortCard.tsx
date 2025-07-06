import React, { useCallback, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import type { Sort } from '../models/Sort';

interface SortCardProps {
  sort: Sort;
  onClick?: (s: Sort) => void;
}

// Fonction utilitaire optimisée
const getShortText = (text: string): string => {
  if (!text) return '';
  const words = text.split(/\s+/);
  if (words.length <= 80) return text;
  return words.slice(0, 80).join(' ') + '…';
};

const SortCard = React.memo(({ sort, onClick }: SortCardProps) => {
  const { darkMode } = useTheme();

  const handleCardClick = useCallback(() => {
    onClick?.(sort);
  }, [onClick, sort]);

  // Mémorise le texte des niveaux
  const niveauxText = useMemo(() => {
    if (sort.niveauInne) {
      return `Niveau ${sort.niveauInne}`;
    }
    if (sort.niveaux) {
      const niveauxList = Object.entries(sort.niveaux)
        .filter(([, niveau]) => niveau !== undefined)
        .map(([classe, niveau]) => `${classe} ${niveau}`)
        .join(', ');
      return niveauxList || 'Niveau inconnu';
    }
    return 'Niveau inconnu';
  }, [sort.niveauInne, sort.niveaux]);

  const cardClasses = `rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border p-6 cursor-pointer ${
    darkMode
      ? 'bg-gray-800 border-gray-700 text-gray-100'
      : 'bg-white border-gray-100 text-gray-900'
  }`;

  const ecoleTagClasses = `inline-block text-xs font-semibold px-2 py-1 rounded-full border ${
    darkMode 
      ? 'bg-purple-900 text-purple-200 border-purple-700' 
      : 'bg-purple-100 text-purple-800 border-purple-300'
  }`;

  const niveauTagClasses = `inline-block text-xs font-semibold px-2 py-1 rounded-full border ${
    darkMode 
      ? 'bg-green-900 text-green-200 border-green-700' 
      : 'bg-green-100 text-green-800 border-green-300'
  }`;

  const typeTagClasses = `inline-block text-xs font-semibold px-2 py-1 rounded-full border ${
    darkMode 
      ? 'bg-blue-900 text-blue-200 border-blue-700' 
      : 'bg-blue-100 text-blue-800 border-blue-300'
  }`;

  const textClasses = darkMode ? "text-gray-300" : "text-gray-600";

  return (
    <div className={cardClasses} onClick={handleCardClick}>
      <h2 className="text-lg font-bold mb-2">{sort.nom}</h2>
      <div className="flex flex-wrap gap-2 mb-1">
        {sort.ecole && (
          <span className={ecoleTagClasses}>
            {sort.ecole}
          </span>
        )}
        <span className={niveauTagClasses}>
          {niveauxText}
        </span>
        {sort.type && (
          <span className={typeTagClasses}>
            {sort.type}
          </span>
        )}
      </div>
      <p className={textClasses}>
        {getShortText(sort.description || sort.fonctionnement)}
      </p>
    </div>
  );
});

SortCard.displayName = 'SortCard';

export { SortCard };
