import { useState, useMemo, useCallback, useRef } from 'react';
import type { Don } from '../models/Don';
import type { Sort } from '../models/Sort';

interface UseFilterOptions<T> {
  items: T[];
  searchFields: (keyof T)[];
  customFilters?: Array<{
    key: string;
    apply: (item: T, value: string) => boolean;
  }>;
}

export function useFilter<T extends Don | Sort>({ 
  items, 
  searchFields, 
  customFilters = [] 
}: UseFilterOptions<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  
  // Cache pour optimiser les filtres répétés
  const filterCache = useRef<Map<string, T[]>>(new Map());

  const filteredItems = useMemo(() => {
    // Créer une clé de cache unique
    const cacheKey = `${searchQuery}|${JSON.stringify(filters)}|${items.length}`;
    
    // Vérifier le cache
    const cached = filterCache.current.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Filtrage optimisé
    const result = items.filter((item) => {
      // Filtrage par recherche textuelle optimisé
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches = searchFields.some(field => {
          const value = item[field];
          return typeof value === 'string' && 
            value.toLowerCase().includes(query);
        });
        if (!matches) return false;
      }

      // Filtrage par filtres personnalisés optimisé
      for (const filter of customFilters) {
        const filterValue = filters[filter.key];
        if (filterValue && !filter.apply(item, filterValue)) {
          return false;
        }
      }

      return true;
    });

    // Mettre en cache avec limite
    if (filterCache.current.size > 50) {
      filterCache.current.clear();
    }
    filterCache.current.set(cacheKey, result);

    return result;
  }, [items, searchQuery, filters, searchFields, customFilters]);

  const updateFilter = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setFilters({});
  }, []);

  const resetFilter = useCallback((key: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    filters,
    updateFilter,
    clearFilters,
    resetFilter,
    filteredItems,
    hasActiveFilters: searchQuery !== '' || Object.keys(filters).length > 0
  };
}
