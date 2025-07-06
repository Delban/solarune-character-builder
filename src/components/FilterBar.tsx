// src/components/FilterBar.tsx
import React, { useEffect, useMemo, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useUniqueValues } from '../hooks/useUniqueValues';
import { useDebounce } from '../hooks/usePerformanceHooks';
import listeDons from '../data/listeDons.json';
import type { Don } from '../models/Don';

interface FilterBarProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  onTypeFilter: (type: string) => void;
  typeFilter: string;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const FilterBar = React.memo(({ 
  searchQuery, 
  onSearch, 
  onTypeFilter, 
  typeFilter,
  onClearFilters,
  hasActiveFilters 
}: FilterBarProps) => {
  const { darkMode } = useTheme();
  const { getDonTypes } = useUniqueValues();

  // Debounce de la recherche pour améliorer les performances
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Effectue la recherche avec debounce
  useEffect(() => {
    if (debouncedSearch !== searchQuery) {
      onSearch(debouncedSearch);
    }
  }, [debouncedSearch]);

  // Ajoute un listener pour filtrer par type via les tags cliqués
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<string>;
      onTypeFilter(custom.detail);
    };
    window.addEventListener('filterByType', handler);
    return () => window.removeEventListener('filterByType', handler);
  }, [onTypeFilter]);

  // Récupère tous les tags uniques de type de manière optimisée
  const allTypes = useMemo(() => {
    const types = getDonTypes(listeDons as Don[]);
    // Exclut les types spéciaux qui ont leurs propres boutons
    return types.filter(type => 
      type !== 'Don Ajouté' && 
      type !== 'Don Modifié'
    );
  }, [getDonTypes]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // La recherche est maintenant debouncée automatiquement
    onSearch(e.target.value);
  }, [onSearch]);

  const handleTypeClick = useCallback((type: string) => {
    const newType = typeFilter === type ? '' : type;
    onTypeFilter(newType);
  }, [typeFilter, onTypeFilter]);

  const handleSpecialFilter = useCallback((filterType: 'Don Ajouté' | 'Don Modifié') => {
    const newFilter = typeFilter === filterType ? '' : filterType;
    onTypeFilter(newFilter);
  }, [typeFilter, onTypeFilter]);

  const inputClasses = `px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all ${
    darkMode 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
      : 'bg-white border-gray-300 text-gray-900'
  }`;

  const buttonClasses = (isActive: boolean, baseColor: string) => 
    `px-4 py-2 rounded-lg font-medium transition-colors ${
      isActive
        ? darkMode
          ? `bg-${baseColor}-600 text-white`
          : `bg-${baseColor}-500 text-white`
        : darkMode
          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    }`;

  const tagClasses = (isSelected: boolean) => 
    `inline-block text-xs font-semibold px-2 py-1 rounded-full border cursor-pointer transition ${
      isSelected ? 'ring-2 ring-blue-400' : ''
    } ${
      darkMode 
        ? 'bg-blue-900 text-blue-200 border-blue-700 hover:bg-blue-800' 
        : 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200'
    }`;

  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Boutons pour filtrer par type de don */}
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={() => handleSpecialFilter('Don Ajouté')}
          className={buttonClasses(typeFilter === 'Don Ajouté', 'blue')}
        >
          {typeFilter === 'Don Ajouté' ? '✓ ' : ''}Dons Ajoutés
        </button>

        <button
          onClick={() => handleSpecialFilter('Don Modifié')}
          className={buttonClasses(typeFilter === 'Don Modifié', 'green')}
        >
          {typeFilter === 'Don Modifié' ? '✓ ' : ''}Dons Modifiés
        </button>
        
        {hasActiveFilters && (
          <button
            className={`text-sm underline transition-colors ${
              darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'
            }`}
            onClick={onClearFilters}
            title="Réinitialiser tous les filtres"
          >
            Réinitialiser tous les filtres
          </button>
        )}
      </div>

      {/* Affiche tous les tags au-dessus du champ de filtre associé */}
      <div className="w-full flex flex-wrap gap-2">
        {allTypes.map((type) => (
          <span
            key={type}
            className={tagClasses(typeFilter === type)}
            onClick={() => handleTypeClick(type)}
            title={`Filtrer par "${type}"`}
          >
            {type}
          </span>
        ))}
      </div>

      {/* Barre de recherche */}
      <input
        type="text"
        placeholder="Rechercher un don..."
        value={searchQuery}
        onChange={handleSearchChange}
        className={inputClasses}
      />
    </div>
  );
});

FilterBar.displayName = 'FilterBar';

export { FilterBar };
