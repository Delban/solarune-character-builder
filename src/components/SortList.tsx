import React, { useCallback } from 'react';
import { useFilter } from '../hooks/useFilter';
import type { Sort } from '../models/Sort';
import { SortCard } from './SortCard';
import { SortFilterBar } from './SortFilterBar';

interface SortListProps {
  sorts: Sort[];
  onSelectSort: (sort: Sort) => void;
}

const SortList = React.memo(({ sorts, onSelectSort }: SortListProps) => {
  const {
    searchQuery,
    setSearchQuery,
    filters,
    updateFilter,
    clearFilters,
    filteredItems: sortsFiltres,
    hasActiveFilters
  } = useFilter({
    items: sorts,
    searchFields: ['nom', 'description', 'fonctionnement'],
    customFilters: [
      {
        key: 'ecole',
        apply: (sort, value) => {
          if (!value) return true;
          return (sort.ecole || '').toLowerCase().includes(value.toLowerCase());
        }
      },
      {
        key: 'type',
        apply: (sort, value) => {
          if (!value) return true;
          return (sort.type || '').trim().toLowerCase() === value.trim().toLowerCase();
        }
      },
      {
        key: 'classe',
        apply: (sort, value) => {
          if (!value) return true;
          return Boolean(sort.niveaux && Object.keys(sort.niveaux).some(classe => classe === value));
        }
      }
    ]
  });

  const handleEcoleFilter = useCallback((ecole: string) => {
    updateFilter('ecole', ecole);
  }, [updateFilter]);

  const handleTypeFilter = useCallback((type: string) => {
    updateFilter('type', type);
  }, [updateFilter]);

  const handleClasseFilter = useCallback((classe: string) => {
    updateFilter('classe', classe);
  }, [updateFilter]);

  return (
    <div className="container mx-auto px-4">
      <SortFilterBar 
        searchQuery={searchQuery}
        onSearch={setSearchQuery} 
        onEcoleFilter={handleEcoleFilter}
        onTypeFilter={handleTypeFilter}
        onClasseFilter={handleClasseFilter}
        ecoleFilter={filters.ecole || ''}
        typeFilter={filters.type || ''}
        classeFilter={filters.classe || ''}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />
      
      {sortsFiltres.length === 0 ? (
        <div className="text-center mt-8">
          <p className="text-gray-500 text-lg mb-4">
            {hasActiveFilters ? 'Aucun sort ne correspond aux critères de recherche' : 'Aucun sort trouvé'}
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
            {sortsFiltres.length} sort{sortsFiltres.length > 1 ? 's' : ''} trouvé{sortsFiltres.length > 1 ? 's' : ''}
            {hasActiveFilters && ` sur ${sorts.length} au total`}
          </div>
          <div className="mt-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortsFiltres.map((sort) => (
              <SortCard key={sort.id} sort={sort} onClick={onSelectSort} />
            ))}
          </div>
        </>
      )}
    </div>
  );
});

SortList.displayName = 'SortList';

export { SortList };
