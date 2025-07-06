// src/components/DonList.tsx
import React, { useCallback } from 'react';
import { useFilter } from '../hooks/useFilter';
import type { Don } from '../models/Don';
import { DonCard } from './DonCard';
import { FilterBar } from './FilterBar';

interface DonListProps {
  dons: Don[];
  onSelectDon: (don: Don) => void;
}

/**
 * Affiche la liste complète de dons en grille,
 * avec possibilité de recherche et filtrage par type.
 */
const DonList = React.memo(({ dons, onSelectDon }: DonListProps) => {
  const {
    searchQuery,
    setSearchQuery,
    filters,
    updateFilter,
    clearFilters,
    filteredItems: donsFiltres,
    hasActiveFilters
  } = useFilter({
    items: dons,
    searchFields: ['nom', 'description', 'fonctionnement'],
    customFilters: [
      {
        key: 'type',
        apply: (don, value) => {
          if (!value) return true;
          return don.type?.toLowerCase().includes(value.toLowerCase()) || false;
        }
      }
    ]
  });

  const handleTypeFilter = useCallback((type: string) => {
    updateFilter('type', type);
  }, [updateFilter]);

  return (
    <div className="container mx-auto px-4">
      <FilterBar 
        searchQuery={searchQuery}
        onSearch={setSearchQuery} 
        onTypeFilter={handleTypeFilter}
        typeFilter={filters.type || ''}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {donsFiltres.length === 0 ? (
        <div className="text-center mt-8">
          <p className="text-gray-500 text-lg mb-4">
            {hasActiveFilters ? 'Aucun don ne correspond aux critères de recherche' : 'Aucun don trouvé'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="text-center mb-4 text-sm text-gray-600">
            {donsFiltres.length} don{donsFiltres.length > 1 ? 's' : ''} trouvé{donsFiltres.length > 1 ? 's' : ''}
            {hasActiveFilters && ` sur ${dons.length} au total`}
          </div>
          <div className="mt-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {donsFiltres.map((don) => (
              <DonCard key={don.id} don={don} onClick={onSelectDon} />
            ))}
          </div>
        </>
      )}
    </div>
  );
});

DonList.displayName = 'DonList';

export { DonList };
