import React, { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { BackIcon } from './icons/Icons';
import type { Sort } from '../models/Sort';

interface SortDetailsProps {
  sort: Sort;
  onBack: () => void;
  allSorts: Sort[];
}

const SortDetails = React.memo(({ sort, onBack }: SortDetailsProps) => {
  const { darkMode } = useTheme();
  
  // Fonction pour afficher les niveaux des classes (mémorisée)
  const niveauxText = useMemo(() => {
    if (sort.niveauInne) {
      return `Niveau ${sort.niveauInne}`;
    }
    if (sort.niveaux) {
      const niveauxList = Object.entries(sort.niveaux)
        .filter(([, niveau]) => niveau !== undefined)
        .map(([classe, niveau]) => `${classe} ${niveau}`)
        .join(', ');
      return niveauxList || 'Niveau inconnu';
    }
    return 'Niveau inconnu';
  }, [sort.niveauInne, sort.niveaux]);

  const containerClasses = `${
    darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
  } rounded-lg shadow-lg p-6`;

  const buttonClasses = `flex items-center gap-2 mb-6 px-4 py-2 font-medium rounded-lg transition-all duration-200 ${
    darkMode
      ? "bg-gray-700 hover:bg-gray-600 text-white"
      : "bg-blue-500 hover:bg-blue-600 text-white"
  }`;

  const ecoleTagClasses = `inline-block text-xs font-semibold px-2 py-1 rounded-full border ${
    darkMode 
      ? 'bg-purple-900 text-purple-200 border-purple-700' 
      : 'bg-purple-100 text-purple-800 border-purple-300'
  }`;

  const niveauTagClasses = `inline-block text-xs font-semibold px-2 py-1 rounded-full border ${
    darkMode 
      ? 'bg-green-900 text-green-200 border-green-700' 
      : 'bg-green-100 text-green-800 border-green-300'
  }`;

  const typeTagClasses = `inline-block text-xs font-semibold px-2 py-1 rounded-full border ${
    darkMode 
      ? 'bg-blue-900 text-blue-200 border-blue-700' 
      : 'bg-blue-100 text-blue-800 border-blue-300'
  }`;

  const specialClasses = `mt-4 ${
    darkMode ? "bg-yellow-900 border-yellow-700" : "bg-yellow-100 border-yellow-500"
  } border-l-4 p-3`;

  const detailFields = [
    { label: 'Composantes', value: sort.composantes?.join(', ') },
    { label: 'Temps d\'incantation', value: sort.tempsIncantation },
    { label: 'Portée', value: sort.portee },
    { label: 'Cible', value: sort.cible },
    { label: 'Zone d\'effet/Cible', value: sort.zoneEffetCible },
    { label: 'Durée', value: sort.duree },
    { label: 'Jet de sauvegarde', value: sort.jetSauvegarde },
    { label: 'Résistance à la magie', value: sort.resistanceMagie },
    { label: 'Contresort supplémentaire', value: sort.contresortSupplementaire }
  ].filter(field => field.value);

  return (
    <div className={containerClasses}>
      <button onClick={onBack} className={buttonClasses}>
        <BackIcon className="w-4 h-4" />
        Retour à la liste
      </button>
      
      <h2 className="text-2xl font-bold mb-2">{sort.nom}</h2>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {sort.ecole && (
          <span className={ecoleTagClasses}>
            {sort.ecole}
          </span>
        )}
        <span className={niveauTagClasses}>
          {niveauxText}
        </span>
        {sort.type && (
          <span className={typeTagClasses}>
            {sort.type}
          </span>
        )}
      </div>
      
      {/* Informations détaillées du sort */}
      {detailFields.length > 0 && (
        <div className="space-y-4 mb-6">
          {detailFields.map(({ label, value }) => (
            <div key={label}>
              <span className="font-semibold">{label} : </span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6">
        <span className="font-semibold">Fonctionnement : </span>
        <p className="whitespace-pre-wrap mt-2">{sort.fonctionnement}</p>
      </div>
      
      <p className="mt-4">
        <span className="font-semibold">Utilisation : </span>
        {sort.utilisation}
      </p>
      
      {sort.special && (
        <div className={specialClasses}>
          <p className="font-semibold">Spécial :</p>
          <p className="whitespace-pre-wrap">{sort.special}</p>
        </div>
      )}
    </div>
  );
});

SortDetails.displayName = 'SortDetails';

export { SortDetails };
