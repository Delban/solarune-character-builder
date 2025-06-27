// src/components/FilterBar.tsx
import { useState, useEffect, useMemo } from 'react';
import listeDons from '../data/listeDons.json';

interface FilterBarProps {
  onSearch: (query: string) => void;
  onTypeFilter: (type: string) => void;
}

export function FilterBar({ onSearch, onTypeFilter }: FilterBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeTerm, setTypeTerm] = useState('');

  useEffect(() => {
    onSearch(searchTerm);
  }, [searchTerm, onSearch]);

  useEffect(() => {
    onTypeFilter(typeTerm);
  }, [typeTerm, onTypeFilter]);

  // Ajoute un listener pour filtrer par type via les tags cliqués
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<string>;
      setTypeTerm(custom.detail);
    };
    window.addEventListener('filterByType', handler);
    return () => window.removeEventListener('filterByType', handler);
  }, []);

  // Récupère tous les tags uniques de type
  const allTypes = useMemo(() => {
    const typesSet = new Set<string>();
    (listeDons as { type: string }[]).forEach(don => {
      don.type.split(',').forEach(type => typesSet.add(type.trim()));
    });
    return Array.from(typesSet).sort();
  }, []);

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      {/* Affiche tous les tags au-dessus du champ de filtre associé */}
      <div className="w-full mb-2 flex flex-wrap gap-2">
        {allTypes.map((type) => (
          <span
            key={type}
            className={`inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full border border-blue-300 cursor-pointer hover:bg-blue-200 transition ${typeTerm === type ? 'ring-2 ring-blue-400' : ''}`}
            onClick={() => setTypeTerm(typeTerm === type ? '' : type)}
            title={`Filtrer par "${type}"`}
          >
            {type}
          </span>
        ))}
        {typeTerm && (
          <button
            className="ml-2 text-xs text-red-600 underline"
            onClick={() => setTypeTerm('')}
            title="Réinitialiser le filtre"
          >
            Réinitialiser
          </button>
        )}
      </div>
      <input
        type="text"
        placeholder="Rechercher un don..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
      />
    </div>
  );
}
