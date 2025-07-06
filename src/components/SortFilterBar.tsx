import React, { useMemo, useCallback, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useUniqueValues } from '../hooks/useUniqueValues';
import { useDebounce } from '../hooks/usePerformanceHooks';
import listeSorts from '../data/listeSorts.json';
import type { Sort } from '../models/Sort';

interface SortFilterBarProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  onEcoleFilter: (ecole: string) => void;
  onTypeFilter: (type: string) => void;
  onClasseFilter: (classe: string) => void;
  ecoleFilter: string;
  typeFilter: string;
  classeFilter: string;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const SortFilterBar = React.memo(({ 
  searchQuery,
  onSearch, 
  onEcoleFilter, 
  onTypeFilter, 
  onClasseFilter,
  ecoleFilter,
  typeFilter,
  classeFilter,
  onClearFilters,
  hasActiveFilters 
}: SortFilterBarProps) => {
  const { darkMode } = useTheme();
  const { getSortEcoles, getSortClasses } = useUniqueValues();

  // Debounce de la recherche pour améliorer les performances
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Effectue la recherche avec debounce
  useEffect(() => {
    if (debouncedSearch !== searchQuery) {
      onSearch(debouncedSearch);
    }
  }, [debouncedSearch]);

  // Récupère tous les tags uniques d'école et classes de manière optimisée
  const allEcoles = useMemo(() => 
    getSortEcoles(listeSorts as Sort[]), 
    [getSortEcoles]
  );

  const allClasses = useMemo(() => 
    getSortClasses(listeSorts as Sort[]), 
    [getSortClasses]
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // La recherche est maintenant debouncée automatiquement
    onSearch(e.target.value);
  }, [onSearch]);

  const handleEcoleClick = useCallback((ecole: string) => {
    const newEcole = ecoleFilter === ecole ? '' : ecole;
    onEcoleFilter(newEcole);
  }, [ecoleFilter, onEcoleFilter]);

  const handleClasseClick = useCallback((classe: string) => {
    const newClasse = classeFilter === classe ? '' : classe;
    onClasseFilter(newClasse);
  }, [classeFilter, onClasseFilter]);

  const handleSpecialFilter = useCallback((filterType: 'Sort Ajouté' | 'Sort Modifié') => {
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

  const tagClasses = (isSelected: boolean, colorScheme: string) => 
    `inline-block text-xs font-semibold px-2 py-1 rounded-full border cursor-pointer transition ${
      isSelected ? `ring-2 ring-${colorScheme}-400` : ''
    } ${
      darkMode 
        ? `bg-${colorScheme}-900 text-${colorScheme}-200 border-${colorScheme}-700 hover:bg-${colorScheme}-800` 
        : `bg-${colorScheme}-100 text-${colorScheme}-800 border-${colorScheme}-300 hover:bg-${colorScheme}-200`
    }`;

  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Boutons pour filtrer par type de sort */}
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={() => handleSpecialFilter('Sort Ajouté')}
          className={buttonClasses(typeFilter === 'Sort Ajouté', 'blue')}
        >
          {typeFilter === 'Sort Ajouté' ? '✓ ' : ''}Sorts Ajoutés
        </button>

        <button
          onClick={() => handleSpecialFilter('Sort Modifié')}
          className={buttonClasses(typeFilter === 'Sort Modifié', 'green')}
        >
          {typeFilter === 'Sort Modifié' ? '✓ ' : ''}Sorts Modifiés
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

      {/* Filtres par école */}
      <div className="w-full">
        <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Filtrer par École de Magie :
        </h3>
        <div className="flex flex-wrap gap-2">
          {allEcoles.map((ecole) => (
            <span
              key={ecole}
              className={tagClasses(ecoleFilter === ecole, 'purple')}
              onClick={() => handleEcoleClick(ecole)}
              title={`Filtrer par école "${ecole}"`}
            >
              {ecole}
            </span>
          ))}
        </div>
      </div>

      {/* Filtres par classe */}
      <div className="w-full">
        <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Filtrer par Classe :
        </h3>
        <div className="flex flex-wrap gap-2">
          {allClasses.map((classe) => (
            <span
              key={classe}
              className={tagClasses(classeFilter === classe, 'green')}
              onClick={() => handleClasseClick(classe)}
              title={`Filtrer par classe "${classe}"`}
            >
              {classe}
            </span>
          ))}
        </div>
      </div>

      {/* Barre de recherche */}
      <input
        type="text"
        placeholder="Rechercher un sort..."
        value={searchQuery}
        onChange={handleSearchChange}
        className={inputClasses}
      />
    </div>
  );
});

SortFilterBar.displayName = 'SortFilterBar';

export { SortFilterBar };
