// src/components/DonList.tsx
import { useState, useMemo } from 'react';
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
export function DonList({ dons, onSelectDon }: DonListProps) {
  console.log("DonList dons:", dons);

  // États pour la recherche et le filtre « type »
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Mémo : recolter la liste de dons filtrés
  const donsFiltres = useMemo(() => {
    return dons.filter((d) => {
      const matchesName = d.nom?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === ''
        ? true
        : d.type?.toLowerCase().includes(typeFilter.toLowerCase());

      return matchesName && matchesType;
    });
  }, [dons, searchQuery, typeFilter]);

  return (
    <div className="container mx-auto px-4">
      <FilterBar onSearch={setSearchQuery} onTypeFilter={setTypeFilter} />

      {donsFiltres.length === 0 ? (
        <p className="text-center text-gray-500 mt-8 text-lg">Aucun don trouvé</p>
      ) : (
        <div className="mt-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {donsFiltres.map((don) => (
            <DonCard key={don.id} don={don} onClick={onSelectDon} />
          ))}
        </div>
      )}
    </div>
  );
}
