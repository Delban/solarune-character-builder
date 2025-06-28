import { useState, useEffect, useMemo } from 'react';
import listeSorts from '../data/listeSorts.json';

interface SortFilterBarProps {
  onSearch: (query: string) => void;
  onEcoleFilter: (ecole: string) => void;
  onTypeFilter: (type: string) => void;
}

export function SortFilterBar({ onSearch, onEcoleFilter, onTypeFilter }: SortFilterBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [ecoleTerm, setEcoleTerm] = useState('');
  const [typeTerm, setTypeTerm] = useState('');
  const [showSortAjouteOnly, setShowSortAjouteOnly] = useState(false);
  const [showSortModifieOnly, setShowSortModifieOnly] = useState(false);

  useEffect(() => {
    onSearch(searchTerm);
  }, [searchTerm, onSearch]);

  useEffect(() => {
    onEcoleFilter(ecoleTerm);
  }, [ecoleTerm, onEcoleFilter]);

  useEffect(() => {
    onTypeFilter(typeTerm);
  }, [typeTerm, onTypeFilter]);

  useEffect(() => {
    if (showSortAjouteOnly) {
      setTypeTerm('Sort Ajouté');
      setShowSortModifieOnly(false);
    } else if (showSortModifieOnly) {
      setTypeTerm('Sort Modifié');
      setShowSortAjouteOnly(false);
    } else {
      setTypeTerm('');
    }
  }, [showSortAjouteOnly, showSortModifieOnly]);

  // Récupère tous les tags uniques d'école
  const allEcoles = useMemo(() => {
    const set = new Set<string>();
    (listeSorts as { ecole?: string }[]).forEach(sort => {
      if (sort.ecole) set.add(sort.ecole.trim());
    });
    return Array.from(set).sort();
  }, []);

  const isDark = typeof document !== "undefined" && document.body.classList.contains('dark');

  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Boutons pour filtrer par type de sort */}
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={() => setShowSortAjouteOnly(!showSortAjouteOnly)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            showSortAjouteOnly
              ? isDark
                ? 'bg-blue-600 text-white'
                : 'bg-blue-500 text-white'
              : isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {showSortAjouteOnly ? '✓ ' : ''}Sorts Ajoutés
        </button>

        <button
          onClick={() => setShowSortModifieOnly(!showSortModifieOnly)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            showSortModifieOnly
              ? isDark
                ? 'bg-green-600 text-white'
                : 'bg-green-500 text-white'
              : isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {showSortModifieOnly ? '✓ ' : ''}Sorts Modifiés
        </button>
        
        {(ecoleTerm || showSortAjouteOnly || showSortModifieOnly) && (
          <button
            className={`text-sm underline ${
              isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'
            }`}
            onClick={() => {
              setEcoleTerm('');
              setShowSortAjouteOnly(false);
              setShowSortModifieOnly(false);
            }}
            title="Réinitialiser tous les filtres"
          >
            Réinitialiser tous les filtres
          </button>
        )}
      </div>

      {/* Filtres par école */}
      <div className="w-full flex flex-wrap gap-2">
        {allEcoles.map((ecole) => (
          <span
            key={ecole}
            className={`inline-block text-xs font-semibold px-2 py-1 rounded-full border cursor-pointer transition ${
              ecoleTerm === ecole 
                ? 'ring-2 ring-purple-400' 
                : ''
            } ${
              isDark 
                ? 'bg-purple-900 text-purple-200 border-purple-700 hover:bg-purple-800' 
                : 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200'
            }`}
            onClick={() => setEcoleTerm(ecoleTerm === ecole ? '' : ecole)}
            title={`Filtrer par "${ecole}"`}
          >
            {ecole}
          </span>
        ))}
      </div>

      {/* Barre de recherche */}
      <input
        type="text"
        placeholder="Rechercher un sort..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={`px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
          isDark 
            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
            : 'bg-white border-gray-300 text-gray-900'
        }`}
      />
    </div>
  );
}
