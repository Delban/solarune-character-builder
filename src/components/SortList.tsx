import { useState, useMemo } from 'react';
import type { Sort } from '../models/Sort';
// Make sure SortCard.tsx exists in the same folder, or update the path if it's elsewhere
import { SortCard } from './SortCard';
import { SortFilterBar } from './SortFilterBar';

interface SortListProps {
  sorts: Sort[];
  onSelectSort: (sort: Sort) => void;
}

export function SortList({ sorts, onSelectSort }: SortListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [ecoleFilter, setEcoleFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const sortsFiltres = useMemo(() => {
    return sorts.filter((s) => {
      const matchesName = s.nom?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesEcole = !ecoleFilter
        ? true
        : (s.ecole || '').toLowerCase().includes(ecoleFilter.toLowerCase());
      const matchesType = !typeFilter
        ? true
        : (s.type || '').trim().toLowerCase() === typeFilter.trim().toLowerCase();
      return matchesName && matchesEcole && matchesType;
    });
  }, [sorts, searchQuery, ecoleFilter, typeFilter]);

  return (
    <div className="container mx-auto px-4">
      <SortFilterBar 
        onSearch={setSearchQuery} 
        onEcoleFilter={setEcoleFilter}
        onTypeFilter={setTypeFilter}
      />
      {sortsFiltres.length === 0 ? (
        <p className="text-center text-gray-500 mt-8 text-lg">Aucun sort trouvé</p>
      ) : (
        <div className="mt-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortsFiltres.map((sort) => (
            <SortCard key={sort.id} sort={sort} onClick={onSelectSort} />
          ))}
        </div>
      )}
    </div>
  );
}
