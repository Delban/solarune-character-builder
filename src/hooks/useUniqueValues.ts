import { useMemo } from 'react';
import type { Don } from '../models/Don';
import type { Sort } from '../models/Sort';

export function useUniqueValues() {
  // Pour les dons
  const getDonTypes = useMemo(() => (dons: Don[]): string[] => {
    const typesSet = new Set<string>();
    dons.forEach(don => {
      don.type.split(',').forEach(type => typesSet.add(type.trim()));
    });
    return Array.from(typesSet).sort();
  }, []);

  // Pour les dons dans le Character Builder
  const getDonCategories = useMemo(() => (dons: Don[]): string[] => {
    const categoriesSet = new Set<string>();
    dons.forEach(don => {
      don.type.split(',').forEach(category => categoriesSet.add(category.trim()));
    });
    return Array.from(categoriesSet).sort();
  }, []);

  // Pour les sorts
  const getSortEcoles = useMemo(() => (sorts: Sort[]): string[] => {
    const ecolesSet = new Set<string>();
    sorts.forEach(sort => {
      if (sort.ecole) ecolesSet.add(sort.ecole.trim());
    });
    return Array.from(ecolesSet).sort();
  }, []);

  const getSortClasses = useMemo(() => (sorts: Sort[]): string[] => {
    const classesSet = new Set<string>();
    sorts.forEach(sort => {
      if (sort.niveaux) {
        Object.keys(sort.niveaux).forEach(classe => classesSet.add(classe.trim()));
      }
    });
    return Array.from(classesSet).sort();
  }, []);

  return {
    getDonTypes,
    getDonCategories,
    getSortEcoles,
    getSortClasses
  };
}
